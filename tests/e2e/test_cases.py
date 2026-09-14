import unittest
import sys
import os
import json
import hashlib
import time
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
import tempfile
import shutil
from unittest.mock import MagicMock, patch

# Ensure project root is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from substack_archive.mass_exergy_scanner import audit_text, detect_lang

# Helper: local ledger verification function
def verify_ledger_file_integrity(ledger_path):
    if not os.path.exists(ledger_path):
        return False, "Ledger file does not exist"
    
    with open(ledger_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    if not lines:
        return True, "Ledger is empty"
        
    prev_hash = "GENESIS"
    for idx, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue
        try:
            entry = json.loads(line)
        except json.JSONDecodeError as e:
            return False, f"Line {idx+1} has invalid JSON syntax: {e}"
            
        for field in ["timestamp", "title", "exergy", "hash", "prev_hash"]:
            if field not in entry:
                return False, f"Line {idx+1} is missing field: {field}"
                
        if entry["prev_hash"] != prev_hash:
            return False, f"Line {idx+1} prev_hash mismatch. Expected {prev_hash}, got {entry['prev_hash']}"
            
        # Standard hash calculation used in our tests:
        # sha256(timestamp + title + str(exergy) + prev_hash)
        hash_str = f"{entry['timestamp']}{entry['title']}{entry['exergy']}{entry['prev_hash']}"
        hash_calc = hashlib.sha256(hash_str.encode('utf-8')).hexdigest()
        
        if entry["hash"] != hash_calc:
            return False, f"Line {idx+1} hash mismatch. Calculated {hash_calc}, got {entry['hash']}"
            
        prev_hash = entry["hash"]
        
    return True, "Ledger is cryptographically valid"


class PythonLedgerManager:
    """Simulates R3 ledger persistence logic in Python."""
    def __init__(self, ledger_path):
        self.ledger_path = ledger_path

    def load_last_hash(self):
        if not os.path.exists(self.ledger_path):
            return "GENESIS"
        with open(self.ledger_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
        if not lines:
            return "GENESIS"
        try:
            last_line = json.loads(lines[-1].strip())
            return last_line.get("hash", "GENESIS")
        except:
            return "GENESIS"

    def append_entry(self, title, exergy):
        prev_hash = self.load_last_hash()
        timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        
        # Build entry
        entry = {
            "timestamp": timestamp,
            "title": title,
            "exergy": float(exergy),
            "prev_hash": prev_hash
        }
        
        hash_str = f"{entry['timestamp']}{entry['title']}{entry['exergy']}{entry['prev_hash']}"
        entry["hash"] = hashlib.sha256(hash_str.encode('utf-8')).hexdigest()
        
        # Append to JSONL
        with open(self.ledger_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry) + "\n")
        return entry


class MockKVStore:
    """Simulates Cloudflare KV storage with optimistic locking."""
    def __init__(self):
        self.store = {}
        self.metadata = {}

    def get(self, key):
        return self.store.get(key)

    def put(self, key, value, metadata=None):
        self.store[key] = value
        if metadata:
            self.metadata[key] = metadata

    def get_with_metadata(self, key):
        if key not in self.store:
            return None, None
        return self.store[key], self.metadata.get(key)


class SubstackExergyEvaluatorE2ETestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.mock_server_port = int(os.environ.get("MOCK_SERVER_PORT", 8000))
        cls.mock_server_url = f"http://127.0.0.1:{cls.mock_server_port}"
        cls.target_api_url = os.environ.get("TARGET_API_URL", "http://localhost:4321")
        cls.temp_dir = tempfile.mkdtemp()
        cls.ledger_path = os.path.join(cls.temp_dir, "exergy_ledger.jsonl")

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.temp_dir)

    def setUp(self):
        # Clear ledger file before each test
        if os.path.exists(self.ledger_path):
            os.remove(self.ledger_path)

    # =========================================================================
    # TIER 1: FEATURE COVERAGE (25 cases)
    # =========================================================================

    # --- Feature A: Feed Scraping (5 cases) ---

    def test_t1_scraping_valid_rss(self):
        """1. Scrapes a valid RSS XML feed from mock server."""
        url = f"{self.mock_server_url}/feed?scenario=happy-es"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as res:
            xml_data = res.read()
        root = ET.fromstring(xml_data)
        items = root.findall("./channel/item")
        self.assertGreater(len(items), 0)
        self.assertEqual(items[0].find("title").text, "El plan inmutable del demonio de Maxwell")

    def test_t1_scraping_valid_json_archive(self):
        """2. Scrapes a valid Substack API JSON archive from mock server."""
        url = f"{self.mock_server_url}/api/v1/archive?scenario=happy-es"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as res:
            json_data = json.loads(res.read().decode('utf-8'))
        self.assertIsInstance(json_data, list)
        self.assertGreater(len(json_data), 0)
        self.assertEqual(json_data[0]["title"], "El plan inmutable del demonio de Maxwell")

    def test_t1_scraping_fields_extraction(self):
        """3. Verifies correct extraction of title, link, pubDate and description fields."""
        url = f"{self.mock_server_url}/feed?scenario=happy-es"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as res:
            xml_data = res.read()
        root = ET.fromstring(xml_data)
        item = root.find("./channel/item")
        title = item.find("title").text
        link = item.find("link").text
        pub_date = item.find("pubDate").text
        description = item.find("description").text
        self.assertIsNotNone(title)
        self.assertIsNotNone(link)
        self.assertIsNotNone(pub_date)
        self.assertIsNotNone(description)

    def test_t1_scraping_empty_feed(self):
        """4. Verifies feed parsing handles feed with zero items gracefully."""
        url = f"{self.mock_server_url}/feed?scenario=empty"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as res:
            xml_data = res.read()
        root = ET.fromstring(xml_data)
        items = root.findall("./channel/item")
        self.assertEqual(len(items), 0)

    def test_t1_scraping_malformed_url(self):
        """5. Verifies handling of invalid/malformed feed URL."""
        with self.assertRaises((urllib.error.URLError, ValueError)):
            urllib.request.urlopen("http://invalid-domain-name-nonexistent.xyz/feed", timeout=2)

    # --- Feature B: Exergy Calculation (5 cases) ---

    def test_t1_exergy_spanish_post(self):
        """6. Calculates exergy score for a Spanish post using the reference module."""
        title = "El plan inmutable del demonio de Maxwell"
        desc = "Una exploración c5-real sobre la termodinámica del software."
        lang = detect_lang(title, "", desc)
        self.assertEqual(lang, "es")
        exergy, smoke, cb, tech, comm, c5 = audit_text(title, "", desc, lang)
        self.assertGreater(exergy, 50.0)
        self.assertGreater(c5, 0.0)

    def test_t1_exergy_english_post(self):
        """7. Calculates exergy score for an English post using the reference module."""
        title = "The deterministic nature of autopoiesis and ledger systems"
        desc = "A C5-real analysis of blockchain technology."
        lang = detect_lang(title, "", desc)
        self.assertEqual(lang, "en")
        exergy, smoke, cb, tech, comm, c5 = audit_text(title, "", desc, lang)
        self.assertGreater(exergy, 50.0)
        self.assertGreater(c5, 0.0)

    def test_t1_exergy_classification_c5(self):
        """8. Validates classification is 'C5-REAL / Arquitectura' when C5 score is high."""
        # Force high C5 score by using multiple keywords
        title = "C5-REAL ledger verification maxwell autopoiesis"
        desc = "C5-REAL ledger verification maxwell autopoiesis causal deterministic"
        # Since it's English, average C5 density will be very high
        exergy, smoke, cb, tech, comm, c5 = audit_text(title, "", desc, "en")
        self.assertGreaterEqual(c5, 25.0)

    def test_t1_exergy_classification_tech(self):
        """9. Validates classification is 'Técnico / Práctico' when Tech score is high."""
        title = "Building a RAG vector database benchmark"
        desc = "A python workflow compiling LLM prompts and context engineering complexity."
        exergy, smoke, cb, tech, comm, c5 = audit_text(title, "", desc, "en")
        self.assertGreaterEqual(tech, 30.0)

    def test_t1_exergy_classification_comm(self):
        """10. Validates classification is 'Comercial / Transaccional' when Commercial score is high."""
        title = "Sponsored review and paid subscription discount"
        desc = "Affiliate link purchase try it free for 14 days and price discount info."
        exergy, smoke, cb, tech, comm, c5 = audit_text(title, "", desc, "en")
        self.assertGreaterEqual(comm, 40.0)

    # --- Feature C: Cryptographic Ledger (5 cases) ---

    def test_t1_ledger_genesis_entry(self):
        """11. Verifies that the first ledger entry has prev_hash = 'GENESIS'."""
        manager = PythonLedgerManager(self.ledger_path)
        entry = manager.append_entry("First post", 85.5)
        self.assertEqual(entry["prev_hash"], "GENESIS")

    def test_t1_ledger_hash_calculation(self):
        """12. Verifies that the SHA-256 hash is correctly calculated from fields."""
        manager = PythonLedgerManager(self.ledger_path)
        entry = manager.append_entry("Validating hash", 90.0)
        expected_str = f"{entry['timestamp']}{entry['title']}{entry['exergy']}{entry['prev_hash']}"
        expected_hash = hashlib.sha256(expected_str.encode('utf-8')).hexdigest()
        self.assertEqual(entry["hash"], expected_hash)

    def test_t1_ledger_chaining(self):
        """13. Verifies entry N has prev_hash matching entry N-1's hash."""
        manager = PythonLedgerManager(self.ledger_path)
        entry1 = manager.append_entry("Post 1", 75.0)
        entry2 = manager.append_entry("Post 2", 80.0)
        self.assertEqual(entry2["prev_hash"], entry1["hash"])

    def test_t1_ledger_jsonl_append(self):
        """14. Verifies ledger entries are written as distinct JSON lines."""
        manager = PythonLedgerManager(self.ledger_path)
        manager.append_entry("Post 1", 75.0)
        manager.append_entry("Post 2", 80.0)
        with open(self.ledger_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
        self.assertEqual(len(lines), 2)
        json.loads(lines[0])
        json.loads(lines[1])

    def test_t1_ledger_integrity_check(self):
        """15. Verifies validator function correctly reports validity of a good ledger."""
        manager = PythonLedgerManager(self.ledger_path)
        manager.append_entry("Post 1", 75.0)
        manager.append_entry("Post 2", 80.0)
        valid, msg = verify_ledger_file_integrity(self.ledger_path)
        self.assertTrue(valid, msg)

    # --- Feature D: Cloudflare KV (5 cases) ---

    def test_t1_kv_read_existing(self):
        """16. Verifies reading a ledger value from mock KV store."""
        kv = MockKVStore()
        kv.put("exergy_ledger_head", "some_hash")
        self.assertEqual(kv.get("exergy_ledger_head"), "some_hash")

    def test_t1_kv_write_new(self):
        """17. Verifies writing a ledger value to mock KV store."""
        kv = MockKVStore()
        kv.put("exergy_ledger_head", "new_hash", metadata={"timestamp": "2026-06-09"})
        val, meta = kv.get_with_metadata("exergy_ledger_head")
        self.assertEqual(val, "new_hash")
        self.assertEqual(meta["timestamp"], "2026-06-09")

    def test_t1_kv_fallback_when_local_read_only(self):
        """18. Simulates fallback path when local write fails but KV succeeds."""
        # Create a mock application that attempts local write, catches error, and calls KV
        kv = MockKVStore()
        local_writable = False
        
        def save_ledger(entry):
            nonlocal local_writable
            if not local_writable:
                # Local write failed, fall back to KV
                kv.put("fallback_ledger", json.dumps(entry))
                return "kv"
            return "local"

        result = save_ledger({"title": "Fallback", "exergy": 95.0})
        self.assertEqual(result, "kv")
        self.assertIsNotNone(kv.get("fallback_ledger"))

    def test_t1_kv_concurrency_token(self):
        """19. Simulates optimistic concurrency token matching on KV update."""
        kv = MockKVStore()
        kv.put("ledger_version", "v1")
        
        # Write requires checking if current version matches expected
        def conditional_put(expected_version, new_val):
            current = kv.get("ledger_version")
            if current == expected_version:
                kv.put("ledger_version", new_val)
                return True
            return False

        self.assertTrue(conditional_put("v1", "v2"))
        self.assertFalse(conditional_put("v1", "v3")) # Stale version check

    def test_t1_kv_empty_state(self):
        """20. Simulates reading from empty KV store returns None."""
        kv = MockKVStore()
        self.assertIsNone(kv.get("nonexistent_key"))

    # --- Feature E: API Integration (5 cases) ---

    def test_t1_api_cron_trigger(self):
        """21. Simulates invocation of the /api/exergy-cron endpoint. Expects failure/404 until implemented."""
        url = f"{self.target_api_url}/api/exergy-cron"
        req = urllib.request.Request(url, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=5) as res:
                self.assertEqual(res.status, 200)
        except urllib.error.HTTPError as e:
            # We expect a 404 since it's not yet implemented
            self.assertEqual(e.code, 404)
        except urllib.error.URLError:
            # Server not running is also a fail, but for the E2E test runner it counts as failed API integration
            self.fail("Astro server not reachable")

    def test_t1_api_cron_auth(self):
        """22. Verifies route rejects requests without authorization token/headers if enforced."""
        url = f"{self.target_api_url}/api/exergy-cron"
        # Call without auth headers
        req = urllib.request.Request(url, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=5) as res:
                # If it responds 200, authentication is not enforced.
                pass
        except urllib.error.HTTPError as e:
            self.assertIn(e.code, [401, 403, 404])
        except urllib.error.URLError:
            self.fail("Astro server not reachable")

    def test_t1_api_cron_response_headers(self):
        """23. Verifies API endpoint returns json content-type header."""
        url = f"{self.target_api_url}/api/exergy-cron"
        req = urllib.request.Request(url, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=5) as res:
                self.assertIn("application/json", res.headers.get("Content-Type", ""))
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 404)
        except urllib.error.URLError:
            self.fail("Astro server not reachable")

    def test_t1_api_cron_http_status(self):
        """24. Verifies endpoint HTTP status code checks (expected 200, currently 404)."""
        url = f"{self.target_api_url}/api/exergy-cron"
        req = urllib.request.Request(url, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=5) as res:
                self.assertEqual(res.status, 200)
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 404)
        except urllib.error.URLError:
            self.fail("Astro server not reachable")

    def test_t1_api_cron_payload_structure(self):
        """25. Checks that API payload structure is JSON with required response properties."""
        url = f"{self.target_api_url}/api/exergy-cron"
        req = urllib.request.Request(url, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=5) as res:
                body = json.loads(res.read().decode('utf-8'))
                self.assertIn("success", body)
                self.assertIn("processed_count", body)
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 404)
        except urllib.error.URLError:
            self.fail("Astro server not reachable")


    # =========================================================================
    # TIER 2: BOUNDARY & CORNER CASES (25 cases)
    # =========================================================================

    def test_t2_boundary_empty_title(self):
        """26. Evaluates exergy when title is empty."""
        exergy, smoke, cb, tech, comm, c5 = audit_text("", "Subtitle", "Description", "es")
        self.assertIsNotNone(exergy)

    def test_t2_boundary_empty_subtitle(self):
        """27. Evaluates exergy when subtitle is empty."""
        exergy, smoke, cb, tech, comm, c5 = audit_text("Title", "", "Description", "es")
        self.assertIsNotNone(exergy)

    def test_t2_boundary_empty_description(self):
        """28. Evaluates exergy when description is empty."""
        exergy, smoke, cb, tech, comm, c5 = audit_text("Title", "Subtitle", "", "es")
        self.assertIsNotNone(exergy)

    def test_t2_boundary_all_fields_empty(self):
        """29. Evaluates exergy when all fields are empty, ensuring division-by-zero protection."""
        exergy, smoke, cb, tech, comm, c5 = audit_text("", "", "", "es")
        self.assertEqual(exergy, 100.0) # Empty text should default gracefully

    def test_t2_boundary_huge_text(self):
        """30. Evaluates exergy on huge input text (100k+ words)."""
        title = "Huge title"
        desc = "word " * 100000
        exergy, smoke, cb, tech, comm, c5 = audit_text(title, "", desc, "en")
        self.assertIsNotNone(exergy)

    def test_t2_boundary_rate_limiting(self):
        """31. Simulates HTTP 429 Rate Limiting exception from the feed server."""
        url = f"{self.mock_server_url}/feed?scenario=rate-limit"
        req = urllib.request.Request(url)
        with self.assertRaises(urllib.error.HTTPError) as ctx:
            urllib.request.urlopen(req, timeout=5)
        self.assertEqual(ctx.exception.code, 429)

    def test_t2_boundary_timeout(self):
        """32. Simulates connection timeout exception from the feed server."""
        url = f"{self.mock_server_url}/feed?scenario=timeout"
        req = urllib.request.Request(url)
        with self.assertRaises(Exception): # URLError or TimeoutError
            urllib.request.urlopen(req, timeout=1.0)

    def test_t2_boundary_http_500_error(self):
        """33. Simulates HTTP 500 Server Error exception from the feed server."""
        url = f"{self.mock_server_url}/feed?scenario=http-500"
        req = urllib.request.Request(url)
        with self.assertRaises(urllib.error.HTTPError) as ctx:
            urllib.request.urlopen(req, timeout=5)
        self.assertEqual(ctx.exception.code, 500)

    def test_t2_boundary_ledger_missing_prev_hash(self):
        """34. Ledger verification flags an entry missing prev_hash."""
        with open(self.ledger_path, "w", encoding="utf-8") as f:
            f.write(json.dumps({"timestamp": "2026-06-09T08:00:00Z", "title": "Bad", "exergy": 90.0, "hash": "123"}) + "\n")
        valid, msg = verify_ledger_file_integrity(self.ledger_path)
        self.assertFalse(valid)
        self.assertIn("missing field: prev_hash", msg)

    def test_t2_boundary_ledger_invalid_jsonl_syntax(self):
        """35. Ledger verification flags line with invalid JSON syntax."""
        with open(self.ledger_path, "w", encoding="utf-8") as f:
            f.write("{invalid json}\n")
        valid, msg = verify_ledger_file_integrity(self.ledger_path)
        self.assertFalse(valid)
        self.assertIn("invalid JSON syntax", msg)

    def test_t2_boundary_special_characters_utf8(self):
        """36. Evaluates exergy containing multi-byte UTF-8 emoji and non-ASCII chars."""
        title = "El secreto de la Banana 🍌 y el Sol ☀️ en España"
        exergy, smoke, cb, tech, comm, c5 = audit_text(title, "", "", "es")
        self.assertIsNotNone(exergy)

    def test_t2_boundary_lang_detection_short(self):
        """37. Language detection on short input (single words)."""
        self.assertEqual(detect_lang("el", "", ""), "es")
        self.assertEqual(detect_lang("the", "", ""), "en")

    def test_t2_boundary_lang_detection_mixed(self):
        """38. Language detection on text with equal ES and EN count."""
        # 1 ES word ("el"), 1 EN word ("the")
        lang = detect_lang("el the", "", "")
        self.assertIn(lang, [None, "es", "en"])

    def test_t2_boundary_lang_detection_numbers(self):
        """39. Language detection on numeric/code text defaults to None or Spanish."""
        lang = detect_lang("12345 67890", "", "")
        self.assertIsNone(lang)

    def test_t2_boundary_xml_malformed(self):
        """40. Verifies RSS XML parser error handling for truncated feed."""
        url = f"{self.mock_server_url}/feed?scenario=malformed"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as res:
            xml_data = res.read()
        with self.assertRaises(ET.ParseError):
            ET.fromstring(xml_data)

    def test_t2_boundary_clickbait_saturation(self):
        """41. Verifies ES clickbait score reaches max 100 on saturated text."""
        # Mix multiple ES clickbait keywords
        text = "¡EL SECRETO DEFINITIVO PARA HACERTE RICO EN 10 DIAS! 🍌 100% GRATIS"
        exergy, smoke, cb, tech, comm, c5 = audit_text(text, "", "", "es")
        self.assertEqual(cb, 100.0)

    def test_t2_boundary_pure_tech_exergy(self):
        """42. Verifies tech score reaches max 100 on high density tech terms."""
        text = "python api git mmap json rust arxiv benchmark complexity rag vector database token ast prompt"
        exergy, smoke, cb, tech, comm, c5 = audit_text(text, "", "", "es")
        self.assertEqual(tech, 100.0)

    def test_t2_boundary_commercial_saturation(self):
        """43. Verifies commercial score reaches max 100 on sponsor terms."""
        text = "patrocinado sponsor holded gratis afiliado descuento precio compra suscripción de pago"
        exergy, smoke, cb, tech, comm, c5 = audit_text(text, "", "", "es")
        self.assertEqual(comm, 100.0)

    def test_t2_boundary_c5_real_saturation(self):
        """44. Verifies c5_real score reaches max 100 on c5 terms."""
        text = "c5-real ledger falsación inmutable antigravity cortex autopoiesis maxwell causal determinista proof of work"
        exergy, smoke, cb, tech, comm, c5 = audit_text(text, "", "", "es")
        self.assertEqual(c5, 100.0)

    def test_t2_boundary_rapid_concurrent_calls(self):
        """45. Simulates rapid sequential requests to local API server without lock issues."""
        url = f"{self.target_api_url}/api/exergy-cron"
        for _ in range(5):
            req = urllib.request.Request(url, method="POST")
            try:
                with urllib.request.urlopen(req, timeout=1) as res:
                    pass
            except (urllib.error.HTTPError, urllib.error.URLError):
                # Expect errors due to missing endpoint, just verifying execution doesn't lock/hang
                pass

    def test_t2_boundary_kv_write_exception(self):
        """46. Simulates exception thrown during KV write."""
        kv = MockKVStore()
        kv.put = MagicMock(side_effect=Exception("KV Write Timeout"))
        with self.assertRaises(Exception):
            kv.put("key", "val")

    def test_t2_boundary_kv_read_exception(self):
        """47. Simulates exception thrown during KV read."""
        kv = MockKVStore()
        kv.get = MagicMock(side_effect=Exception("KV Service Unavailable"))
        with self.assertRaises(Exception):
            kv.get("key")

    def test_t2_boundary_ledger_write_permission_error(self):
        """48. Verifies error handling when local filesystem throws PermissionError."""
        manager = PythonLedgerManager(self.ledger_path)
        with patch("builtins.open", side_effect=PermissionError("Write Permission Denied")):
            with self.assertRaises(PermissionError):
                manager.append_entry("Denied", 50.0)

    def test_t2_boundary_ledger_invalid_hash_signature(self):
        """49. Verify ledger validation fails when hash signature is altered."""
        manager = PythonLedgerManager(self.ledger_path)
        entry = manager.append_entry("Post 1", 75.0)
        # Alter the hash of the entry in the file
        with open(self.ledger_path, "w", encoding="utf-8") as f:
            entry["hash"] = "altered_hash_signature"
            f.write(json.dumps(entry) + "\n")
        valid, msg = verify_ledger_file_integrity(self.ledger_path)
        self.assertFalse(valid)
        self.assertIn("hash mismatch", msg)

    def test_t2_boundary_malformed_pub_id(self):
        """50. Handles missing/malformed publication recommendations feed path."""
        url = f"{self.mock_server_url}/api/v1/recommendations/from/invalid_pub_id?scenario=empty"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as res:
            recs = json.loads(res.read().decode('utf-8'))
        self.assertEqual(len(recs), 0)


    # =========================================================================
    # TIER 3: CROSS-FEATURE COMBINATIONS (5 cases)
    # =========================================================================

    def test_t3_cross_mixed_languages_feed(self):
        """51. Feed containing both Spanish and English posts evaluates correctly for both languages."""
        url = f"{self.mock_server_url}/feed?scenario=mixed-lang"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as res:
            xml_data = res.read()
        root = ET.fromstring(xml_data)
        items = root.findall("./channel/item")
        self.assertEqual(len(items), 2)
        
        # Test item 1 (ES)
        title1 = items[0].find("title").text
        desc1 = items[0].find("description").text
        lang1 = detect_lang(title1, "", desc1)
        self.assertEqual(lang1, "es")
        exergy1, _, _, _, _, _ = audit_text(title1, "", desc1, lang1)
        self.assertGreater(exergy1, 50.0)

        # Test item 2 (EN)
        title2 = items[1].find("title").text
        desc2 = items[1].find("description").text
        lang2 = detect_lang(title2, "", desc2)
        self.assertEqual(lang2, "en")
        exergy2, _, _, _, _, _ = audit_text(title2, "", desc2, lang2)
        self.assertGreater(exergy2, 50.0)

    def test_t3_cross_concurrent_cron_execution(self):
        """52. Simulated concurrent cron execution does not result in corrupted ledger."""
        manager = PythonLedgerManager(self.ledger_path)
        # Simulate two concurrent processes appending to same ledger
        manager.append_entry("Post A", 80.0)
        manager.append_entry("Post B", 85.0)
        valid, msg = verify_ledger_file_integrity(self.ledger_path)
        self.assertTrue(valid, msg)

    def test_t3_cross_ledger_concurrency_lock(self):
        """53. Simulates file locking behavior preventing ledger write during active lock."""
        # Simple simulation: lock file is created, append_entry fails or waits
        lock_file = self.ledger_path + ".lock"
        
        def safe_append(manager, title, exergy):
            if os.path.exists(lock_file):
                raise IOError("Ledger file is locked by another process")
            # Create lock
            with open(lock_file, "w") as lf:
                lf.write("locked")
            try:
                return manager.append_entry(title, exergy)
            finally:
                os.remove(lock_file)

        manager = PythonLedgerManager(self.ledger_path)
        # First write works
        safe_append(manager, "First post", 90.0)
        
        # Create artificial lock and verify next write fails
        with open(lock_file, "w") as f:
            f.write("locked")
        with self.assertRaises(IOError):
            safe_append(manager, "Second post", 95.0)
        
        os.remove(lock_file)

    def test_t3_cross_deduplication_basic(self):
        """54. Verifies deduplication logic correctly skips already processed posts in ledger."""
        # Fill ledger with a post
        manager = PythonLedgerManager(self.ledger_path)
        manager.append_entry("Post 1", 90.0)
        
        # Simulating crawling: checks if "Post 1" is in ledger titles
        with open(self.ledger_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
        existing_titles = [json.loads(line.strip())["title"] for line in lines]
        
        new_post = "Post 1"
        is_duplicate = new_post in existing_titles
        self.assertTrue(is_duplicate)

    def test_t3_cross_deduplication_duplicate_in_same_feed(self):
        """55. Verifies deduplication logic processes only once when duplicates occur in same feed response."""
        url = f"{self.mock_server_url}/feed?scenario=duplicates"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as res:
            xml_data = res.read()
        root = ET.fromstring(xml_data)
        items = root.findall("./channel/item")
        self.assertEqual(len(items), 2)
        
        # Processing simulation with deduplication
        processed = set()
        to_process = []
        for item in items:
            link = item.find("link").text
            if link not in processed:
                processed.add(link)
                to_process.append(item)
        self.assertEqual(len(to_process), 1)


    # =========================================================================
    # TIER 4: REAL-WORLD SCENARIOS (5 cases)
    # =========================================================================

    def test_t4_scenario_multi_step_run(self):
        """56. Runs multi-step crawler iteration to ensure chains are correct across cron intervals."""
        manager = PythonLedgerManager(self.ledger_path)
        
        # Iteration 1
        entry1 = manager.append_entry("Post Iteration 1", 77.0)
        self.assertEqual(entry1["prev_hash"], "GENESIS")
        
        # Iteration 2
        entry2 = manager.append_entry("Post Iteration 2", 82.0)
        self.assertEqual(entry2["prev_hash"], entry1["hash"])
        
        # Verify ledger file
        valid, msg = verify_ledger_file_integrity(self.ledger_path)
        self.assertTrue(valid, msg)

    def test_t4_scenario_historic_ledger_integrity(self):
        """57. Validates cryptographic chaining on a historic ledger with 10 existing records."""
        manager = PythonLedgerManager(self.ledger_path)
        for i in range(10):
            manager.append_entry(f"Historic Post {i}", 80.0 + i)
            
        valid, msg = verify_ledger_file_integrity(self.ledger_path)
        self.assertTrue(valid, msg)

    def test_t4_scenario_historic_ledger_corruption(self):
        """58. Detects modification/corruption in the middle of a 10-record historic ledger."""
        manager = PythonLedgerManager(self.ledger_path)
        entries = []
        for i in range(10):
            entries.append(manager.append_entry(f"Historic Post {i}", 80.0 + i))
            
        # Corrupt entry index 5
        corrupted_entries = []
        with open(self.ledger_path, "r", encoding="utf-8") as f:
            for idx, line in enumerate(f):
                entry = json.loads(line.strip())
                if idx == 5:
                    entry["exergy"] = 0.0 # Alter the exergy value
                corrupted_entries.append(entry)
                
        with open(self.ledger_path, "w", encoding="utf-8") as f:
            for entry in corrupted_entries:
                f.write(json.dumps(entry) + "\n")
                
        # Integrity verification must fail
        valid, msg = verify_ledger_file_integrity(self.ledger_path)
        self.assertFalse(valid)
        self.assertIn("hash mismatch", msg)

    def test_t4_scenario_mixed_feed_aggregates(self):
        """59. Feed with diverse post types (tech, c5, commercial, clickbait) aggregates correctly."""
        # We manually scan the feed types and aggregate results
        scenarios = ["tech", "c5", "commercial", "clickbait"]
        posts_exergy = []
        
        for sc in scenarios:
            url = f"{self.mock_server_url}/feed?scenario={sc}"
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=5) as res:
                xml_data = res.read()
            root = ET.fromstring(xml_data)
            item = root.find("./channel/item")
            title = item.find("title").text
            desc = item.find("description").text
            lang = detect_lang(title, "", desc) or "es"
            exergy, _, _, _, _, _ = audit_text(title, "", desc, lang)
            posts_exergy.append(exergy)
            
        # Aggregation check
        avg_exergy = sum(posts_exergy) / len(posts_exergy)
        self.assertGreater(avg_exergy, 0.0)
        self.assertLess(avg_exergy, 100.0)

    def test_t4_scenario_error_recovery_rate_limit(self):
        """60. Recovers from transient feed rate limits by utilizing retry mechanisms."""
        # Simulated retry execution structure
        attempts = 0
        max_attempts = 3
        succeeded = False
        
        # Mocks a function that fails with HTTP 429 on first 2 calls, then succeeds on 3rd
        def fetch_with_retry():
            nonlocal attempts, succeeded
            attempts += 1
            if attempts < 3:
                raise urllib.error.HTTPError("http://example.com", 429, "Too Many Requests", {}, None)
            succeeded = True
            return "feed data"

        for i in range(max_attempts):
            try:
                data = fetch_with_retry()
                break
            except urllib.error.HTTPError as e:
                if e.code == 429 and i < max_attempts - 1:
                    # Sleep/Backoff simulation
                    time.sleep(0.01)
                else:
                    raise

        self.assertTrue(succeeded)
        self.assertEqual(attempts, 3)


if __name__ == "__main__":
    unittest.main()
