import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const DATA_URL =
  'https://raw.githubusercontent.com/SkAZi/berserk-nxt/main/resources/data.json'
const CONST_URL =
  'https://raw.githubusercontent.com/SkAZi/berserk-nxt/main/resources/const.json'

const OUT_DIR = join(process.cwd(), 'public', 'data')
const IMAGE_MAP_PATH = join(OUT_DIR, 'image-map.json')

function normalizeCard(raw) {
  const alts = raw.alts ?? []
  const hasNonStandardAlt = alts.some((alt) =>
    ['pf', 'altpf', 'fpf', 'altfpf'].includes(alt),
  )

  return {
    id: String(raw.id),
    setId: raw.set_id,
    number: raw.number,
    name: raw.name,
    cost: raw.cost,
    life: raw.life ?? undefined,
    move: raw.move ?? undefined,
    hit: raw.hit?.length ? raw.hit : undefined,
    text: raw.text || undefined,
    type: raw.type,
    color: raw.color,
    rarity: raw.rarity,
    elite: Boolean(raw.elite),
    hasAlt: alts.length > 0,
    nonStandardLayout: hasNonStandardAlt,
  }
}

async function loadImageMap() {
  try {
    const raw = await readFile(IMAGE_MAP_PATH, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

async function main() {
  const [dataRes, constRes, imageMap] = await Promise.all([
    fetch(DATA_URL),
    fetch(CONST_URL),
    loadImageMap(),
  ])

  if (!dataRes.ok || !constRes.ok) {
    throw new Error('Failed to download card data')
  }

  const rawCards = await dataRes.json()
  const constData = await constRes.json()

  const cards = rawCards
    .filter((card) => !card.ban)
    .map(normalizeCard)
    .filter((card) => constData.sets[String(card.setId)])
    .map((card) => {
      const imageUrl = imageMap[`${card.setId}/${card.number}`]
      return imageUrl ? { ...card, imageUrl } : card
    })

  await mkdir(OUT_DIR, { recursive: true })
  await writeFile(
    join(OUT_DIR, 'cards.json'),
    JSON.stringify(cards, null, 2),
    'utf-8',
  )
  await writeFile(
    join(OUT_DIR, 'const.json'),
    JSON.stringify(constData, null, 2),
    'utf-8',
  )

  console.log(`Saved ${cards.length} cards to public/data/cards.json`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
