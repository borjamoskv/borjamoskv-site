#!/usr/bin/env python3
"""
CRONOS-Ω: Sovereign Deep Audit, Network Drift Detector, and UI Injector.
Performs density-based quantitative text auditing and co-recommendation graph drift analysis
between AI Mafia and control group subdomains. Re-generates telemetry HTML dashboard
and compiles the workspace using Vite.
"""

import urllib.request
import json
import ssl
import re
import sys
import os
import time
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed

# Disable SSL verification for scripting simplicity
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Constants and Paths
BASE_DIR = "/Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site"
BASELINE_PATH = os.path.join(BASE_DIR, "substack_archive/recommendations_graph.json")
OUTPUT_AUDIT_PATH = os.path.join(BASE_DIR, "substack_archive/cronos_deep_audit_results.json")
HISTORY_LOG_PATH = os.path.join(BASE_DIR, "substack_archive/cronos_history.log")
HTML_REPORT_PATH = os.path.join(BASE_DIR, "substack-mafia-autopsia-estructural.html")

SEEDS = ["aimafia", "cosasdefreelance", "tudosisia", "webreactiva"]

# Refined Keywords for Density Analysis
CLICKBAIT_PATTERNS = [
    r"\bsuperar\b", r"\bsecreto\b", r"\bla verdad\b", r"\bhype\b", r"\bgratis\b", r"\bdefinitiva\b",
    r"\blife hack\b", r"🍌", r"100\s*%", r"\bmorir\b", r"\bgratuita\b", r"\bmentira\b", r"\brico\b",
    r"\binjusta\b", r"nadie te cuenta", r"\bobsesión\b", r"\brevelación\b", r"\bdefinitivo\b",
    r"\bmultiplica\b", r"\bganar dinero\b", r"\bhazte rico\b", r"\bel plan\b"
]

TECH_PATTERNS = [
    r"\bpython\b", r"\bapi\b", r"\bgit\b", r"\bmmap\b", r"\bjson\b", r"\brust\b", r"\barxiv\b", r"\bbenchmark\b",
    r"\bcomplexity\b", r"\brag\b", r"\bvector\b", r"\bdatabase\b", r"\btoken\b", r"\bast\b", r"\bprompt\b",
    r"context engineering", r"\bworkflow\b", r"\bagente\b", r"\bllm\b", r"\bmodel\b", r"\bcode\b", r"\bcompile\b"
]

SPONSOR_PATTERNS = [
    r"\bpatrocinado\b", r"\bsponsor\b", r"\bholded\b", r"gratis aquí", r"\bafiliado\b", r"14 días gratis",
    r"pruébalo gratis", r"\bdescuento\b", r"\bprecio\b", r"\bcompra\b", r"\bsuscripción de pago\b"
]

def clean_html(html):
    """Simple regex HTML tag stripper to get raw text content."""
    text = re.sub(r'<script\b[^>]*>([\s\S]*?)</script>', '', html)
    text = re.sub(r'<style\b[^>]*>([\s\S]*?)</style>', '', text)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def resolve_pub_id_and_url(subdomain):
    """Resolves Substack publication ID from subdomain or custom domain."""
    base_url = f"https://{subdomain}.substack.com"
    url = f"{base_url}/about"
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'}
    )
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=8) as response:
            final_url = response.geturl()
            base_match = re.match(r'(https?://[^/]+)', final_url)
            if base_match:
                base_url = base_match.group(1)
            html = response.read().decode('utf-8', 'ignore')
            pub_id = None
            
            # Matches
            match = re.search(r'window\._preloads\s*=\s*JSON\.parse\("(.*?)"\)', html)
            if match:
                try:
                    decoded = json.loads('"' + match.group(1) + '"')
                    data = json.loads(decoded)
                    pub_id = data.get('pub', {}).get('id')
                except:
                    pass
            if not pub_id:
                match_id = re.search(r'"publication_id"\s*:\s*(\d+)', html)
                if match_id:
                    pub_id = int(match_id.group(1))
            return pub_id, base_url
    except Exception as e:
        return None, base_url

