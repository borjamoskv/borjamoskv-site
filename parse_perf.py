import json

with open('lighthouse.json') as f:
    data = json.load(f)

for audit_id, audit in data.get('audits', {}).items():
    if audit.get('score') is not None and audit.get('score') < 1.0:
        if audit.get('scoreDisplayMode') in ['numeric', 'binary']:
            print(f"FAIL: {audit_id} - Score: {audit.get('score')} | {audit.get('title')} ({audit.get('displayValue', '')})")

