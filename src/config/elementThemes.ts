export type ElementId = 1 | 2 | 4 | 8 | 16 | 32

export type ElementTheme = {
  id: ElementId
  name: string
  common: string
  rare: string
  accent: string
  commonDeep: string
  commonSurface: string
  fieldEnd: string
  ink: string
  inkDark: string
  inkMuted: string
}

export const ELEMENT_THEMES: ElementTheme[] = [
  {
    id: 1,
    name: 'Степи',
    common: '#5c4a28',
    rare: '#e8dcc0',
    accent: '#c9a227',
    commonDeep: '#2a2418',
    commonSurface: '#3d3420',
    fieldEnd: '#4a3e24',
    ink: '#f5eede',
    inkDark: '#2a2418',
    inkMuted: 'rgba(232, 220, 192, 0.72)',
  },
  {
    id: 2,
    name: 'Горы',
    common: '#4a5058',
    rare: '#d4d8de',
    accent: '#9aa3ad',
    commonDeep: '#1e2228',
    commonSurface: '#323840',
    fieldEnd: '#3a4048',
    ink: '#eef0f3',
    inkDark: '#1e2228',
    inkMuted: 'rgba(204, 210, 218, 0.72)',
  },
  {
    id: 4,
    name: 'Леса',
    common: '#3a5238',
    rare: '#d8e4d0',
    accent: '#8fad5c',
    commonDeep: '#1a2418',
    commonSurface: '#2e402c',
    fieldEnd: '#345032',
    ink: '#edf3e8',
    inkDark: '#1a2418',
    inkMuted: 'rgba(210, 222, 200, 0.72)',
  },
  {
    id: 8,
    name: 'Болота',
    common: '#3d4a38',
    rare: '#d2dbc8',
    accent: '#7a8f55',
    commonDeep: '#1c2218',
    commonSurface: '#2f3828',
    fieldEnd: '#364030',
    ink: '#e8ede0',
    inkDark: '#1c2218',
    inkMuted: 'rgba(206, 214, 196, 0.72)',
  },
  {
    id: 16,
    name: 'Тьма',
    common: '#4a3b52',
    rare: '#d1cbd6',
    accent: '#b89b5e',
    commonDeep: '#2d262f',
    commonSurface: '#3a3044',
    fieldEnd: '#352b3e',
    ink: '#ece6ef',
    inkDark: '#2d262f',
    inkMuted: 'rgba(214, 203, 214, 0.72)',
  },
  {
    id: 32,
    name: 'Нейтралы',
    common: '#4a4540',
    rare: '#ddd8d0',
    accent: '#a89880',
    commonDeep: '#242220',
    commonSurface: '#35302c',
    fieldEnd: '#3c3832',
    ink: '#f0ece6',
    inkDark: '#242220',
    inkMuted: 'rgba(216, 210, 200, 0.72)',
  },
]

export const DEFAULT_ELEMENT_ID: ElementId = 16

const themeById = new Map(ELEMENT_THEMES.map((theme) => [theme.id, theme]))

export function getElementTheme(id: ElementId): ElementTheme {
  return themeById.get(id) ?? themeById.get(DEFAULT_ELEMENT_ID)!
}

export function isElementId(value: unknown): value is ElementId {
  return typeof value === 'number' && themeById.has(value as ElementId)
}
