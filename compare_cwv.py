import json
import sys

def parse_report(file_path):
    with open(file_path, 'r') as f:
        data = json.load(f)
        
    categories = data.get("categories", {})
    audits = data.get("audits", {})
    
    return {
        "Performance": categories.get("performance", {}).get("score", 0) * 100,
        "Accessibility": categories.get("accessibility", {}).get("score", 0) * 100,
        "SEO": categories.get("seo", {}).get("score", 0) * 100,
        "Best Practices": categories.get("best-practices", {}).get("score", 0) * 100,
        "LCP (ms)": audits.get("largest-contentful-paint", {}).get("numericValue", 0),
        "CLS": audits.get("cumulative-layout-shift", {}).get("numericValue", 0),
        "TBT (ms)": audits.get("total-blocking-time", {}).get("numericValue", 0),
        "FCP (ms)": audits.get("first-contentful-paint", {}).get("numericValue", 0),
        "TTFB (ms)": audits.get("server-response-time", {}).get("numericValue", 0),
        "DOM Nodes": audits.get("dom-size", {}).get("numericValue", 0),
        "JS Transferred (KB)": audits.get("network-requests", {}).get("details", {}).get("items", []),
    }

def calculate_js_css(network_items):
    js_bytes = 0
    css_bytes = 0
    for item in network_items:
        res_type = item.get("resourceType", "")
        size = item.get("transferSize", 0)
        if res_type == "Script":
            js_bytes += size
        elif res_type == "Stylesheet":
            css_bytes += size
    return js_bytes / 1024, css_bytes / 1024

try:
    legacy = parse_report("legacy-report.json")
    v2 = parse_report("v2-report.json")
    
    leg_js, leg_css = calculate_js_css(legacy["JS Transferred (KB)"])
    v2_js, v2_css = calculate_js_css(v2["JS Transferred (KB)"])
    
    print("=== LIGHTHOUSE COMPARATIVE AUDIT ===")
    print(f"{'Metric':<20} | {'Legacy (3001)':<15} | {'V2 (3002)':<15}")
    print("-" * 56)
    
    metrics = [
        ("Performance", legacy["Performance"], v2["Performance"], ""),
        ("Accessibility", legacy["Accessibility"], v2["Accessibility"], ""),
        ("SEO", legacy["SEO"], v2["SEO"], ""),
        ("LCP", legacy["LCP (ms)"], v2["LCP (ms)"], "ms"),
        ("CLS", legacy["CLS"], v2["CLS"], ""),
        ("TBT", legacy["TBT (ms)"], v2["TBT (ms)"], "ms"),
        ("FCP", legacy["FCP (ms)"], v2["FCP (ms)"], "ms"),
        ("DOM Nodes", legacy["DOM Nodes"], v2["DOM Nodes"], ""),
        ("JS Payload", leg_js, v2_js, "KB"),
        ("CSS Payload", leg_css, v2_css, "KB")
    ]
    
    for name, leg_val, v2_val, unit in metrics:
        l_str = f"{leg_val:.2f}{unit}"
        v_str = f"{v2_val:.2f}{unit}"
        print(f"{name:<20} | {l_str:<15} | {v_str:<15}")

except Exception as e:
    print(f"Error parsing reports: {e}")
