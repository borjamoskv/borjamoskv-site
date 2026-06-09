import unittest
import os
import sys
import json
import urllib.request
import urllib.error
import time
import socket
import subprocess
from concurrent.futures import ThreadPoolExecutor

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from tests.e2e.mock_server import MockSubstackServer

def is_port_open(host, port):
    try:
        with socket.create_connection((host, port), timeout=0.5):
            return True
    except Exception:
        return False

class SubstackExergyAdversarialTestCase(unittest.TestCase):
    mock_server = None
    astro_process = None
    mock_port = 8012
    astro_port = 4321

    @classmethod
    def setUpClass(cls):
        cls.target_api_url = f"http://localhost:{cls.astro_port}"
        cls.mock_server_url = f"http://127.0.0.1:{cls.mock_port}"
        
        # 1. Start Mock Server
        print(f"[*] Starting Mock Server on port {cls.mock_port}...")
        cls.mock_server = MockSubstackServer(host="127.0.0.1", port=cls.mock_port)
        cls.mock_server.start()
        
        # 2. Start Astro Server
        print(f"[*] Starting Astro Server on port {cls.astro_port}...")
        env = os.environ.copy()
        env["MOCK_SERVER_PORT"] = str(cls.mock_port)
        cls.astro_process = subprocess.Popen(
            ["npx", "astro", "dev", "--port", str(cls.astro_port)],
            cwd=os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            env=env
        )
        
        # Wait for Astro to start
        start_time = time.time()
        started = False
        while time.time() - start_time < 15.0:
            if is_port_open("localhost", cls.astro_port):
                started = True
                break
            time.sleep(0.5)
            
        if not started:
            raise RuntimeError("Astro dev server failed to start on port 4321")
        print("[✓] Astro and Mock servers are up and running.")

        cls.js_suite_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "adversarial_suite.js"))

    @classmethod
    def tearDownClass(cls):
        print("\n[*] Tearing down servers...")
        if cls.mock_server:
            cls.mock_server.stop()
        if cls.astro_process:
            cls.astro_process.terminate()
            try:
                cls.astro_process.wait(timeout=3.0)
            except subprocess.TimeoutExpired:
                cls.astro_process.kill()
        print("[✓] Servers stopped.")

    def test_js_adversarial_suite(self):
        """1. Executes the JS adversarial suite to verify unit-level concurrency, stale lock, and chain reset issues."""
        cmd = ["node", self.js_suite_path]
        result = subprocess.run(cmd, capture_output=True, text=True)
        print("JS Suite stdout:\n", result.stdout)
        if result.stderr:
            print("JS Suite stderr:\n", result.stderr)
        self.assertEqual(result.returncode, 0, "JS adversarial suite exited with non-zero code")
        
        # Assert that the suite successfully identified the vulnerabilities
        self.assertIn("Concurrency race condition detected", result.stdout)
        self.assertIn("Lockout is permanent", result.stdout)
        self.assertIn("Chain reset vulnerability verified", result.stdout)

    def test_api_concurrency_race(self):
        """2. Fires parallel requests to /api/exergy-cron to verify concurrent deduplication bypass / write race."""
        # We use subdomain=borjamoskv so it works even if Astro dev server runs in an environment 
        # where MOCK_SERVER_PORT isn't correctly inherited by the node child process.
        url = f"{self.target_api_url}/api/exergy-cron?subdomain=borjamoskv&scenario=happy-es"
        
        def send_request():
            req = urllib.request.Request(url, method="POST")
            try:
                with urllib.request.urlopen(req, timeout=5) as res:
                    return json.loads(res.read().decode('utf-8'))
            except Exception as e:
                # Read response body if available
                if isinstance(e, urllib.error.HTTPError):
                    return {"success": False, "status": e.code, "error": e.read().decode()}
                return {"success": False, "error": str(e)}

        # Send 2 requests concurrently
        with ThreadPoolExecutor(max_workers=2) as executor:
            futures = [executor.submit(send_request) for _ in range(2)]
            results = [f.result() for f in futures]

        print("API Concurrency Results:", results)
        
        # Both parallel requests should return success: true since they race and bypass deduplication checks
        success_count = sum(1 for r in results if r.get("success") is True)
        self.assertEqual(success_count, 2, f"Parallel requests failed or were blocked instead of racing: {results}")

    def test_api_invalid_json_handling(self):
        """3. Verifies API handles malformed JSON requests gracefully without crashing."""
        url = f"{self.target_api_url}/api/exergy-cron"
        req = urllib.request.Request(url, data=b"{invalid-json-body", method="POST")
        req.add_header("Content-Type", "application/json")
        try:
            with urllib.request.urlopen(req, timeout=5) as res:
                body = json.loads(res.read().decode('utf-8'))
                # Should return success: true since it handles parsing failures in body and defaults scenario
                self.assertTrue(body.get("success"))
        except urllib.error.HTTPError as e:
            self.fail(f"API crashed on invalid JSON payload with status {e.code}")

if __name__ == "__main__":
    unittest.main()
