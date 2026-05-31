import urllib.request
import re
import json
import ssl
import os
from html.parser import HTMLParser

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

class HTMLToMarkdown(HTMLParser):
    def __init__(self):
        super().__init__()
        self.result = []
        self.list_depth = 0
        self.in_p = False
        self.in_pre = False

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            level = int(tag[1])
            self.result.append('\n\n' + '#' * level + ' ')
        elif tag == 'p':
            self.result.append('\n\n')
            self.in_p = True
        elif tag == 'br':
            self.result.append('\n')
        elif tag == 'strong':
            self.result.append('**')
        elif tag == 'em' or tag == 'i':
            self.result.append('*')
        elif tag == 'code':
            if self.in_pre:
                pass
            else:
                self.result.append('`')
        elif tag == 'pre':
            self.result.append('\n\n```\n')
            self.in_pre = True
        elif tag == 'a':
            self.result.append('[')
        elif tag == 'ul':
            self.list_depth += 1
            self.result.append('\n')
        elif tag == 'ol':
            self.list_depth += 1
            self.result.append('\n')
        elif tag == 'li':
            indent = '  ' * (self.list_depth - 1)
            self.result.append(f'\n{indent}- ')
        elif tag == 'blockquote':
            self.result.append('\n\n> ')

    def handle_endtag(self, tag):
        if tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            self.result.append('\n')
        elif tag == 'p':
            self.in_p = False
        elif tag == 'strong':
            self.result.append('**')
        elif tag == 'em' or tag == 'i':
            self.result.append('*')
        elif tag == 'code':
            if self.in_pre:
                pass
            else:
                self.result.append('`')
        elif tag == 'pre':
            self.result.append('\n```\n')
            self.in_pre = False
        elif tag == 'a':
            self.result.append(']')
        elif tag == 'ul' or tag == 'ol':
            self.list_depth -= 1
            self.result.append('\n')
        elif tag == 'blockquote':
            self.result.append('\n\n')

    def handle_data(self, data):
        self.result.append(data)

def html_to_md(html_content):
    if not html_content:
        return ""
    parser = HTMLToMarkdown()
    parser.feed(html_content)
    md = "".join(parser.result)
    # clean up multiple empty lines
    md = re.sub(r'\n{3,}', '\n\n', md)
    return md.strip()

def fetch_all_posts():
    os.makedirs('/Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site/substack_archive', exist_ok=True)
    archive_url = 'https://borjamoskv.substack.com/api/v1/archive?limit=50&offset=0'
    req = urllib.request.Request(archive_url, headers={'User-Agent': 'Mozilla/5.0'})
    
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            posts = json.loads(response.read().decode('utf-8'))
        
        print(f"Found {len(posts)} posts. Starting extraction...")
        
        for idx, p in enumerate(posts):
            slug = p.get('slug')
            title = p.get('title')
            if not slug:
                continue
                
            post_url = f"https://borjamoskv.substack.com/p/{slug}"
            print(f"[{idx+1}/{len(posts)}] Fetching {slug}...")
            
            post_req = urllib.request.Request(post_url, headers={'User-Agent': 'Mozilla/5.0'})
            try:
                with urllib.request.urlopen(post_req, context=ctx) as response:
                    html = response.read().decode('utf-8')
                
                # Extract window._preloads
                match = re.search(r'window\._preloads\s*=\s*JSON\.parse\(\"(.*?)\"\)', html)
                if not match:
                    # try alternative without JSON.parse
                    match = re.search(r'window\._preloads\s*=\s*(.*?);\s*\n', html)
                    
                if match:
                    raw_content = match.group(1)
                    if not raw_content.startswith('\"'):
                        raw_content = '\"' + raw_content + '\"'
                    unescaped = json.loads(raw_content)
                    data = json.loads(unescaped)
                    
                    post_data = data.get('post', {})
                    body_html = post_data.get('body_html', '')
                    body_md = html_to_md(body_html)
                    
                    output_data = {
                        'title': post_data.get('title', title),
                        'subtitle': post_data.get('subtitle', ''),
                        'description': post_data.get('description', ''),
                        'pub_date': post_data.get('post_date', ''),
                        'slug': slug,
                        'body_html': body_html,
                        'body_markdown': body_md
                    }
                    
                    # save json
                    with open(f'/Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site/substack_archive/{slug}.json', 'w') as f:
                        json.dump(output_data, f, indent=2, ensure_ascii=False)
                        
                    # save md
                    with open(f'/Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site/substack_archive/{slug}.md', 'w') as f:
                        f.write(f"# {output_data['title']}\n")
                        if output_data['subtitle']:
                            f.write(f"## {output_data['subtitle']}\n\n")
                        f.write(f"> **Fecha:** {output_data['pub_date']}\n")
                        f.write(f"> **Substack URL:** {post_url}\n\n")
                        f.write("---\n\n")
                        f.write(body_md)
                        
                    print(f"Saved {slug} (markdown length: {len(body_md)})")
                else:
                    print(f"Could not find preloads for {slug}")
            except Exception as e:
                print(f"Failed to fetch details for {slug}: {e}")
                
    except Exception as e:
        print(f"Failed to fetch archive list: {e}")

if __name__ == '__main__':
    fetch_all_posts()
