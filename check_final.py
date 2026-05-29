import json

with open('lighthouse.json') as f:
    data = json.load(f)

scores = {}
for category, details in data.get('categories', {}).items():
    scores[category] = details.get('score', 0) * 100

print(f"--- OVERALL SCORES ---")
for cat, score in scores.items():
    print(f"{cat}: {score}")

audits_to_check = [
    'color-contrast', 
    'target-size', 
    'bf-cache', 
    'image-delivery-insight',
    'robots.txt',
    'llms.txt',
    'is-on-https'
]

print("\n--- REMAINING ISSUES ---")
for audit in audits_to_check:
    a = data.get('audits', {}).get(audit, {})
    if a.get('score') != 1 and a.get('score') is not None:
        print(f"FAIL: {audit} - {a.get('title')} ({a.get('displayValue', '')})")
    elif a.get('score') == 1:
        print(f"PASS: {audit}")
