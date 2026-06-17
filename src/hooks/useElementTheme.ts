import { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_ELEMENT_ID,
  getElementTheme,
  isElementId,
  type ElementId,
  type ElementTheme,
} from '../config/elementThemes'

const THEME_KEY = 'berserk-trainer-element-theme'

function loadThemeId(): ElementId {
  try {
    const raw = localStorage.getItem(THEME_KEY)
    if (!raw) return DEFAULT_ELEMENT_ID
    const parsed = Number(raw)
    return isElementId(parsed) ? parsed : DEFAULT_ELEMENT_ID
  } catch {
    return DEFAULT_ELEMENT_ID
  }
}

export function useElementTheme() {
  const [elementId, setElementId] = useState<ElementId>(loadThemeId)
  const theme = getElementTheme(elementId)

  useEffect(() => {
    localStorage.setItem(THEME_KEY, String(elementId))
  }, [elementId])

  const selectTheme = useCallback((id: ElementId) => {
    setElementId(id)
  }, [])

  return { elementId, theme, selectTheme }
}

export function themeStyle(theme: ElementTheme): Record<string, string> {
  return {
    '--el-common': theme.common,
    '--el-rare': theme.rare,
    '--el-accent': theme.accent,
    '--el-common-deep': theme.commonDeep,
    '--el-common-surface': theme.commonSurface,
    '--el-field-end': theme.fieldEnd,
    '--el-ink': theme.ink,
    '--el-ink-dark': theme.inkDark,
    '--el-ink-muted': theme.inkMuted,
  }
}
