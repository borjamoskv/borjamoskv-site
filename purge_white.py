import os
import re

DIR = '/Users/borjafernandezangulo/10_PROJECTS/web/borjamoskv_site/'
EXTS = {'.html', '.css', '.js'}

def purge_white(content):
    # Hex
    content = re.sub(r'(?i)#ffffff\b', '#D4D4D4', content)
    content = re.sub(r'(?i)#fff\b', '#D4D4D4', content)
    
    # RGBA / RGB
    content = re.sub(r'(?i)rgba\(\s*255\s*,\s*255\s*,\s*255\s*,', 'rgba(212, 212, 212,', content)
    content = re.sub(r'(?i)rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)', 'rgb(212, 212, 212)', content)
    
    # CSS named colors 'white' 
    for _ in range(5):
        content = re.sub(r'(?i)((?:color|background(?:-color|-image)?|border(?:-[a-z]+)*|box-shadow|text-shadow|fill|stroke)\s*:[^;}"\n]*?)(?<!-)\bwhite\b(?!-)', r'\1#D4D4D4', content)
        
    return content

count = 0
for root, _, files in os.walk(DIR):
    if '.git' in root or 'node_modules' in root:
        continue
    for f in files:
        if any(f.endswith(ext) for ext in EXTS):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as f_in:
                try:
                    content = f_in.read()
                except UnicodeDecodeError:
                    continue
            
            new_content = purge_white(content)
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f_out:
                    f_out.write(new_content)
                print(f"Updated {path.replace(DIR, '')}")
                count += 1

print(f"Total files updated: {count}")
