import json
import re
import time
import urllib.request
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FEED_URL = "https://berserk.ru/?route=lib/feed/cards"

FOLDER_TO_SET = {
    "01": 10,
    "02": 20,
    "03": 30,
    "04": 40,
    "05": 50,
    "06": 60,
    "07": 70,
}


def fetch_json_post(url: str, payload: dict) -> dict:
    body = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        url, data=body, headers={"Content-Type": "application/json"}, method="POST"
    )
    with urllib.request.urlopen(request) as response:
        return json.loads(response.read().decode("utf-8"))


def extract_number(filename: str) -> int | None:
    patterns = [
        r"карта-(\d+)",
        r"cards?_(\d+)",
        r"pages-to-jpg-0*(\d+)",
        r"page-0*(\d+)",
        r"card_\d+-(\d+)",
        r"card_(\d+)-\d+",
        r"[_-](\d+)\s",
        r"[_-](\d+)\.",
        r"[_-](\d+)$",
    ]
    for pattern in patterns:
        match = re.search(pattern, filename, flags=re.I)
        if match:
            return int(match.group(1))
    return None


def parse_thumb(url: str) -> tuple[int, int] | None:
    folder_match = re.search(r"/00_Berserk/(\d+)_", url)
    if not folder_match:
        return None
    set_id = FOLDER_TO_SET.get(folder_match.group(1))
    if set_id is None:
        return None
    number = extract_number(url.split("/")[-1])
    if number is None:
        return None
    return set_id, number


def main() -> None:
    state = {
        "features_type": 1,
        "sort": "name",
        "order": "ASC",
        "results_per_page": 100,
    }
    thumbs: list[str] = []

    while True:
        data = fetch_json_post(
            FEED_URL, {"saveState": True, "state": state, "display": "grid"}
        )
        thumbs.extend(re.findall(r'<img src="([^"]+)"', data["rendered"]))
        results = data["state"]["results"]
        if results["page"] >= results["total_pages"]:
            break
        state = data["state"]
        state["page"] = results["page"] + 1
        time.sleep(0.1)

    folders = Counter()
    unparsed_samples: list[str] = []

    for thumb in thumbs:
        parsed = parse_thumb(thumb)
        folder_match = re.search(r"/00_Berserk/([^/]+)/", thumb)
        if folder_match:
            folders[folder_match.group(1)] += 1
        if parsed is None:
            unparsed_samples.append(thumb.split("/")[-1])

    print("Folders:")
    for folder, count in sorted(folders.items()):
        print(f"  {count:4d}  {folder}")

    parsed_count = sum(1 for thumb in thumbs if parse_thumb(thumb))
    print(f"\nParsed fast: {parsed_count}/{len(thumbs)}")
    print("\nUnparsed filename samples:")
    for sample in unparsed_samples[:30]:
        print(f"  {sample}")


if __name__ == "__main__":
    main()
