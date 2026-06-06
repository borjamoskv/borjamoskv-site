import os
import re
import glob

# Rutas
SOURCE_DIR = "/Users/borjafernandezangulo/Documents/antigravity/agitated-volta"
TARGET_DIR = "/Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site/src/content/articles"

# Archivos a ignorar (no son artículos de blog o ya migrados)
IGNORE_FILES = {
    "index.html",
    "blog.html",
    "gurus.html",
    "benchmark-humo.html",
    "sintetologia-googlebot.html", # tal vez?
}

os.makedirs(TARGET_DIR, exist_ok=True)

# Regex patterns
title_pattern = re.compile(r'<h1 class="hero-title">(.*?)</h1>', re.IGNORECASE | re.DOTALL)
desc_pattern = re.compile(r'<meta\s+(?:name|property)="og:description"\s+content="(.*?)"\s*/?>|<meta\s+content="(.*?)"\s+name="description"\s*/?>', re.IGNORECASE)
date_pattern = re.compile(r'<span class="hero-date">(.*?)</span>', re.IGNORECASE)
body_pattern = re.compile(r'<main class="article-body">(.*?)</main>', re.IGNORECASE | re.DOTALL)
tags_pattern = re.compile(r'<span class="article-tag">(.*?)</span>', re.IGNORECASE)

html_files = glob.glob(os.path.join(SOURCE_DIR, "*.html"))

migrated = 0
for file_path in html_files:
    filename = os.path.basename(file_path)
    if filename in IGNORE_FILES:
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Validar si es un artículo verificando article-body
    body_match = body_pattern.search(content)
    if not body_match:
        # No es un artículo estándar
        continue
        
    body_html = body_match.group(1).strip()
    
    # Extraer meta
    title_match = title_pattern.search(content)
    # Limpiar title de tags (ej. <span class="title-accent">)
    raw_title = title_match.group(1) if title_match else filename.replace(".html", "")
    title = re.sub(r'<[^>]+>', '', raw_title).strip()
    title = title.replace('"', '\\"') # escape quotes
    
    desc_match = desc_pattern.search(content)
    description = ""
    if desc_match:
        description = desc_match.group(1) or desc_match.group(2)
        if description:
            description = description.replace('"', '\\"')
            
    date_match = date_pattern.search(content)
    date_str = date_match.group(1) if date_match else "2026-01-01"
    
    # Extraer tags
    tags = tags_pattern.findall(content)
    tags_yaml = "\n".join([f"  - '{tag}'" for tag in tags]) if tags else ""
    if not tags_yaml:
        tags_yaml = "  - 'Cortex'"
        
    slug = filename.replace(".html", "")
    
    # Generar MDX
    mdx_content = f"""---
title: "{title}"
description: "{description}"
pubDate: "{date_str}"
tags:
{tags_yaml}
---

{body_html}
"""

    target_path = os.path.join(TARGET_DIR, f"{slug}.mdx")
    with open(target_path, 'w', encoding='utf-8') as f:
        f.write(mdx_content)
        
    print(f"[C5-REAL] Migrated: {slug} -> .mdx")
    migrated += 1

print(f"Total articles migrated: {migrated}")
