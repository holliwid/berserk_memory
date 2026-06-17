import json
import re
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CARDS_PATH = ROOT / "public/data/cards.json"
MAP_PATH = ROOT / "public/data/image-map.json"

SET_FOLDER = {
    10: "00_Berserk/01_Война стихий",
    20: "00_Berserk/02_Нашествие тьмы",
    30: "00_Berserk/03_Семена раздора",
    40: "00_Berserk/04_Ложные боги",
    50: "00_Berserk/05_Дуэль хаоса",
    60: "00_Berserk/06_Призрачный легион",
    70: "00_Berserk/07_Гибель богов",
}

EXTRA_TEMPLATES = {
    10: [
        "Card ({n}).jpg",
        "Berserk_VS_card-{n} копия.png",
        "Berserk_VS_all_card {n}-page-00001.jpg",
    ],
    30: [
        "Berserk_SR_all_card_66-{n} копия.png",
        "Berserk_SR_all_card_29_pages-to-jpg-{n:04d} копия.png",
    ],
    40: [
        "Berserk_LB_card_76-{n} копия.png",
        "Berserk_LB_all_card_29_pages-to-jpg-{n:04d} копия.png",
    ],
    50: [
        "Berserk_DK_cards_66-{n} копия.png",
    ],
    60: [
        "ПЛ_карта-{n} copy.png",
        "ПЛ_карта-{n}.png",
        "Berserk_PG_all_card_66-{n} копия.png",
    ],
    70: [
        "Berserk_GB_cards_{n}.png",
        "Berserk_WS_all_card_66-{n} копия.png",
    ],
}


def encode_url(url: str) -> str:
    prefix, _, filename = url.rpartition("/")
    if not prefix:
        return url

    marker = "/image/data/"
    if marker not in prefix:
        return url

    base, path_tail = prefix.split(marker, 1)
    encoded_path = "/".join(
        urllib.parse.quote(part, safe="") for part in path_tail.split("/")
    )
    encoded_file = urllib.parse.quote(filename, safe="()")
    return f"{base}{marker}{encoded_path}/{encoded_file}"


def url_exists(url: str) -> bool:
    encoded = encode_url(url)
    request = urllib.request.Request(
        encoded,
        method="GET",
        headers={"Range": "bytes=0-0"},
    )
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            return response.status in (200, 206)
    except Exception:
        return False


def neighbor_candidates(cards: list[dict], card: dict) -> list[str]:
    same_set = [c for c in cards if c["setId"] == card["setId"] and c.get("imageUrl")]
    if not same_set:
        return []

    anchor = min(same_set, key=lambda c: abs(c["number"] - card["number"]))
    url = anchor["imageUrl"]
    dirname, filename = url.rsplit("/", 1)
    candidates = []

    for match in re.finditer(r"\d+", filename):
        start, end = match.span()
        old = match.group(0)
        new = (
            str(card["number"]).zfill(len(old))
            if len(old) > len(str(card["number"]))
            else str(card["number"])
        )
        candidates.append(f"{dirname}/{filename[:start] + new + filename[end:]}")

    return candidates


def template_candidates(card: dict) -> list[str]:
    folder = SET_FOLDER.get(card["setId"])
    if folder is None:
        return []

    templates = EXTRA_TEMPLATES.get(card["setId"], [])
    urls = []
    for template in templates:
        filename = template.format(n=card["number"])
        urls.append(f"https://berserk.ru/image/data/{folder}/{filename}")
    return urls


def main() -> None:
    cards = json.loads(CARDS_PATH.read_text(encoding="utf-8"))
    image_map = json.loads(MAP_PATH.read_text(encoding="utf-8")) if MAP_PATH.exists() else {}

    filled = 0
    for card in cards:
        if card.get("imageUrl") or card["setId"] == 22:
            continue

        candidates = []
        seen = set()
        for url in neighbor_candidates(cards, card) + template_candidates(card):
            if url not in seen:
                seen.add(url)
                candidates.append(url)

        for url in candidates:
            if not url_exists(url):
                continue
            key = f"{card['setId']}/{card['number']}"
            card["imageUrl"] = url
            image_map[key] = url
            filled += 1
            print(f"Filled {key} {card['name']}")
            break

    CARDS_PATH.write_text(json.dumps(cards, ensure_ascii=False, indent=2), encoding="utf-8")
    MAP_PATH.write_text(json.dumps(image_map, ensure_ascii=False, indent=2), encoding="utf-8")

    with_images = sum(1 for c in cards if c.get("imageUrl"))
    print(f"Added {filled} URLs")
    print(f"Total with imageUrl: {with_images}/{len(cards)}")


if __name__ == "__main__":
    main()