def fetch_recommendations(subdomain):
    """Fetches recommendations from Substack internal API."""
    pub_id, base_url = resolve_pub_id_and_url(subdomain)
    if not pub_id:
        return []
    url = f"{base_url}/api/v1/recommendations/from/{pub_id}"
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json'}
    )
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=8) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        return []

def fetch_archive_posts(subdomain, limit=10):
    """Fetches recent posts metadata for a subdomain."""
    url = f"https://{subdomain}.substack.com/api/v1/archive?sort=new&limit={limit}"
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'Mozilla/5.0'}
    )
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=8) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        return []

def fetch_post_html(post_url):
    """Fetches full HTML of a specific post."""
    req = urllib.request.Request(
        post_url,
        headers={'User-Agent': 'Mozilla/5.0'}
    )
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=8) as response:
            return response.read().decode('utf-8', 'ignore')
    except Exception as e:
        return ""

def audit_single_post(post):
    """Analyzes text density of clickbait, technical, and commercial keywords."""
    url = post.get("canonical_url")
    title = post.get("title", "")
    subtitle = post.get("subtitle", "") or ""
    
    html = fetch_post_html(url)
    clean_text = clean_html(html)
    text_to_search = f"{title} {subtitle} {clean_text}".lower()
    
    words = len(text_to_search.split())
    if words == 0:
        words = 1
        
    # Count occurrences
    cb_count = sum(len(re.findall(pat, text_to_search)) for pat in CLICKBAIT_PATTERNS)
    tech_count = sum(len(re.findall(pat, text_to_search)) for pat in TECH_PATTERNS)
    comm_count = sum(len(re.findall(pat, text_to_search)) for pat in SPONSOR_PATTERNS)
    
    # Title Clickbait Penalty
    title_search = f"{title} {subtitle}".lower()
    title_cb = sum(1 for pat in CLICKBAIT_PATTERNS if re.search(pat, title_search))
    
    # Calculate density scores (normalized per 1,000 words)
    cb_density = (cb_count / words) * 1000
    tech_density = (tech_count / words) * 1000
    comm_density = (comm_count / words) * 1000
    
    # Scale to 0-100 metrics
    cb_score = min(100.0, cb_density * 18.0 + (title_cb * 15.0))
    tech_score = min(100.0, tech_density * 8.0)
    comm_score = min(100.0, comm_density * 22.0)
    
    # Smoke Index (Índice de Humo)
    smoke_index = max(0.0, min(100.0, (cb_score * 0.45) + (comm_score * 0.45) - (tech_score * 0.10)))
    
    classification = "Hype-driven / Divulgativo"
    if comm_score >= 45:
        classification = "Comercial / Patrocinado"
    elif tech_score >= 35:
        classification = "Técnico / Práctico"
        
    return {
        "title": title,
        "url": url,
        "words": words,
        "cb_score": round(cb_score, 1),
        "tech_score": round(tech_score, 1),
        "comm_score": round(comm_score, 1),
        "smoke_index": round(smoke_index, 1),
        "classification": classification
    }

def calculate_network_drift(subdomain, live_recs):
    """Calculates co-recommendation stability and drift indices compared to baseline JSON."""
    if not os.path.exists(BASELINE_PATH):
        return {"stability_index": 100.0, "drift_index": 0.0, "added": [], "removed": []}
        
    try:
        with open(BASELINE_PATH, "r", encoding="utf-8") as f:
            baseline_data = json.load(f)
    except Exception as e:
        return {"stability_index": 100.0, "drift_index": 0.0, "added": [], "removed": []}
        
    baseline_recs = baseline_data.get(subdomain, {}).get("recommendations", [])
    baseline_subs = {r.get("subdomain") for r in baseline_recs if r.get("subdomain")}
    live_subs = {r.get("subdomain") for r in live_recs if r.get("subdomain")}
    
    if not baseline_subs:
        # If no baseline, live recommendations become baseline
        return {"stability_index": 100.0, "drift_index": 0.0, "added": list(live_subs), "removed": []}
        
    added = list(live_subs - baseline_subs)
    removed = list(baseline_subs - live_subs)
    
    intersection = len(baseline_subs & live_subs)
    union = len(baseline_subs | live_subs)
    
    stability = (intersection / union) * 100.0 if union > 0 else 100.0
    drift = 100.0 - stability
    
    return {
        "stability_index": round(stability, 2),
        "drift_index": round(drift, 2),
        "added": added,
        "removed": removed
    }

