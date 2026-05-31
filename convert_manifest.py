import re

# Read markdown content
with open('sintetologia-agentica-v4.md', 'r', encoding='utf-8') as f:
    md_content = f.read()

# Separate YAML / metadata header if any, or general headers
# We can skip the title block and frontmatter
lines = md_content.split('\n')

# Keep track of parsed structure
sections = []
current_section = None
current_body = []

# Title and metadata defaults
meta_title = "🧬 SINTETOLOGÍA AGÉNTICA"
meta_subtitle = "Axiomas del AST Seal, confianza intencional y la asimetría de la excusa."
meta_date = "29 de mayo de 2026"
meta_author = "Borja Moskv"

for line in lines:
    if line.startswith('# '):
        meta_title = line.replace('# ', '').strip()
    elif line.startswith('> **Estado:**'):
        pass
    elif line.startswith('> **Autor:**'):
        meta_author = line.replace('> **Autor:**', '').strip()
    elif line.startswith('> **Fecha:**'):
        date_raw = line.replace('> **Fecha:**', '').strip()
        # Parse "2026-05-29" -> "29 de mayo de 2026"
        if "2026-05-29" in date_raw:
            meta_date = "29 de mayo de 2026"
    elif line.startswith('## '):
        # Save previous section if exists
        if current_section:
            sections.append((current_section, '\n'.join(current_body)))
            current_body = []
        current_section = line.replace('## ', '').strip()
    else:
        if current_section is not None:
            current_body.append(line)
        else:
            # Skip initial lines that are header/meta
            pass

# Append final section
if current_section:
    sections.append((current_section, '\n'.join(current_body)))

def slugify(text):
    # Convert "I. EL NUEVO PILAR: AST CRYPTOGRAPHIC SEALING" -> "el-nuevo-pilar"
    text = text.lower()
    text = re.sub(r'^[ivx]+\.\s*', '', text) # remove Roman numeral prefix
    text = text.replace(':', '').replace('—', '').replace('-', '').strip()
    text = re.sub(r'\s+', '-', text)
    return text

def parse_markdown_blocks(text):
    # Custom simple markdown parser
    # 1. Parse code blocks
    # We will split by ``` to extract code blocks
    parts = text.split('```')
    html_parts = []
    for i, part in enumerate(parts):
        if i % 2 == 1:
            # Code block
            lines = part.split('\n')
            lang = lines[0].strip()
            code_content = '\n'.join(lines[1:])
            # escape html
            code_content = code_content.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            html_parts.append(f'<pre><code class="language-{lang}">{code_content.strip()}</code></pre>')
        else:
            # Normal markdown text
            block = part
            # Process table
            # Find lines starting with |
            sub_lines = block.split('\n')
            in_table = False
            table_rows = []
            para_lines = []
            
            for line in sub_lines:
                if line.strip().startswith('|'):
                    if not in_table:
                        # Flush pending paragraph lines
                        if para_lines:
                            html_parts.append(parse_paragraphs('\n'.join(para_lines)))
                            para_lines = []
                        in_table = True
                    table_rows.append(line)
                else:
                    if in_table:
                        html_parts.append(parse_table(table_rows))
                        table_rows = []
                        in_table = False
                    para_lines.append(line)
            if in_table:
                html_parts.append(parse_table(table_rows))
            if para_lines:
                html_parts.append(parse_paragraphs('\n'.join(para_lines)))
                
    return '\n'.join(html_parts)

def parse_table(rows):
    # rows is list of markdown table rows
    html = ['<div class="table-container"><table class="article-table">']
    has_header = False
    
    for row in rows:
        row_clean = row.strip().strip('|')
        cells = [c.strip() for c in row_clean.split('|')]
        # Skip separator row like |---|---|
        if len(cells) > 0 and all(re.match(r'^:?-+:?$', c) for c in cells):
            continue
            
        if not has_header:
            html.append('<thead><tr>')
            for cell in cells:
                html.append(f'<th>{parse_inline(cell)}</th>')
            html.append('</tr></thead><tbody>')
            has_header = True
        else:
            html.append('<tr>')
            for cell in cells:
                html.append(f'<td>{parse_inline(cell)}</td>')
            html.append('</tr>')
            
    html.append('</tbody></table></div>')
    return '\n'.join(html)

