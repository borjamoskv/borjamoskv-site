import json

with open('lighthouse.json') as f:
    data = json.load(f)

print("=== FAILED AUDITS ===")
for audit_id, audit in data.get('audits', {}).items():
    score = audit.get('score')
    if score is not None and score < 1.0 and score >= 0.0:
        print(f"[{audit_id}] ({score}): {audit.get('title')}")
        if 'displayValue' in audit:
            print(f"  Value: {audit['displayValue']}")
        # if it's an opportunity, print savings
        if 'details' in audit and audit['details'].get('type') == 'opportunity':
            print(f"  Savings: {audit['details'].get('overallSavingsMs', 0)} ms")
