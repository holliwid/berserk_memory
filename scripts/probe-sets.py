import re
import urllib.request

html = urllib.request.urlopen(
    "https://berserk.ru/?route=card/set/all"
).read().decode("utf-8", errors="replace")

pairs = re.findall(r"route=card/set&set_id=(\d+)[^>]*>([^<]+)", html)
print("pairs", len(pairs))
for p in pairs[:15]:
    print(p)

# alternative patterns
alt = re.findall(r"set_id=(\d+)", html)
print("all set ids", sorted(set(alt))[:20])
