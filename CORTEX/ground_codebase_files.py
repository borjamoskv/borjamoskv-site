import os

def ground_code_files():
    workspace_dir = '/Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site'
    # List of files we want to ground
    files_to_ground = [
        "CORTEX/ASI-2_DarkLoop/node_core.py",
        "CORTEX/video-resumen/remotion.config.ts",
        "CORTEX/video-resumen/src/index.ts",
        "CORTEX/ASI-1_Sandbox/target_server.py",
        "CORTEX/engine/graph_decoupling_simulator.py",
        "CORTEX/engine/aristotle_yield_engine.py",
        "src/content.config.ts",
        "src/components/EspejoDelAlma.astro",
        "src/lib/utils.ts",
        "src/lib/ledger/cryptLedger.ts",
        "src/lib/substack/scraper.ts",
        "src/pages/api/llm-route.ts",
        "src/pages/api/exergy-cron.ts"
    ]
    
    # Add all src/pages/blog/*.astro files
    blog_dir = os.path.join(workspace_dir, "src", "pages", "blog")
    if os.path.exists(blog_dir):
        for f in os.listdir(blog_dir):
            if f.endswith('.astro'):
                files_to_ground.append(os.path.join("src", "pages", "blog", f))
                
    modified = 0
    for rel_path in files_to_ground:
        abs_path = os.path.join(workspace_dir, rel_path)
        if not os.path.exists(abs_path):
            continue
            
        with open(abs_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            
        if "C5-REAL" in content:
            continue
            
        # Grounding injection based on extension
        new_content = content
        if abs_path.endswith(('.ts', '.js')):
            new_content = "// C5-REAL\n" + content
        elif abs_path.endswith('.py'):
            new_content = "# C5-REAL\n" + content
        elif abs_path.endswith('.astro'):
            if content.startswith('---'):
                # Add to existing frontmatter
                parts = content.split('---', 2)
                if len(parts) >= 3:
                    new_content = "---" + parts[1] + "\n# C5-REAL\n---" + parts[2]
            else:
                new_content = "---\n# C5-REAL\n---\n" + content
                
        with open(abs_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"[+] Grounded code file: {rel_path}")
        modified += 1
        
    print(f"Total codebase files grounded: {modified}")

if __name__ == "__main__":
    ground_code_files()
