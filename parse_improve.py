import json

with open('lighthouse.json') as f:
    data = json.load(f)

print("--- TARGET SIZE ---")
ts = data.get('audits', {}).get('target-size', {})
for i in ts.get('details', {}).get('items', []):
    print(i.get('node', {}).get('snippet'), i.get('node', {}).get('selector'))

print("\n--- LLMS.TXT ---")
llms = data.get('audits', {}).get('llms-txt', {})
print(llms.get('explanation') or llms.get('details'))

print("\n--- PERFORMANCE (IMAGE) ---")
img = data.get('audits', {}).get('image-delivery-insight', {})
for i in img.get('details', {}).get('items', []):
    print(i.get('url'), i.get('wastedBytes'))
