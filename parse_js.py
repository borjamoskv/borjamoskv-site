import json

with open('lighthouse.json') as f:
    data = json.load(f)

for audit_id in ['unminified-javascript', 'unused-javascript']:
    audit = data.get('audits', {}).get(audit_id, {})
    if audit.get('score') != 1:
        print(f"--- {audit_id} failures ---")
        items = audit.get('details', {}).get('items', [])
        for item in items:
            print(item.get('url', 'No URL'), "Wasted Bytes:", item.get('wastedBytes', 0))