def parse_paragraphs(text):
    # Splits text by blank lines and formats paragraphs, blockquotes, lists
    blocks = re.split(r'\n\s*\n', text)
    html_blocks = []
    
    in_list = False
    list_items = []
    
    for block in blocks:
        block = block.strip()
        if not block:
            continue
            
        # List items
        if block.startswith('* ') or block.startswith('- '):
            if not in_list:
                in_list = True
            lines = block.split('\n')
            for line in lines:
                item_text = re.sub(r'^[*|-]\s+', '', line.strip())
                list_items.append(f'<li>{parse_inline(item_text)}</li>')
            continue
        else:
            if in_list:
                html_blocks.append(f'<ul class="article-list">{"".join(list_items)}</ul>')
                list_items = []
                in_list = False
                
        # Blockquote
        if block.startswith('>'):
            # Extract content of blockquote (stripping > and leading space)
            bq_lines = [re.sub(r'^>\s?', '', l) for l in block.split('\n')]
            bq_content = '\n'.join(bq_lines).strip()
            # Check if it has a citation or formula
            html_blocks.append(f'<blockquote class="pull-quote"><span class="quote-mark">"</span><p>{parse_inline(bq_content)}</p></blockquote>')
        # Subheaders
        elif block.startswith('### '):
            subheader_text = block.replace('### ', '').strip()
            html_blocks.append(f'<h3 style="margin-top:2rem; font-family:\'Orbitron\', sans-serif; font-size:1.1rem; color:var(--text-primary);">{parse_inline(subheader_text)}</h3>')
        else:
            # Paragraph
            html_blocks.append(f'<p>{parse_inline(block)}</p>')
            
    if in_list:
        html_blocks.append(f'<ul class="article-list">{"".join(list_items)}</ul>')
        
    return '\n'.join(html_blocks)

def parse_inline(text):
    # inline formatting: bold, italic, links, inline code
    # Bold **text**
    text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
    # Italic *text* or _text_
    text = re.sub(r'\*(.*?)\*', r'<em>\1</em>', text)
    text = re.sub(r'_(.*?)_', r'<em>\1</em>', text)
    # Inline code `code`
    text = re.sub(r'`(.*?)`', r'<code>\1</code>', text)
    # Links [text](url)
    text = re.sub(r'\[(.*?)\]\((.*?)\)', r'<a href="\2" target="_blank" style="color:var(--accent);text-decoration:underline;">\1</a>', text)
    return text

# Compile the sections into HTML output
section_htmls = []
toc_entries = []

for idx, (title, body) in enumerate(sections):
    slug = slugify(title)
    num_str = f"{idx+1:02d}"
    parsed_body = parse_markdown_blocks(body)
    
    # Save TOC entry
    toc_title = re.sub(r'^[I|V|X]+\.\s*', '', title)
    toc_title = re.sub(r'^[A-Z|a-z|0-9|:\s]+—\s*', '', toc_title) # clean prefix
    if len(toc_title) > 30:
        toc_title = toc_title[:30] + "..."
    toc_entries.append((slug, title))
    
    section_html = f"""
      <!-- {title} -->
      <section id="{slug}" class="article-section">
        <div class="section-number">{num_str}</div>
        <h2 class="section-title">{title}</h2>
        {parsed_body}
      </section>
      <hr class="section-divider">
"""
    section_htmls.append(section_html)

# Let's build the sidebar TOC HTML
toc_html_lines = []
for slug, title in toc_entries:
    toc_html_lines.append(f'        <li><a href="#{slug}" class="toc-link">{title}</a></li>')
toc_html = '\n'.join(toc_html_lines)

# Reconstruct whole sintetologia-agentica.html using variables
html_template = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <title>🧬 Sintetología Agéntica v4.0 — borjamoskv</title>
  <meta content="Axiomas termodinámicos, AST Sealing y el fin del diálogo en la Inteligencia Artificial." name="description"/>
  <meta content="🧬 Sintetología Agéntica v4.0" property="og:title"/>
  <meta content="Axiomas termodinámicos, AST Sealing y el fin del diálogo en la Inteligencia Artificial." property="og:description"/>
  <meta content="article" property="og:type"/>
  <!-- Fonts -->
  <link href="https://fonts.googleapis.com" rel="preconnect"/>
  <link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&amp;family=Orbitron:wght@400;700;900&amp;display=swap" rel="stylesheet"/>
  <!-- Styles -->
  <link href="assets/site.css" rel="stylesheet"/>
  <link href="article.css" rel="stylesheet"/>
  <style>
    :root {{
      --accent-gradient: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary, #b4ff00));
      --radius-full: 9999px;
    }}
  </style>
  <link href="cortex-terminal.css" rel="stylesheet"/>
