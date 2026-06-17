#!/usr/bin/env python3
"""Bootstrap data when Node.js is unavailable."""

import json
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "data"
DATA_URL = "https://raw.githubusercontent.com/SkAZi/berserk-nxt/main/resources/data.json"
CONST_URL = "https://raw.githubusercontent.com/SkAZi/berserk-nxt/main/resources/const.json"


def fetch_json(url: str):
    with urllib.request.urlopen(url) as response:
        return json.loads(response.read().decode("utf-8"))


def normalize_card(raw: dict, known_sets: set[str]) -> dict | None:
    if raw.get("ban"):
        return None

    set_id = raw["set_id"]
    if str(set_id) not in known_sets:
        return None

    alts = raw.get("alts") or []
    return {
        "id": str(raw["id"]),
        "setId": set_id,
        "number": raw["number"],
        "name": raw["name"],
        "cost": raw["cost"],
        "life": raw.get("life"),
        "move": raw.get("move"),
        "hit": raw.get("hit") or None,
        "text": raw.get("text") or None,
        "type": raw["type"],
        "color": raw["color"],
        "rarity": raw["rarity"],
        "elite": bool(raw.get("elite")),
        "hasAlt": len(alts) > 0,
        "nonStandardLayout": any(alt in {"pf", "altpf", "fpf", "altfpf"} for alt in alts),
    }


def main() -> None:
    raw_cards = fetch_json(DATA_URL)
    const_data = fetch_json(CONST_URL)
    known_sets = set(const_data["sets"].keys())

    OUT.mkdir(parents=True, exist_ok=True)
    image_map_path = OUT / "image-map.json"
    image_map = {}
    if image_map_path.exists():
        image_map = json.loads(image_map_path.read_text(encoding="utf-8"))

    cards = []
    for raw in raw_cards:
        card = normalize_card(raw, known_sets)
        if card is not None:
            key = f"{card['setId']}/{card['number']}"
            if key in image_map:
                card["imageUrl"] = image_map[key]
            cards.append(card)

    (OUT / "cards.json").write_text(
        json.dumps(cards, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    (OUT / "const.json").write_text(
        json.dumps(const_data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Saved {len(cards)} cards to {OUT / 'cards.json'}")


if __name__ == "__main__":
    main()
