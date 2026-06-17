import { useEffect, useRef, type CSSProperties } from 'react'
import { ELEMENT_THEMES, type ElementId } from '../config/elementThemes'
import { ElementMark } from './ElementMark'

type ThemePickerProps = {
  open: boolean
  currentId: ElementId
  onSelect: (id: ElementId) => void
  onClose: () => void
}

export function ThemePicker({ open, currentId, onSelect, onClose }: ThemePickerProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.code === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (open) dialogRef.current?.focus()
  }, [open])

  if (!open) return null

  return (
    <div className="theme-picker" role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className="theme-picker__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-picker-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="theme-picker__header">
          <h2 id="theme-picker-title">Стиль интерфейса</h2>
          <p>Выберите стихию — оформление поля и панелей изменится</p>
        </header>

        <ul className="theme-picker__list">
          {ELEMENT_THEMES.map((item) => {
            const active = item.id === currentId
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`theme-picker__option${active ? ' theme-picker__option--active' : ''}`}
                  style={{
                    '--option-common': item.common,
                    '--option-rare': item.rare,
                    '--option-accent': item.accent,
                  } as CSSProperties}
                  onClick={() => {
                    onSelect(item.id)
                    onClose()
                  }}
                >
                  <ElementMark elementId={item.id} className="theme-picker__mark" />
                  <span className="theme-picker__name">{item.name}</span>
                  <span className="theme-picker__swatches" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
