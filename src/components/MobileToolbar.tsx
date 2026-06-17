import type { ElementId } from '../config/elementThemes'
import { ElementMark } from './ElementMark'

type MobileToolbarProps = {
  elementId: ElementId
  collectionSetCount: number
  onOpenTheme: () => void
  onOpenCollection: () => void
}

export function MobileToolbar({
  elementId,
  collectionSetCount,
  onOpenTheme,
  onOpenCollection,
}: MobileToolbarProps) {
  const badgeLabel =
    collectionSetCount > 0 ? String(collectionSetCount) : '!'

  return (
    <div className="mobile-toolbar mobile-only">
      <button
        type="button"
        className="mobile-toolbar__btn"
        onClick={onOpenTheme}
        aria-label="Сменить стиль интерфейса"
      >
        <ElementMark elementId={elementId} className="mobile-toolbar__mark" />
      </button>

      <button
        type="button"
        className="mobile-toolbar__btn"
        onClick={onOpenCollection}
        aria-label="Коллекция выпусков"
      >
        <span className="mobile-toolbar__icon" aria-hidden="true">
          ☰
        </span>
        <span
          className={`mobile-toolbar__badge${collectionSetCount === 0 ? ' mobile-toolbar__badge--warn' : ''}`}
        >
          {badgeLabel}
        </span>
      </button>
    </div>
  )
}
