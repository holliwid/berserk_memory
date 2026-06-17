import type { ElementId } from '../config/elementThemes'
import { getElementTheme } from '../config/elementThemes'

type ElementMarkProps = {
  elementId: ElementId
  className?: string
}

export function ElementMark({ elementId, className }: ElementMarkProps) {
  const theme = getElementTheme(elementId)

  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="22" fill={theme.common} stroke={theme.accent} strokeWidth="1.5" />
      <circle cx="24" cy="24" r="17" fill={theme.commonSurface} />
      {elementId === 16 ? (
        <>
          <ellipse cx="24" cy="26" rx="9" ry="10" fill={theme.commonDeep} />
          <circle cx="19" cy="24" r="2.2" fill={theme.rare} />
          <circle cx="29" cy="24" r="2.2" fill={theme.rare} />
          <path d="M20 32c2 2 6 2 8 0" stroke={theme.rare} strokeWidth="1.2" fill="none" />
        </>
      ) : elementId === 1 ? (
        <path d="M10 30c6-10 22-10 28 0" stroke={theme.accent} strokeWidth="2" fill="none" />
      ) : elementId === 2 ? (
        <path d="M14 32L24 12l10 20z" fill={theme.accent} opacity="0.85" />
      ) : elementId === 4 ? (
        <path d="M24 10c-8 8-8 18 0 26 8-8 8-18 0-26z" fill={theme.accent} opacity="0.8" />
      ) : elementId === 8 ? (
        <>
          <ellipse cx="24" cy="30" rx="12" ry="5" fill={theme.accent} opacity="0.5" />
          <path d="M16 22c2-6 10-8 16-4" stroke={theme.accent} strokeWidth="2" fill="none" />
        </>
      ) : (
        <rect x="16" y="16" width="16" height="16" rx="2" fill={theme.accent} opacity="0.75" />
      )}
    </svg>
  )
}
