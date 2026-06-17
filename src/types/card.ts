export type CardType = 0 | 1 | 2 | 3 | 4 | 5

export type Card = {
  id: string
  setId: number
  number: number
  name: string
  cost: number
  life?: number
  move?: number | null
  hit?: number[]
  text?: string
  type: CardType
  color: number
  rarity: number
  elite: boolean
  hasAlt: boolean
  nonStandardLayout: boolean
  imageUrl?: string
}

export type CardConst = {
  sets: Record<string, string>
  rarities: Record<string, string>
  colors: Record<string, string>
  creature_types: Record<string, string>
}

export type Filters = {
  sets: number[]
  colors: number[]
  rarities: number[]
  standardArtOnly: boolean
}

