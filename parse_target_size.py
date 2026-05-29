import json

with open('lighthouse.json') as f:
    data = json.load(f)

audit = data.get('audits', {}).get('target-size', {})
if audit.get('score') != 1:
    items = audit.get('details', {}).get('items', [])
    for item in items:
        node = item.get('node', {})
        print(node.get('snippet', 'No snippet') + " | " + node.get('selector', 'No selector'))
