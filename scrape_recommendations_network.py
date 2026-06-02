#!/usr/bin/env python3
"""
Substack Recommendations Network Extractor
API-driven, non-fragile data extraction of co-recommendation networks on Substack.
Queries the internal Substack JSON endpoint directly with correct browser headers.
"""

import urllib.request
import json
import ssl
import sys
import os
import time

# Disable SSL verification for scripting simplicity
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def fetch_recommendations(subdomain):
    """
    Fetches the structured recommendation list of a Substack subdomain directly from their internal API.
    """
    url = f"https://{subdomain}.substack.com/api/v1/recommendations"
    print(f"[*] Querying API for: {subdomain} ({url})")
    
    req = urllib.request.Request(
        url,
        headers={
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
            'Referer': f'https://{subdomain}.substack.com/about'
        }
    )
    
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
            return data
    except urllib.error.HTTPError as e:
        print(f"[!] HTTP Error {e.code} for {subdomain}: {e.reason}")
        return None
    except Exception as e:
        print(f"[!] Error fetching recommendations for {subdomain}: {e}")
        return None

def build_network(seeds, max_depth=2):
    """
    Recursively builds a co-recommendation network graph starting from a set of seed subdomains.
    """
    graph = {}
    queue = [(seed, 0) for seed in seeds]
    visited = set()
    
    print(f"[*] Initializing network build from seed subdomains: {seeds}")
    
    while queue:
        subdomain, depth = queue.pop(0)
        
        if subdomain in visited:
            continue
        visited.add(subdomain)
        
        # Rate limit to be respectful
        time.sleep(1.0)
        
        recs = fetch_recommendations(subdomain)
        if recs is None:
            continue
            
        # Extract fields
        extracted_recs = []
        for rec in recs:
            # Substack API returns a list of target publication objects
            target_pub = rec.get('target_pub', {})
            if not target_pub:
                continue
                
            rec_info = {
                'id': target_pub.get('id'),
                'name': target_pub.get('name'),
                'subdomain': target_pub.get('subdomain'),
                'author_name': target_pub.get('author_name'),
                'subscribers': target_pub.get('freeSubscriberCountOrderOfMagnitude'),
                'description': target_pub.get('hero_text')
            }
            extracted_recs.append(rec_info)
            
            # Queue the recommended subdomain for the next depth level
            next_sub = target_pub.get('subdomain')
            if next_sub and depth < max_depth - 1:
                queue.append((next_sub, depth + 1))
                
        graph[subdomain] = {
            'subdomain': subdomain,
            'recommendations': extracted_recs
        }
        print(f"[+] Found {len(extracted_recs)} recommendations for {subdomain}")
        
    return graph

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scrape_recommendations_network.py <seed_subdomain1> [seed_subdomain2 ...]")
        print("Example: python3 scrape_recommendations_network.py borjamoskv")
        sys.exit(1)
        
    seeds = sys.argv[1:]
    graph = build_network(seeds, max_depth=2)
    
    output_path = "/Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site/substack_archive/recommendations_graph.json"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(graph, f, indent=2, ensure_ascii=False)
        
    print(f"\n[✓] Network mapping complete. Saved {len(graph)} nodes to: {output_path}")

if __name__ == "__main__":
    main()
