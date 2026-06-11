import os
import re

def ground_articles():
    articles_dir = '/Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site/src/content/articles'
    files = [f for f in os.listdir(articles_dir) if f.endswith(('.md', '.mdx'))]
    modified_count = 0
    
    for filename in files:
        filepath = os.path.join(articles_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Check if C5-REAL is already in the file
        if 'C5-REAL' in content:
            continue
            
        # We find the frontmatter (between first and second '---')
        parts = content.split('---', 2)
        if len(parts) >= 3:
            frontmatter = parts[1]
            body = parts[2]
            
            # Check if tags exists in frontmatter
            if 'tags:' in frontmatter:
                # Add C5-REAL to tags
                # Find 'tags:' and inject the new tag on the next line
                new_frontmatter = re.sub(
                    r'(tags:\s*\n)',
                    r'\1  - \'C5-REAL\'\n',
                    frontmatter
                )
                # If tags is a list on a single line like tags: ['Sistemas']
                if new_frontmatter == frontmatter:
                    new_frontmatter = re.sub(
                        r'tags:\s*\[(.*?)\]',
                        r"tags: ['C5-REAL', \1]",
                        frontmatter
                    )
            else:
                # Add tags block to frontmatter
                new_frontmatter = frontmatter + "tags:\n  - 'C5-REAL'\n"
                
            new_content = '---' + new_frontmatter + '---' + body
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"[+] Grounded article: {filename}")
            modified_count += 1
            
    print(f"Total articles modified: {modified_count}")

if __name__ == "__main__":
    ground_articles()
