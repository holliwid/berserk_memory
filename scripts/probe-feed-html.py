import json
import re
import urllib.request

url = "https://berserk.ru/?route=lib/feed/cards"
body = json.dumps(
    {
        "saveState": True,
        "state": {
            "features_type": 1,
            "sort": "name",
            "order": "ASC",
            "results_per_page": 3,
        },
        "display": "grid",
    }
).encode()

req = urllib.request.Request(
    url, data=body, headers={"Content-Type": "application/json"}, method="POST"
)
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read().decode())

print(data["rendered"][:2500])
