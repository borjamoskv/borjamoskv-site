import http.server
import threading
import time
import urllib.parse
import json

class MockSubstackHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Suppress logging to keep output clean unless needed
        pass

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        query = urllib.parse.parse_qs(parsed_url.query)
        scenario = query.get("scenario", ["happy-es"])[0]

        # Simulate timeout scenario
        if scenario == "timeout":
            time.sleep(3.0)
            self.send_response(200)
            self.send_header("Content-Type", "application/xml")
            self.end_headers()
            self.wfile.write(b"<rss><channel><title>Timeout</title></channel></rss>")
            return

        # Simulate rate limit
        if scenario == "rate-limit":
            self.send_response(429)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Too Many Requests"}).encode("utf-8"))
            return

        # Simulate server error
        if scenario == "http-500":
            self.send_response(500)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b"Internal Server Error")
            return

        # Dispatch based on path
        if path == "/feed" or path == "/feed/":
            self.handle_rss_feed(scenario)
        elif path == "/api/v1/archive":
            self.handle_json_archive(scenario)
        elif path.startswith("/api/v1/recommendations/from/"):
            self.handle_recommendations(scenario)
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"Not Found")

    def handle_rss_feed(self, scenario):
        self.send_response(200)
        self.send_header("Content-Type", "application/xml; charset=utf-8")
        self.end_headers()

        if scenario == "empty":
            xml = "<rss version='2.0'><channel><title>Empty Feed</title><link>https://example.substack.com</link></channel></rss>"
        elif scenario == "malformed":
            xml = "<rss version='2.0'><channel><title>Malformed Feed</title><item><title>Truncated"
        elif scenario == "happy-es":
            xml = """<rss version="2.0">
            <channel>
                <title>Happy ES Feed</title>
                <link>https://example.substack.com</link>
                <item>
                    <title>El plan inmutable del demonio de Maxwell</title>
                    <link>https://example.substack.com/p/maxwell</link>
                    <pubDate>Tue, 09 Jun 2026 08:00:00 GMT</pubDate>
                    <description>Una exploración c5-real sobre la termodinámica del software.</description>
                </item>
                <item>
                    <title>Desarrollando un compilador en Python y Rust</title>
                    <link>https://example.substack.com/p/compiler</link>
                    <pubDate>Mon, 08 Jun 2026 08:00:00 GMT</pubDate>
                    <description>Un benchmark práctico utilizando ast y mmap para optimización.</description>
                </item>
            </channel>
            </rss>"""
        elif scenario == "happy-en":
            xml = """<rss version="2.0">
            <channel>
                <title>Happy EN Feed</title>
                <link>https://example.substack.com</link>
                <item>
                    <title>The deterministic nature of autopoiesis and ledger systems</title>
                    <link>https://example.substack.com/p/ledger</link>
                    <pubDate>Tue, 09 Jun 2026 08:00:00 GMT</pubDate>
                    <description>A C5-real analysis of blockchain technology and Maxwell's demon.</description>
                </item>
            </channel>
            </rss>"""
        elif scenario == "huge":
            xml = f"""<rss version="2.0">
            <channel>
                <title>Huge Feed</title>
                <item>
                    <title>Huge post</title>
                    <link>https://example.substack.com/p/huge</link>
                    <pubDate>Tue, 09 Jun 2026 08:00:00 GMT</pubDate>
                    <description>{"word " * 100000}</description>
                </item>
            </channel>
            </rss>"""
        elif scenario == "clickbait":
            xml = """<rss version="2.0">
            <channel>
                <title>Clickbait Feed</title>
                <item>
                    <title>¡EL SECRETO DEFINITIVO PARA HACERTE RICO EN 10 DIAS! 🍌 100% GRATIS</title>
                    <link>https://example.substack.com/p/clickbait</link>
                    <pubDate>Tue, 09 Jun 2026 08:00:00 GMT</pubDate>
                    <description>Nadie te cuenta la verdad sobre cómo superar tu obsesión y ganar dinero rápido.</description>
                </item>
            </channel>
            </rss>"""
        elif scenario == "tech":
            xml = """<rss version="2.0">
            <channel>
                <title>Tech Feed</title>
                <item>
                    <title>Building a RAG vector database benchmark</title>
                    <link>https://example.substack.com/p/tech</link>
                    <pubDate>Tue, 09 Jun 2026 08:00:00 GMT</pubDate>
                    <description>A python workflow compiling LLM prompts and context engineering complexity using Git.</description>
                </item>
            </channel>
            </rss>"""
        elif scenario == "commercial":
            xml = """<rss version="2.0">
            <channel>
                <title>Commercial Feed</title>
                <item>
                    <title>Patrocinado: Compra el mejor curso con descuento</title>
                    <link>https://example.substack.com/p/comm</link>
                    <pubDate>Tue, 09 Jun 2026 08:00:00 GMT</pubDate>
                    <description>Suscripción de pago con precio especial. Pruébalo gratis por 14 días en el enlace de afiliado.</description>
                </item>
            </channel>
            </rss>"""
        elif scenario == "c5":
            xml = """<rss version="2.0">
            <channel>
                <title>C5 Feed</title>
                <item>
                    <title>C5-REAL ledger verification protocols</title>
                    <link>https://example.substack.com/p/c5</link>
                    <pubDate>Tue, 09 Jun 2026 08:00:00 GMT</pubDate>
                    <description>Falsación causal inmutable matching proof of work on the antigravity cortex ecosystem.</description>
                </item>
            </channel>
            </rss>"""
        elif scenario == "mixed-lang":
            xml = """<rss version="2.0">
            <channel>
                <title>Mixed Lang Feed</title>
                <item>
                    <title>El plan inmutable del demonio de Maxwell</title>
                    <link>https://example.substack.com/p/es</link>
                    <pubDate>Tue, 09 Jun 2026 08:00:00 GMT</pubDate>
                    <description>Una exploración c5-real sobre la termodinámica del software.</description>
                </item>
                <item>
                    <title>The deterministic nature of autopoiesis and ledger systems</title>
                    <link>https://example.substack.com/p/en</link>
                    <pubDate>Tue, 09 Jun 2026 07:00:00 GMT</pubDate>
                    <description>A C5-real analysis of blockchain technology and Maxwell's demon.</description>
                </item>
            </channel>
            </rss>"""
        elif scenario == "duplicates":
            xml = """<rss version="2.0">
            <channel>
                <title>Duplicates Feed</title>
                <item>
                    <title>Unique post</title>
                    <link>https://example.substack.com/p/unique</link>
                    <pubDate>Tue, 09 Jun 2026 08:00:00 GMT</pubDate>
                    <description>Standard content.</description>
                </item>
                <item>
                    <title>Unique post</title>
                    <link>https://example.substack.com/p/unique</link>
                    <pubDate>Tue, 09 Jun 2026 08:00:00 GMT</pubDate>
                    <description>Standard content.</description>
                </item>
            </channel>
            </rss>"""
        elif scenario == "updated-posts":
            xml = """<rss version="2.0">
            <channel>
                <title>Updated Posts Feed</title>
                <item>
                    <title>Original post but updated</title>
                    <link>https://example.substack.com/p/updated</link>
                    <pubDate>Tue, 09 Jun 2026 09:00:00 GMT</pubDate>
                    <description>Updated description with C5-REAL.</description>
                </item>
            </channel>
            </rss>"""
        else:
            xml = "<rss><channel><title>Unknown</title></channel></rss>"

        self.wfile.write(xml.encode("utf-8"))

    def handle_json_archive(self, scenario):
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()

        if scenario == "empty":
            posts = []
        elif scenario == "malformed":
            self.wfile.write(b"[{malformed json: ")
            return
        elif scenario == "happy-es":
            posts = [
                {
                    "title": "El plan inmutable del demonio de Maxwell",
                    "subtitle": "Termodinámica del software",
                    "description": "Una exploración c5-real sobre la termodinámica del software.",
                    "canonical_url": "https://example.substack.com/p/maxwell",
                    "language": "es",
                    "post_date": "2026-06-09T08:00:00Z"
                },
                {
                    "title": "Desarrollando un compilador en Python y Rust",
                    "subtitle": "AST and memory mapping",
                    "description": "Un benchmark práctico utilizando ast y mmap para optimización.",
                    "canonical_url": "https://example.substack.com/p/compiler",
                    "language": "es",
                    "post_date": "2026-06-08T08:00:00Z"
                }
            ]
        elif scenario == "happy-en":
            posts = [
                {
                    "title": "The deterministic nature of autopoiesis and ledger systems",
                    "subtitle": "Real-world verify",
                    "description": "A C5-real analysis of blockchain technology and Maxwell's demon.",
                    "canonical_url": "https://example.substack.com/p/ledger",
                    "language": "en",
                    "post_date": "2026-06-09T08:00:00Z"
                }
            ]
        elif scenario == "mixed-lang":
            posts = [
                {
                    "title": "El plan inmutable del demonio de Maxwell",
                    "subtitle": "Termodinámica del software",
                    "description": "Una exploración c5-real sobre la termodinámica del software.",
                    "canonical_url": "https://example.substack.com/p/es",
                    "language": "es",
                    "post_date": "2026-06-09T08:00:00Z"
                },
                {
                    "title": "The deterministic nature of autopoiesis and ledger systems",
                    "subtitle": "Real-world verify",
                    "description": "A C5-real analysis of blockchain technology and Maxwell's demon.",
                    "canonical_url": "https://example.substack.com/p/en",
                    "language": "en",
                    "post_date": "2026-06-09T07:00:00Z"
                }
            ]
        else:
            posts = []

        self.wfile.write(json.dumps(posts).encode("utf-8"))

    def handle_recommendations(self, scenario):
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()

        if scenario == "empty":
            recs = []
        elif scenario == "malformed":
            self.wfile.write(b"[{malformed json: ")
            return
        else:
            recs = [
                {
                    "recommendedPublication": {
                        "id": 9991,
                        "subdomain": "tech-rec",
                        "custom_domain": "https://tech-rec.example.com"
                    }
                },
                {
                    "recommendedPublication": {
                        "id": 9992,
                        "subdomain": "c5-rec",
                        "custom_domain": None
                    }
                }
            ]

        self.wfile.write(json.dumps(recs).encode("utf-8"))


class MockSubstackServer:
    def __init__(self, host="127.0.0.1", port=8000):
        self.host = host
        self.port = port
        self.server = None
        self.thread = None

    def start(self):
        self.server = http.server.HTTPServer((self.host, self.port), MockSubstackHandler)
        self.thread = threading.Thread(target=self.server.serve_forever)
        self.thread.daemon = True
        self.thread.start()
        # Give server a tiny bit of time to spin up
        time.sleep(0.1)

    def stop(self):
        if self.server:
            self.server.shutdown()
            self.server.server_close()
            self.thread.join(timeout=2.0)
