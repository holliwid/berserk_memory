/**
 * Соответствие setId из cards.json → номер выпуска перезапуска Берсерк.
 * 21 — «Легенды Лаара», промо без номера в основной линейке.
 */
export const SET_RELEASE_NUMBERS: Record<number, number | null> = {
  10: 1,
  20: 2,
  21: null,
  30: 3,
  40: 4,
  50: 5,
  60: 6,
  70: 7,
}

/** Выпуски, скрытые в тренажёре (нет изображений на berserk.ru). */
export const EXCLUDED_SET_IDS = new Set([22])

export function getSetSortOrder(setId: number): number {
  return SET_RELEASE_NUMBERS[setId] ?? 99
}

export function formatSetLabel(setId: number, name: string): string {
  const release = SET_RELEASE_NUMBERS[setId]
  if (release == null) return name
  return `${release} · ${name}`
}

export function isSetAvailable(setId: number): boolean {
  return !EXCLUDED_SET_IDS.has(setId)
}
