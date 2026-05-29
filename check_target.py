import json
with open('lighthouse.json') as f:
    d = json.load(f)
for i in d.get('audits', {}).get('target-size', {}).get('details', {}).get('items', []):
    print(i)