def generate_telemetry_html(audit_results, history_lines):
    """Generates styled HTML containing the telemetry cards and hacker console log."""
    now_str = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
    
    html = f"""
  <div class="cronos-dashboard" style="background: rgba(10, 10, 10, 0.85); border: 1px solid rgba(43, 59, 229, 0.2); border-radius: 12px; padding: 2rem; margin: 2rem 0; font-family: 'Inter', sans-serif;">
    <div class="cronos-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 1.5rem; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.5rem; margin: 0; color: #FFF; display: flex; align-items: center; gap: 0.5rem;">
          <span style="color: #2B3BE5; font-family: 'JetBrains Mono'; font-weight: 700;">CRONOS‑Ω:</span> Telemetría de Reputación y Drift de Red
        </h3>
        <p style="font-size: 0.85rem; color: #888; margin: 0.25rem 0 0 0;">Monitoreo automatizado recurrente del archivo Substack y co‑recomendaciones.</p>
      </div>
      <div style="text-align: right;">
        <span style="font-family: 'JetBrains Mono'; font-size: 0.8rem; background: rgba(43, 59, 229, 0.15); color: #00f3ff; border: 1px solid rgba(0, 243, 255, 0.3); border-radius: 4px; padding: 4px 8px; display: inline-block;">
          ● DAEMON ACTIVO: {now_str}
        </span>
      </div>
    </div>
    
    <div class="cronos-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem;">
"""
    for seed in SEEDS:
        res = audit_results[seed]
        metrics = res["metrics"]
        drift = res["drift"]
        
        # Determine color indicators for smoke index
        smoke = metrics["smoke_index"]
        if smoke >= 40:
            smoke_color = "#ff3355" # Cortisol Red
            smoke_bg = "rgba(255, 51, 85, 0.1)"
            smoke_label = "HUMO ELEVADO / EXTRACTIVO"
        elif smoke >= 20:
            smoke_color = "#ff9f1c" # Amber
            smoke_bg = "rgba(255, 159, 28, 0.1)"
            smoke_label = "DINÁMICA COMERCIAL MIXTA"
        else:
            smoke_color = "#00f3ff" # Dopamine Blue
            smoke_bg = "rgba(0, 243, 255, 0.1)"
            smoke_label = "ORGANIC / PURAMENTE TÉCNICO"
            
        drift_color = "#ff3355" if drift["drift_index"] > 5.0 else "#888"
        drift_status = f"+{len(drift['added'])} / -{len(drift['removed'])}" if (drift['added'] or drift['removed']) else "Estable"
        
        html += f"""
      <div class="cronos-card" style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; transition: border 0.3s;" onmouseover="this.style.borderColor='rgba(43,59,229,0.4)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.05)'">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
            <a href="https://{seed}.substack.com" target="_blank" style="text-decoration: none; color: #FFF; font-family: 'Outfit', sans-serif; font-size: 1.2rem; font-weight: 600;">
              {seed}.substack
            </a>
            <span style="font-family: 'JetBrains Mono'; font-size: 0.75rem; color: #888; background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px;">
              Ref: {res['recs_count']} recs
            </span>
          </div>
          
          <div style="background: {smoke_bg}; border: 1px solid {smoke_color}44; border-radius: 6px; padding: 8px 12px; margin-bottom: 1rem; text-align: center;">
            <div style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; color: {smoke_color}; font-weight: bold;">Índice de Humo</div>
            <div style="font-family: 'Outfit', sans-serif; font-size: 1.8rem; font-weight: 800; color: #FFF; margin: 2px 0;">{smoke}</div>
            <div style="font-size: 0.65rem; color: {smoke_color}; font-family: 'JetBrains Mono';">{smoke_label}</div>
          </div>
          
          <!-- Metodos de densidades -->
          <div style="margin-bottom: 1rem; font-size: 0.8rem;">
            <div style="margin-bottom: 6px;">
              <div style="display: flex; justify-content: space-between; color: #bbb; margin-bottom: 2px;">
                <span>Anclajes Clickbait</span>
                <span style="font-family: 'JetBrains Mono'; font-weight: bold;">{metrics['clickbait']}%</span>
              </div>
              <div style="width: 100%; height: 5px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden;">
                <div style="width: {metrics['clickbait']}%; height: 100%; background: #ff3355;"></div>
              </div>
            </div>
            
            <div style="margin-bottom: 6px;">
              <div style="display: flex; justify-content: space-between; color: #bbb; margin-bottom: 2px;">
                <span>Densidad Técnica</span>
                <span style="font-family: 'JetBrains Mono'; font-weight: bold;">{metrics['technical']}%</span>
              </div>
              <div style="width: 100%; height: 5px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden;">
                <div style="width: {metrics['technical']}%; height: 100%; background: #00f3ff;"></div>
              </div>
            </div>
            
            <div style="margin-bottom: 6px;">
              <div style="display: flex; justify-content: space-between; color: #bbb; margin-bottom: 2px;">
                <span>Llamadas Comerciales</span>
                <span style="font-family: 'JetBrains Mono'; font-weight: bold;">{metrics['commercial']}%</span>
              </div>
              <div style="width: 100%; height: 5px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden;">
                <div style="width: {metrics['commercial']}%; height: 100%; background: #2B3BE5;"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.75rem; margin-top: 0.5rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: #888;">
          <div>
            <span>Drift Red:</span>
            <span style="font-family: 'JetBrains Mono'; color: {drift_color}; font-weight: bold;">{drift['drift_index']}%</span>
          </div>
          <div>
            <span>Cambios:</span>
            <span style="font-family: 'JetBrains Mono'; color: #FFF;">{drift_status}</span>
          </div>
        </div>
      </div>
"""
      
    # Add history log terminal
    log_content = "".join(f"<div style='margin-bottom: 4px; border-left: 2px solid rgba(0, 243, 255, 0.4); padding-left: 8px;'>{line}</div>" for line in history_lines)
    
    html += f"""
    </div>
    
    <div class="cronos-terminal-container">
      <h4 style="font-family: 'Outfit', sans-serif; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 0.5rem;">Registro Histórico de Auditorías (Drift Telemetry)</h4>
      <div class="cronos-terminal" style="background: #050505; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 6px; padding: 1rem; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: #00f3ff; height: 140px; overflow-y: auto; box-shadow: inset 0 0 15px rgba(0,0,0,0.8);">
        {log_content}
      </div>
    </div>
  </div>
"""
    return html

