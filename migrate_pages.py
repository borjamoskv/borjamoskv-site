import os
import re

SOURCE_DIR = "/Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site"
TARGET_DIR = "/Users/borjafernandezangulo/10_PROJECTS/borjamoskv-v2/src/pages"

pages_to_migrate = [
    "blog.html",
    "index.html",
    "gurus.html"
]

# Regex patterns for link replacement
# Replace href="blog.html" -> href="/blog"
# Replace href="gurus.html" -> href="/gurus"
# Replace href="index.html" -> href="/"
# Replace href="benchmark-humo.html" -> href="/benchmark-humo"
# Replace href="some-article.html" -> href="/blog/some-article"

def transform_href(match):
    original_href = match.group(1)
    
    if original_href.startswith("http") or original_href.startswith("#") or original_href.startswith("/"):
        return f'href="{original_href}"'
        
    if original_href == "index.html":
        return 'href="/"'
    elif original_href == "blog.html":
        return 'href="/blog"'
    elif original_href == "gurus.html":
        return 'href="/gurus"'
    elif original_href == "benchmark-humo.html":
        return 'href="/benchmark-humo"'
    elif original_href.endswith(".html"):
        slug = original_href.replace(".html", "")
        return f'href="/blog/{slug}"'
        
    return f'href="{original_href}"'

for page in pages_to_migrate:
    src_path = os.path.join(SOURCE_DIR, page)
    if not os.path.exists(src_path):
        continue
        
    with open(src_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Replace links
    content = re.sub(r'href="(.*?)"', transform_href, content)
    
    # Optional: replace <script src="article.js"> to <script src="/article.js">
    content = re.sub(r'src="(?!http|/)(.*?\.js)"', r'src="/\1"', content)
    content = re.sub(r'href="(?!http|/)(.*?\.css)"', r'href="/\1"', content)
    
    # Save as .astro
    target_name = page.replace(".html", ".astro")
    
    # Special case: original borjamoskv-v2/src/pages/index.astro exists from create-astro. Overwrite it.
    target_path = os.path.join(TARGET_DIR, target_name)
    with open(target_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"[C5-REAL] Ported {page} to {target_name}")
