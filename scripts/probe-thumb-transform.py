import re
import urllib.request

thumb = "https://berserk.ru/image/cache/berserk/data/00_Berserk/06_%D0%9F%D1%80%D0%B8%D0%B7%D1%80%D0%B0%D1%87%D0%BD%D1%8B%D0%B9%20%D0%BB%D0%B5%D0%B3%D0%B8%D0%BE%D0%BD/%D0%9F%D0%9B_%D0%BA%D0%B0%D1%80%D1%82%D0%B0-181%20copy-200x280.png"

def thumb_to_full(url: str) -> str:
    return re.sub(
        r"/image/cache/berserk/data/(.+)-\d+x\d+(\.\w+)$",
        r"/image/data/\1\2",
        url,
    )

full = thumb_to_full(thumb)
print("full", full)

req = urllib.request.Request(full, method="HEAD")
try:
    with urllib.request.urlopen(req) as response:
        print("status", response.status)
except Exception as error:
    print("error", error)
