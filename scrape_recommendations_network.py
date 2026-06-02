#!/usr/bin/env python3
"""
Substack Recommendations Network Extractor (Robust Version)
API-driven, non-fragile data extraction of co-recommendation networks on Substack.
Resolves publication ID from HTML preloads and queries the internal recommendations API.
"""

import urllib.request
import json
import ssl
import sys
import os
import time
import re

# Disable SSL verification for scripting simplicity
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def resolve_pub_id_and_url(subdomain_or_domain):
    """
    Fetches the home/about page of a publication to extract its internal numeric publication ID.
    Supports both subdomains (e.g., 'borjamoskv') and custom domains (e.g., 'cosasdefreelance.com').
    """
    if '.' in subdomain_or_domain:
        base_url = f"https://{subdomain_or_domain}"
    else:
        base_url = f"https://{subdomain_or_domain}.substack.com"
        
    url = f"{base_url}/about"
    print(f"[*] Resolving Publication ID for: {subdomain_or_domain} from {url}")
    
    req = urllib.request.Request(
        url,
        headers={
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
        }
    )
    
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
            # Handle possible redirection (e.g. subdomain.substack.com -> customdomain.com)
            final_url = response.geturl()
            # Extract domain base from final URL
            base_match = re.match(r'(https?://[^/]+)', final_url)
            if base_match:
                base_url = base_match.group(1)
                
            html = response.read().decode('utf-8')
            
            pub_id = None
            
            # 1. Match JSON.parse window._preloads
            match = re.search(r'window\._preloads\s*=\s*JSON\.parse\("(.*?)"\)', html)
            if not match:
                match = re.search(r'window\._preloads\s*=\s*JSON\.parse\(\\\"(.*?)\\\"\)', html)
                
            if match:
                raw_content = match.group(1)
                try:
                    decoded = json.loads('"' + raw_content + '"')
                    data = json.loads(decoded)
                    pub_id = data.get('pub', {}).get('id')
                except Exception as e:
                    pass
                    
            # 2. Match raw window._preloads assignment
            if not pub_id:
                match = re.search(r'window\._preloads\s*=\s*(.*?);\s*\n', html)
                if match:
                    try:
                        data = json.loads(match.group(1))
                        pub_id = data.get('pub', {}).get('id')
                    except Exception as e:
                        pass
                        
            # 3. Match fallback structures in HTML/JSON
            if not pub_id:
                match_pub_id = re.search(r'"pub"\s*:\s*\{[^}]*?"id"\s*:\s*(\d+)', html)
                if match_pub_id:
                    pub_id = int(match_pub_id.group(1))
                    
            if not pub_id:
                match_pub_id_meta = re.search(r'"publication_id"\s*:\s*(\d+)', html)
                if match_pub_id_meta:
                    pub_id = int(match_pub_id_meta.group(1))
                    
            if not pub_id:
                match_escaped = re.search(r'\\"[Pp]ub\\"\s*:\s*\{[^}]*?\\"id\\"\s*:\s*(\d+)', html)
                if match_escaped:
                    pub_id = int(match_escaped.group(1))

            if not pub_id:
                match_escaped_id = re.search(r'\\"[Pp]ublication_id\\"\s*:\s*(\d+)', html)
                if match_escaped_id:
                    pub_id = int(match_escaped_id.group(1))
                    
            if pub_id:
                print(f"[+] Resolved {subdomain_or_domain} -> ID: {pub_id}, Base URL: {base_url}")
                return pub_id, base_url
            else:
                print(f"[!] Could not find publication ID in HTML for {subdomain_or_domain}")
                return None, base_url
                
    except Exception as e:
        print(f"[!] Failed to resolve ID for {subdomain_or_domain}: {e}")
        return None, None

def fetch_recommendations(subdomain_or_domain):
    """
    Fetches the structured recommendation list of a Substack publication from their internal API.
    """
    pub_id, base_url = resolve_pub_id_and_url(subdomain_or_domain)
    if not pub_id:
        return None
        
    url = f"{base_url}/api/v1/recommendations/from/{pub_id}"
    print(f"[*] Querying API: {url}")
    
    req = urllib.request.Request(
        url,
        headers={
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
            'Referer': f'{base_url}/about'
        }
    )
    
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
            return data
    except urllib.error.HTTPError as e:
        print(f"[!] HTTP Error {e.code} for {subdomain_or_domain}: {e.reason}")
        return None
    except Exception as e:
        print(f"[!] Error fetching recommendations for {subdomain_or_domain}: {e}")
        return None

def build_network(seeds, max_depth=2):
    """
    Recursively builds a co-recommendation network graph starting from a set of seed subdomains.
    """
    graph = {}
    queue = [(seed, 0) for seed in seeds]
    visited = set()
    
    print(f"[*] Initializing network build from seed subdomains/domains: {seeds}")
    
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
            # Substack API returns target publication in 'recommendedPublication' or 'target_pub'
            target_pub = rec.get('recommendedPublication') or rec.get('target_pub') or {}
            if not target_pub:
                continue
                
            rec_info = {
                'id': target_pub.get('id'),
                'name': target_pub.get('name'),
                'subdomain': target_pub.get('subdomain'),
                'author_name': target_pub.get('author_name') or target_pub.get('author', {}).get('name') or target_pub.get('email_from_name'),
                'subscribers': target_pub.get('freeSubscriberCountOrderOfMagnitude') or target_pub.get('freeSubscriberCount'),
                'description': target_pub.get('hero_text') or target_pub.get('description')
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
        print("Usage: python3 scrape_recommendations_network.py <seed1> [seed2 ...]")
        print("Example: python3 scrape_recommendations_network.py borjamoskv cosasdefreelance")
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
