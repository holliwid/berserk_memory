import re
import urllib.request

url = "https://berserk.ru/?route=card/card&card_id=100554"
with urllib.request.urlopen(url) as response:
    html = response.read().decode("utf-8", errors="replace")

patterns = {
    "name": r"<h2>([^<]+)</h2>",
    "number": r"Номер:\s*(\d+)",
    "set": r"route=card/set&set_id=(\d+)",
    "full_img": r'<div class="image[^"]*">\s*<img[^>]+src="([^"]+)"',
    "thumb": r'class="card"[^>]*>\s*<img src="([^"]+)"',
}

for key, pattern in patterns.items():
    match = re.search(pattern, html, re.S)
    print(key, "=>", match.group(1)[:120] if match else "not found")
