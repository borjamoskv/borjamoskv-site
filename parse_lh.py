import json

with open('lighthouse.json') as f:
    data = json.load(f)

cats = data.get('categories', {})
for k, v in cats.items():
    print(f"{v['title']}: {v['score'] * 100 if v['score'] else 0}")