def main():
    print("┌────────────────────────────────────────────────────────┐")
    print("│ CRONOS-Ω: BOOTING DEEP AUDIT & DRIFT ANALYSIS          │")
    print("└────────────────────────────────────────────────────────┘")
    
    audit_results = {}
    
    for seed in SEEDS:
        print(f"\n[*] Auditing Subdomain: {seed}")
        
        # 1. Fetch live recommendations
        raw_recs = fetch_recommendations(seed)
        live_recs = []
        for rec in raw_recs:
            target_pub = rec.get('recommendedPublication') or rec.get('target_pub') or {}
            if target_pub.get('subdomain'):
                live_recs.append({
                    'subdomain': target_pub.get('subdomain'),
                    'name': target_pub.get('name')
                })
                
        # 2. Calculate network drift
        drift_metrics = calculate_network_drift(seed, live_recs)
        print(f"    - Recommendations Found: {len(live_recs)}")
        print(f"    - Network Drift Index: {drift_metrics['drift_index']}% (Stability: {drift_metrics['stability_index']}%)")
        if drift_metrics['added']:
            print(f"      [+] Added recommendations: {drift_metrics['added']}")
        if drift_metrics['removed']:
            print(f"      [-] Removed recommendations: {drift_metrics['removed']}")
            
        # 3. Fetch latest posts for audit
        posts = fetch_archive_posts(seed, limit=8)
        print(f"    - Auditing latest {len(posts)} articles...")
        
        audited_articles = []
        with ThreadPoolExecutor(max_workers=8) as executor:
            futures = {executor.submit(audit_single_post, p): p for p in posts}
            for future in as_completed(futures):
                try:
                    res = future.result()
                    audited_articles.append(res)
                except Exception as e:
                    print(f"      [!] Failed to audit article: {e}")
                    
        # Compute averages
        if audited_articles:
            avg_cb = sum(a["cb_score"] for a in audited_articles) / len(audited_articles)
            avg_tech = sum(a["tech_score"] for a in audited_articles) / len(audited_articles)
            avg_comm = sum(a["comm_score"] for a in audited_articles) / len(audited_articles)
            avg_smoke = sum(a["smoke_index"] for a in audited_articles) / len(audited_articles)
        else:
            avg_cb = avg_tech = avg_comm = avg_smoke = 0.0
            
        print(f"    - Avg Clickbait Score: {avg_cb:.1f}")
        print(f"    - Avg Tech Score: {avg_tech:.1f}")
        print(f"    - Avg Commercial Score: {avg_comm:.1f}")
        print(f"    - Avg Smoke Index: {avg_smoke:.1f}")
        
        audit_results[seed] = {
            "subdomain": seed,
            "recs_count": len(live_recs),
            "drift": drift_metrics,
            "metrics": {
                "clickbait": round(avg_cb, 1),
                "technical": round(avg_tech, 1),
                "commercial": round(avg_comm, 1),
                "smoke_index": round(avg_smoke, 1)
            },
            "articles": audited_articles
        }
        
    # Write aggregated result to JSON
    report = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "results": audit_results
    }
    
    with open(OUTPUT_AUDIT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    print(f"\n[✓] Extracted data saved to: {OUTPUT_AUDIT_PATH}")
    
    # Write history log entry
    log_line = f"{time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())} | aimafia_smoke={audit_results['aimafia']['metrics']['smoke_index']} | aimafia_drift={audit_results['aimafia']['drift']['drift_index']}% | cosasdefreelance_smoke={audit_results['cosasdefreelance']['metrics']['smoke_index']} | webreactiva_smoke={audit_results['webreactiva']['metrics']['smoke_index']}\n"
    with open(HISTORY_LOG_PATH, "a", encoding="utf-8") as f:
        f.write(log_line)
    print(f"[✓] Cronos log saved to: {HISTORY_LOG_PATH}")
    
    # Read history file to extract lines
    history_lines = []
    if os.path.exists(HISTORY_LOG_PATH):
        with open(HISTORY_LOG_PATH, "r", encoding="utf-8") as f:
            history_lines = f.readlines()
    # Keep last 10 runs
    history_lines = [line.strip() for line in history_lines[-10:]]
    
    # Generate UI block
    telemetry_html = generate_telemetry_html(audit_results, history_lines)
    
    # Inject into HTML template
    if os.path.exists(HTML_REPORT_PATH):
        with open(HTML_REPORT_PATH, "r", encoding="utf-8") as f:
            html_content = f.read()
            
        start_tag = "<!-- CRONOS_MONITOR_START -->"
        end_tag = "<!-- CRONOS_MONITOR_END -->"
        
        start_idx = html_content.find(start_tag)
        end_idx = html_content.find(end_tag)
        
        if start_idx != -1 and end_idx != -1:
            injected_content = html_content[:start_idx + len(start_tag)] + "\n" + telemetry_html + "\n  " + html_content[end_idx:]
            with open(HTML_REPORT_PATH, "w", encoding="utf-8") as f:
                f.write(injected_content)
            print(f"[✓] Successfully injected telemetry HTML into {HTML_REPORT_PATH}")
        else:
            print("[!] Could not locate injection markers in HTML file.")
    else:
        print(f"[!] Target report file {HTML_REPORT_PATH} not found.")
        
    # Trigger Vite Re-compile
    print("[*] Launching Vite compiler...")
    try:
        res = subprocess.run(["npm", "run", "build"], cwd=BASE_DIR, capture_output=True, text=True, check=True)
        print("[✓] Vite compilation successfully completed.")
    except Exception as e:
        print(f"[!] Vite compilation failed: {e}")
        
    print("┌────────────────────────────────────────────────────────┐")
    print("│ CRONOS-Ω: DEEP AUDIT RUN COMPLETED                     │")
    print("└────────────────────────────────────────────────────────┘")

if __name__ == "__main__":
    main()