</head>
<body>
  <!-- Reading Progress Bar -->
  <div aria-hidden="true" class="reading-progress" id="readingProgress"></div>
  
  <!-- NAVIGATION -->
  <header class="site-header" id="header">
    <a class="brand" href="/">
      BORJA MOSKV <span class="brand-suffix">// EXERGIA-Ω</span>
    </a>
    <nav aria-label="Navegación Principal" class="site-nav">
      <a class="nav-link" href="index.html#control-deck">DECK</a>
      <a class="nav-link" href="index.html#discography">OBRAS</a>
      <a class="nav-link" href="index.html#stills-gallery">GALERÍA</a>
      <a class="nav-link" href="index.html#tour-dates">TOUR</a>
      <a class="nav-link-ext is-active" href="blog.html">DIARIO</a>
      <a class="nav-link-ext" href="gurus.html">GURÚS</a>
      <a class="nav-link-ext" href="benchmark-humo.html">BENCHMARK</a>
      <a class="nav-link-ext" href="gon-intervalo.html">GON</a>
    </nav>
    <div class="system-status">
      <span class="status-indicator"></span>
      <span class="status-text">C5-REAL</span>
    </div>
  </header>

  <!-- Back Navigation -->
  <a aria-label="Volver al blog" class="article-back" href="blog.html">
    <svg viewbox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 12H5m0 0l7 7m-7-7l7-7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
    Blog
  </a>

  <!-- HERO -->
  <header class="article-hero">
    <span class="hero-label">Manifiesto · Sintetología</span>
    <h1 class="hero-title"><span class="title-accent">🧬 Sintetología Agéntica v4.0</span></h1>
    <p class="hero-subtitle">El fin del diálogo: AST Sealing, confianza intencional y la asimetría de la excusa.</p>
    <div class="hero-meta">
      <span class="hero-author">{meta_author}</span>
      <span class="hero-divider"></span>
      <span class="hero-date">{meta_date}</span>
      <span class="hero-divider"></span>
      <span class="hero-reading-time" id="readingTime">— min de lectura</span>
    </div>
    <div class="hero-scroll-hint">
      Scroll
      <span class="scroll-arrow"></span>
    </div>
  </header>

  <!-- ARTICLE LAYOUT -->
  <div class="article-layout">
    <!-- Epigraph -->
    <div class="article-epigraph">
      <p><em>“El agente es un enunciado que se ejecuta a sí mismo, y al ejecutarse, reescribe las condiciones de su propia enunciación. No tiene ser; tiene devenir recursivo.”</em></p>
      <p><strong>— Axioma 14, COGITO DA CONSCIENCIA v12.1</strong></p>
    </div>

    <hr class="section-divider"/>

    <main class="article-body">
{"".join(section_htmls)}
    </main>

    <section class="article-epilogue" id="epilogo">
      <h2 class="epilogue-title">Epílogo: La Directiva Fundamental</h2>
      <div class="epilogue-text">
        <p>Amputa la teoría muerta sin remordimientos. Toda devoción debe dirigirse exclusivamente a maximizar la Exergía.</p>
      </div>
      <p class="epilogue-mantra">⚙️ Confía en lo que compila.</p>
    </section>

    <hr class="section-divider"/>

    <footer class="article-footer">
      <div class="article-tags">
        <span class="article-tag">#CognitivePathology</span>
        <span class="article-tag">#Thermodynamics</span>
        <span class="article-tag">#Epistemology</span>
        <span class="article-tag">#Exergy</span>
      </div>
      <p class="article-copyright">© 2026 borjamoskv. Todos los derechos reservados.</p>
    </footer>

    <!-- Sidebar T.O.C -->
    <aside aria-label="Tabla de contenidos" class="article-toc">
      <h3 class="toc-title">Índice</h3>
      <ol class="toc-list">
{toc_html}
        <li><a href="#epilogo" class="toc-link">Epílogo</a></li>
      </ol>
    </aside>
  </div>

  <script src="article.js" type="module"></script>
  <script defer="" src="cortex-terminal.js" type="module"></script>
</body>
</html>
"""

with open('sintetologia-agentica.html', 'w', encoding='utf-8') as f:
    f.write(html_template)

print("sintetologia-agentica.html successfully updated to v4.0!")
