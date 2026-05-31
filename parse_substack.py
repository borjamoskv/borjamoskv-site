import json, re

with open('/Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site/sintetologia-googlebot.html') as f:
    html = f.read()

# Substack stringifies the JSON and puts it inside JSON.parse("...") with escaped quotes
# Let's find window._preloads
match = re.search(r'window\._preloads\s*=\s*JSON\.parse\("(.*?)"\)', html)
if not match:
    # Try finding it in another format
    match = re.search(r'window\._preloads\s*=\s*(.*?);\s*\n', html)

if match:
    raw_content = match.group(1)
    # The JSON string inside JSON.parse is escaped.
    # We can use json.loads to unescape the JSON string, then load it again.
    try:
        # Wrap it in double quotes if it isn't, to make it a valid JSON string
        if not raw_content.startswith('"'):
            raw_content = '"' + raw_content + '"'
        unescaped = json.loads(raw_content)
        data = json.loads(unescaped)
        
        # Check keys
        print("Keys in data:", list(data.keys()))
        post = data.get('post', {})
        print("Post keys:", list(post.keys()))
        print("Post Title:", post.get('title'))
        print("Post Subtitle:", post.get('subtitle'))
        
        # Output the body_html if it exists
        body_html = post.get('body_html')
        if body_html:
            print("body_html found! Length:", len(body_html))
            with open('/Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site/sintetologia_body.html', 'w') as out:
                out.write(body_html)
            print("body_html saved to sintetologia_body.html")
        else:
            print("No 'body_html' in 'post'")
        
        truncated_body_text = post.get('truncated_body_text')
        if truncated_body_text:
            print("truncated_body_text length:", len(truncated_body_text))
    except Exception as e:
        print("Failed to parse JSON:", str(e))
        # Print a snippet of the raw match to debug
        print("Match snippet:", raw_content[:500])
else:
    print("window._preloads not found in HTML")
