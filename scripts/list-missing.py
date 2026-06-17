import json
from collections import Counter
from pathlib import Path

cards = json.loads(Path("public/data/cards.json").read_text(encoding="utf-8"))
missing = [c for c in cards if not c.get("imageUrl")]
print("Missing total:", len(missing))
print("By set:", dict(sorted(Counter(c["setId"] for c in missing).items())))
print("All missing:")
for c in missing:
    print(f"  {c['setId']}/{c['number']:>3}  {c['name']}")
