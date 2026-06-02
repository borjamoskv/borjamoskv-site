import os
import re
import glob

PAGES_DIR = "/Users/borjafernandezangulo/10_PROJECTS/borjamoskv-v2/src/pages"

astro_files = glob.glob(os.path.join(PAGES_DIR, "*.astro"))

def add_is_inline(match):
    # original tag: <script ... src="..." ...>
    tag = match.group(0)
    # Check if it already has is:inline
    if "is:inline" in tag:
        return tag
    
    # Check if src is an absolute http url
    src_match = re.search(r'src="(.*?)"', tag)
    if src_match:
        src = src_match.group(1)
        if src.startswith("http"):
            return tag
            
    # Inject is:inline after <script
    return tag.replace("<script", "<script is:inline", 1)

for file_path in astro_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Find all <script ... src="..."> tags
    new_content = re.sub(r'<script[^>]*?src="[^"]+"[^>]*>', add_is_inline, content)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {os.path.basename(file_path)}")
