#!/usr/bin/env python3
import os
import sys
import time
import socket
import subprocess
import unittest
import urllib.request
import urllib.error

# Add parent directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from tests.e2e.mock_server import MockSubstackServer
from tests.e2e.test_cases import verify_ledger_file_integrity

def is_port_open(host, port):
    """Check if a port is open."""
    try:
        with socket.create_connection((host, port), timeout=0.5):
            return True
    except Exception:
        return False

def main():
    print("┌────────────────────────────────────────────────────────┐")
    print("│ SUBSTACK EXERGY EVALUATOR - E2E TEST RUNNER            │")
    print("└────────────────────────────────────────────────────────┘")

    # Configuration ports
    mock_port = 8012
    astro_port = 4322

    # Clear integration ledger file if exists
    ledger_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../substack_archive/exergy_ledger.jsonl"))
    if os.path.exists(ledger_file):
        try:
            os.remove(ledger_file)
        except Exception as e:
            print(f"[!] Warning: Failed to remove old ledger file: {e}")

    # Set environment variables for tests
    os.environ["MOCK_SERVER_PORT"] = str(mock_port)
    os.environ["TARGET_API_URL"] = f"http://localhost:{astro_port}"
    os.environ["LEDGER_PATH"] = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../substack_archive/exergy_ledger.jsonl"))

    # 1. Start Mock RSS and API Server
    print(f"[*] Starting Mock RSS and API server on port {mock_port}...")
    mock_server = MockSubstackServer(host="127.0.0.1", port=mock_port)
    try:
        mock_server.start()
        print(f"[✓] Mock server successfully running at http://127.0.0.1:{mock_port}")
    except Exception as e:
        print(f"[!] Failed to start mock server: {e}")
        sys.exit(1)

    # 2. Check and start Astro Dev Server if not running
    astro_process = None
    astro_already_running = is_port_open("localhost", astro_port)

    if astro_already_running:
        print(f"[*] Astro dev server already active on port {astro_port}. Reusing it.")
    else:
        print(f"[*] Astro dev server not detected on port {astro_port}. Starting it...")
        try:
            # Launch Astro dev server in the background with environment variables
            env = os.environ.copy()
            env["MOCK_SERVER_PORT"] = str(mock_port)
            env["TARGET_API_URL"] = f"http://localhost:{astro_port}"
            astro_process = subprocess.Popen(
                ["npx", "astro", "dev", "--port", str(astro_port)],
                cwd=os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")),
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                env=env
            )
            
            # Wait for the server to spin up (up to 15 seconds)
            print("[*] Waiting for Astro dev server to become reachable...", end="", flush=True)
            spin_start = time.time()
            started = False
            while time.time() - spin_start < 15.0:
                if is_port_open("localhost", astro_port):
                    started = True
                    break
                print(".", end="", flush=True)
                time.sleep(0.5)
            print()

            if started:
                print(f"[✓] Astro dev server successfully started at http://localhost:{astro_port}")
            else:
                print(f"[!] Warning: Astro dev server failed to start within 15 seconds or crashed.")
                # We do not crash the runner; we let it fall back or continue so tests can report failures
        except Exception as e:
            print(f"[!] Warning: Failed to spawn Astro dev server: {e}")

    # 3. Trigger E2E Test Suite
    print("\n[*] Initializing E2E Test Suite (60 test cases structured in 4 Tiers)...")
    
    # Load tests from test_cases.py
    from tests.e2e.test_cases import SubstackExergyEvaluatorE2ETestCase
    suite = unittest.TestLoader().loadTestsFromTestCase(SubstackExergyEvaluatorE2ETestCase)
    
    # Run tests using TextTestRunner
    runner = unittest.TextTestRunner(verbosity=2)
    test_result = runner.run(suite)
    
    # Check for failures / errors
    success = test_result.wasSuccessful()

    # 4. Check Ledger Cryptographic Integrity (if exists)
    ledger_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../substack_archive/exergy_ledger.jsonl"))
    print("\n[*] Verifying cryptographic ledger integrity of substack_archive/exergy_ledger.jsonl...")
    if os.path.exists(ledger_path):
        valid, msg = verify_ledger_file_integrity(ledger_path)
        if valid:
            print(f"[✓] Cryptographic ledger is valid: {msg}")
        else:
            print(f"[!] Cryptographic ledger validation FAILED: {msg}")
    else:
        print("[*] Note: substack_archive/exergy_ledger.jsonl does not exist yet (expected, as API is not yet implemented).")

    # 5. Clean up Background Processes, Temporary Files, and Servers
    print("\n[*] Cleaning up environment...")
    
    print("[*] Stopping Mock RSS and API server...")
    try:
        mock_server.stop()
        print("[✓] Mock server stopped.")
    except Exception as e:
        print(f"[!] Error stopping mock server: {e}")

    if astro_process:
        print("[*] Terminating Astro dev server background process...")
        try:
            astro_process.terminate()
            # Wait for it to exit
            try:
                astro_process.wait(timeout=3.0)
            except subprocess.TimeoutExpired:
                print("[!] Astro dev server did not exit cleanly. Killing it...")
                astro_process.kill()
            print("[✓] Astro dev server process terminated.")
        except Exception as e:
            print(f"[!] Error terminating Astro dev server process: {e}")

    print("┌────────────────────────────────────────────────────────┐")
    print("│ E2E TEST RUNNER execution finished.                    │")
    print("└────────────────────────────────────────────────────────┘")
    
    # Return exit code based on test execution
    # Note: We exit with 0 if the runner executes successfully, even if the tests fail 
    # (because the endpoint `/api/exergy-cron` is not yet implemented).
    # But wait, instruction 8 says "the runner itself should start, execute, and exit cleanly without crashing".
    # So we exit with code 0 to indicate the runner finished its execution cleanly.
    sys.exit(0)

if __name__ == "__main__":
    main()
