#!/usr/bin/env python3
"""
SWARM-Ω: 200 Concurrent Agent Emulator for 100% Archive Audit.
Performs deterministic quantitative and qualitative analysis of all aimafia.substack.com articles.
"""

import urllib.request
import json
import ssl
import re
import sys
import os
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

# Disable SSL verification for scripting ease
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

API_ARCHIVE_URL = "https://aimafia.substack.com/api/v1/archive?sort=new&limit=250"
OUTPUT_PATH = "/Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site/substack_archive/aimafia_full_audit.json"

# Keywords for heuristics
CLICKBAIT_KEYWORDS = [
    r"superar", r"secreto", r"la verdad", r"hype", r"gratis", r"definitiva",
    r"life hack", r"🍌", r"100\s*%", r"morir", r"gratuita", r"mentira", r"rico",
    r"injusta", r"nadie te cuenta", r"obsesión", r"revelación", r"definitivo"
]

TECH_KEYWORDS = [
    r"python", r"api", r"git", r"mmap", r"json", r"rust", r"arxiv", r"benchmark",
    r"complexity", r"rag", r"vector", r"database", r"token", r"ast", r"prompt",
    r"context engineering", r"workflow", r"agente", r"llm", r"model"
]

SPONSOR_KEYWORDS = [
    r"patrocinado", r"sponsor", r"holded", r"gratis aquí", r"afiliado", r"14 días gratis"
]

def fetch_post_content(post_url):
    """Downloads the HTML of a post to parse its body."""
    req = urllib.request.Request(
        post_url,
        headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'}
    )
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=8) as response:
            return response.read().decode('utf-8', 'ignore')
    except Exception as e:
        return ""

def audit_article(post_meta):
    """
    Audits a single post by downloading and applying heuristic analysis.
    This runs in parallel within the thread pool (representing individual agents).
    """
    title = post_meta.get("title", "")
    subtitle = post_meta.get("subtitle", "") or ""
    slug = post_meta.get("slug", "")
    canonical_url = post_meta.get("canonical_url", "")
    post_date = post_meta.get("post_date", "")
    
    # Download full body
    html_body = fetch_post_content(canonical_url)
    body_length = len(html_body)
    
    # If fetch failed, fallback to metadata descriptions
    text_to_search = f"{title} {subtitle} {html_body}".lower()
    
    # 1. Clickbait Score
    clickbait_matches = 0
    for kw in CLICKBAIT_KEYWORDS:
        if re.search(kw, text_to_search):
            clickbait_matches += 1
    clickbait_score = min(100, int((clickbait_matches / 4) * 100))
    
    # 2. Technical Score
    tech_matches = 0
    for kw in TECH_KEYWORDS:
        if re.search(kw, text_to_search):
            tech_matches += 1
            
    # Check for actual code blocks (<pre> or <code>)
    code_blocks = len(re.findall(r'<pre\b[^>]*>|<code\b[^>]*>', html_body))
    tech_score = min(100, int(((tech_matches + (code_blocks * 3)) / 10) * 100))
    
    # 3. Commercial Score
    commercial_matches = 0
    for kw in SPONSOR_KEYWORDS:
        if re.search(kw, text_to_search):
            commercial_matches += 1
    commercial_score = min(100, int((commercial_matches / 2) * 100))
    
    # Category Classification
    if commercial_score >= 50:
        classification = "Comercial / Patrocinado"
    elif tech_score >= 40:
        classification = "Técnico / Práctico"
    else:
        classification = "Hype-driven / Divulgativo"
        
    return {
        "title": title,
        "subtitle": subtitle,
        "slug": slug,
        "date": post_date,
        "url": canonical_url,
        "body_length_chars": body_length,
        "code_blocks_count": code_blocks,
        "clickbait_score": clickbait_score,
        "technical_score": tech_score,
        "commercial_score": commercial_score,
        "classification": classification
    }

def main():
    print("[*] Fetching archive catalog from AI Mafia (with pagination)...")
    posts = []
    offset = 0
    limit = 50
    
    while True:
        url = f"https://aimafia.substack.com/api/v1/archive?sort=new&limit={limit}&offset={offset}"
        req = urllib.request.Request(
            url,
            headers={'User-Agent': 'Mozilla/5.0'}
        )
        try:
            with urllib.request.urlopen(req, context=ctx, timeout=8) as response:
                page_posts = json.loads(response.read().decode('utf-8'))
                if not page_posts:
                    break
                posts.extend(page_posts)
                print(f"    Fetched {len(page_posts)} posts (Offset: {offset})")
                if len(page_posts) < limit:
                    break
                offset += limit
                time.sleep(0.5) # Throttle requests slightly
        except Exception as e:
            print(f"[!] Failed to fetch archive metadata at offset {offset}: {e}")
            break
            
    total_posts = len(posts)
    if total_posts == 0:
        print("[!] No posts retrieved. Exiting.")
        sys.exit(1)
        
    print(f"[+] Found {total_posts} total articles in archive.")
    
    # Trigger Swarm: 200 concurrent threads (representing 200 processing agents)
    max_workers = 200
    print(f"[*] Booting Swarm: Orchestrating {max_workers} concurrent parser agents...")
    
    audited_data = []
    
    start_time = time.time()
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Submit all tasks
        futures = {executor.submit(audit_article, p): p for p in posts}
        
        completed_count = 0
        for future in as_completed(futures):
            completed_count += 1
            res = future.result()
            audited_data.append(res)
            if completed_count % 10 == 0 or completed_count == total_posts:
                print(f"    [{completed_count}/{total_posts}] Articles processed.")
                
    elapsed = time.time() - start_time
    print(f"[✓] Swarm processing complete. Elapsed time: {elapsed:.2f} seconds.")
    
    # Aggregate statistics
    class_counts = {}
    total_clickbait = 0
    total_tech = 0
    total_commercial = 0
    total_code_blocks = 0
    
    for item in audited_data:
        c = item["classification"]
        class_counts[c] = class_counts.get(c, 0) + 1
        total_clickbait += item["clickbait_score"]
        total_tech += item["technical_score"]
        total_commercial += item["commercial_score"]
        total_code_blocks += item["code_blocks_count"]
        
    avg_clickbait = total_clickbait / total_posts if total_posts > 0 else 0
    avg_tech = total_tech / total_posts if total_posts > 0 else 0
    avg_commercial = total_commercial / total_posts if total_posts > 0 else 0
    
    report = {
        "metadata": {
            "source": "aimafia.substack.com",
            "total_articles_audited": total_posts,
            "average_clickbait_score": round(avg_clickbait, 1),
            "average_technical_score": round(avg_tech, 1),
            "average_commercial_score": round(avg_commercial, 1),
            "total_code_blocks_detected": total_code_blocks,
            "classification_distribution": class_counts
        },
        "articles": audited_data
    }
    
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
        
    print(f"\n[✓] Swarm Audit Saved. Results exported to: {OUTPUT_PATH}")
    print("\nSummary metrics:")
    print(json.dumps(report["metadata"], indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
