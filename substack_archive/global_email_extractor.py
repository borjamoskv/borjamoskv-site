import csv
import urllib.request
import urllib.parse
import re
import ssl
import time
import sys
from html.parser import HTMLParser
from concurrent.futures import ThreadPoolExecutor, as_completed

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
}

email_pattern = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')
ignore_domains = {'sentry.io', 'w3.org', 'google.com', 'apple.com', 'example.com', 'substack.com', 'twitter.com', 'x.com', 'linkedin.com', 'github.com', 'facebook.com', 'instagram.com', 'youtube.com', 'sentry.w3.org'}
ignore_starts = {'noreply', 'mailer', 'postmaster', 'admin', 'info', 'hello', 'support', 'help', 'contact', 'no-reply'}

class LinkExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = set()
    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            for attr, val in attrs:
                if attr == 'href' and val is not None and val.startswith('http'):
                    self.links.add(val)

def get_html(url):
    try:
        req = urllib.request.Request(url, headers=headers)
        return urllib.request.urlopen(req, context=ctx, timeout=5).read().decode('utf-8', errors='ignore')
    except Exception:
        return ""

def extract_emails(text):
    valid = set()
    for m in email_pattern.findall(text):
        email = m.lower()
        if '@' in email:
            user, domain = email.split('@', 1)
            if domain not in ignore_domains and user not in ignore_starts:
                valid.add(email)
    return valid

def process_node(node):
    urls_to_check = [f"https://{node}.substack.com", f"https://{node}.substack.com/about"]
    found_emails = set()
    external_links = set()
    
    for url in urls_to_check:
        html = get_html(url)
        found_emails.update(extract_emails(html))
        
        parser = LinkExtractor()
        parser.feed(html)
        for link in parser.links:
            parsed = urllib.parse.urlparse(link)
            domain = parsed.netloc.replace('www.', '')
            if domain not in ignore_domains and 'substack' not in domain:
                external_links.add(link)
                
    if not found_emails:
        # Check personal sites up to 2 links to save time
        for ext_link in list(external_links)[:2]:
            html = get_html(ext_link)
            found_emails.update(extract_emails(html))
            if found_emails:
                break
                
    if not found_emails:
        found_emails.add(f"{node}@substack.com")
        
    return node, list(found_emails)

def main():
    input_file = 'mass_exergy_full_list.csv'
    output_file = 'global_mass_exergy_emails.csv'
    
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            nodes = [row['Subdomain'] for row in reader if row.get('Subdomain')]
    except FileNotFoundError:
        print(f"Error: {input_file} not found.")
        sys.exit(1)
        
    print(f"Loaded {len(nodes)} nodes for GLOBAL deep scan.")
    
    results = []
    completed = 0
    total = len(nodes)
    start_time = time.time()
    
    # Use 20 threads to speed up processing of 3000 nodes
    with ThreadPoolExecutor(max_workers=20) as executor:
        future_to_node = {executor.submit(process_node, node): node for node in nodes}
        
        for future in as_completed(future_to_node):
            node, emails = future.result()
            for email in emails:
                results.append({'Subdomain': node, 'Email': email})
            
            completed += 1
            if completed % 100 == 0:
                elapsed = time.time() - start_time
                rate = completed / elapsed
                rem = (total - completed) / rate if rate > 0 else 0
                print(f"Progress: {completed}/{total} ({completed/total*100:.1f}%) | Speed: {rate:.1f} nodes/s | ETA: {rem/60:.1f} min")
                
    # Save results
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['Subdomain', 'Email'])
        writer.writeheader()
        writer.writerows(results)
        
    print(f"Global scan complete. Wrote {len(results)} rows to {output_file}.")

if __name__ == '__main__':
    main()
