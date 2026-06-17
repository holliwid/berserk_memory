import type { CardType } from '../types/card'

const cropByType: Record<CardType, number> = {
  0: 47,
  1: 47,
  2: 47,
  3: 47,
  4: 50,
  5: 48,
}

export function getCropBottom(type: CardType): number {
  return cropByType[type] ?? 44
}
