import json
import re
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CARDS_PATH = ROOT / "public" / "data" / "cards.json"
OUT_MAP_PATH = ROOT / "public" / "data" / "image-map.json"
FEED_URL = "https://berserk.ru/?route=lib/feed/cards"
CARD_URL = "https://berserk.ru/?route=card/card&card_id={card_id}"

OFFICIAL_TO_NXT_SET = {
    94123: 10,
    94128: 20,
    94131: 21,
    94132: 30,
    94135: 40,
    94137: 50,
    94142: 60,
    94145: 70,
}


def fetch_json_post(url: str, payload: dict) -> dict:
    body = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        url, data=body, headers={"Content-Type": "application/json"}, method="POST"
    )
    with urllib.request.urlopen(request) as response:
        return json.loads(response.read().decode("utf-8"))


def fetch_text(url: str) -> str:
    with urllib.request.urlopen(url) as response:
        return response.read().decode("utf-8", errors="replace")


def thumb_to_full(url: str) -> str:
    return re.sub(
        r"/image/cache/berserk/data/(.+)-\d+x\d+(\.\w+)$",
        r"/image/data/\1\2",
        url,
    )


def parse_card_page(card_id: str) -> tuple[int, int] | None:
    html = fetch_text(CARD_URL.format(card_id=card_id))
    set_match = re.search(r"route=card/set&set_id=(\d+)", html)
    number_match = re.search(r"Номер:\s*(\d+)", html)
    if not set_match or not number_match:
        return None

    official_set_id = int(set_match.group(1))
    nxt_set_id = OFFICIAL_TO_NXT_SET.get(official_set_id)
    if nxt_set_id is None:
        return None

    return nxt_set_id, int(number_match.group(1))


def fetch_all_feed_entries() -> list[tuple[str, str]]:
    state = {
        "features_type": 1,
        "sort": "name",
        "order": "ASC",
        "results_per_page": 100,
    }
    entries: list[tuple[str, str]] = []

    while True:
        payload = {"saveState": True, "state": state, "display": "grid"}
        data = fetch_json_post(FEED_URL, payload)
        pairs = re.findall(
            r'card_id=(\d+)[^>]*>\s*<img src="([^"]+)"',
            data["rendered"],
            flags=re.S,
        )
        entries.extend(pairs)
        results = data["state"]["results"]
        print(f"Feed page {results['page']}/{results['total_pages']}")

        if results["page"] >= results["total_pages"]:
            break

        state = data["state"]
        state["page"] = results["page"] + 1
        time.sleep(0.05)

    return entries


def main() -> None:
    entries = fetch_all_feed_entries()
    print(f"Collected {len(entries)} feed entries")

    card_page_cache: dict[str, tuple[int, int] | None] = {}
    image_map: dict[str, str] = {}
    failures = 0

    for index, (card_id, thumb) in enumerate(entries, start=1):
        full_url = thumb_to_full(thumb)

        if card_id not in card_page_cache:
            try:
                card_page_cache[card_id] = parse_card_page(card_id)
            except Exception:
                card_page_cache[card_id] = None
            time.sleep(0.04)

        parsed = card_page_cache[card_id]
        if parsed is None:
            failures += 1
            continue

        set_id, number = parsed
        image_map[f"{set_id}/{number}"] = full_url

        if index % 100 == 0:
            print(f"Processed {index}/{len(entries)}")

    print(
        f"Mapped {len(image_map)} unique cards "
        f"(pages cached {len(card_page_cache)}, failures {failures})"
    )

    OUT_MAP_PATH.write_text(
        json.dumps(image_map, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    cards = json.loads(CARDS_PATH.read_text(encoding="utf-8"))
    matched = 0
    for card in cards:
        key = f"{card['setId']}/{card['number']}"
        if key in image_map:
            card["imageUrl"] = image_map[key]
            matched += 1
        elif "imageUrl" in card:
            del card["imageUrl"]

    CARDS_PATH.write_text(
        json.dumps(cards, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Updated cards.json: {matched}/{len(cards)} cards have imageUrl")


if __name__ == "__main__":
    main()
