import json

with open('lighthouse.json') as f:
    data = json.load(f)

for audit_id in ['color-contrast', 'target-size']:
    audit = data.get('audits', {}).get(audit_id, {})
    if audit.get('score') != 1:
        print(f"--- {audit_id} failures ---")
        items = audit.get('details', {}).get('items', [])
        for item in items:
            node = item.get('node', {})
            print(node.get('snippet', 'No snippet') + " | " + node.get('selector', 'No selector'))
