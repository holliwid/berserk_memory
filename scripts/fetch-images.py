#!/usr/bin/env python3
"""Download card images from berserk-nxt repository."""

import json
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CARDS_PATH = ROOT / "public" / "data" / "cards.json"
OUT_DIR = ROOT / "public" / "cards"
BASE_URL = (
    "https://raw.githubusercontent.com/SkAZi/berserk-nxt/main/resources/cards"
)


def download_card(set_id: int, number: int) -> bool:
    dest = OUT_DIR / str(set_id) / f"{number}.webp"
    if dest.exists():
        return True

    url = f"{BASE_URL}/{set_id}/{number}.webp"
    try:
        with urllib.request.urlopen(url) as response:
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(response.read())
        return True
    except urllib.error.HTTPError:
        return False


def main() -> None:
    cards = json.loads(CARDS_PATH.read_text(encoding="utf-8"))
    targets = [
        (card["setId"], card["number"])
        for card in cards
        if not card.get("nonStandardLayout")
    ]

    downloaded = 0
    missing = 0

    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {
            executor.submit(download_card, set_id, number): (set_id, number)
            for set_id, number in targets
        }
        for future in as_completed(futures):
            if future.result():
                downloaded += 1
            else:
                missing += 1

    print(
        f"Images: {downloaded} downloaded, {missing} missing ({len(targets)} requested)"
    )


if __name__ == "__main__":
    main()
