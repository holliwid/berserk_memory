import type { ElementId } from '../config/elementThemes'
import { ElementMark } from './ElementMark'

type MobileHeaderProps = {
  elementId: ElementId
  collectionSetCount: number
  onOpenTheme: () => void
  onOpenCollection: () => void
}

export function MobileHeader({
  elementId,
  collectionSetCount,
  onOpenTheme,
  onOpenCollection,
}: MobileHeaderProps) {
  const badgeLabel =
    collectionSetCount > 0 ? String(collectionSetCount) : '!'

  return (
    <header className="mobile-header mobile-only">
      <button
        type="button"
        className="mobile-header__brand"
        onClick={onOpenTheme}
        aria-label="Сменить стиль интерфейса"
      >
        <ElementMark elementId={elementId} className="mobile-header__mark" />
      </button>

      <button
        type="button"
        className="mobile-header__collection"
        onClick={onOpenCollection}
        aria-label="Коллекция выпусков"
      >
        <span className="mobile-header__collection-icon" aria-hidden="true">
          ☰
        </span>
        <span
          className={`mobile-header__badge${collectionSetCount === 0 ? ' mobile-header__badge--warn' : ''}`}
        >
          {badgeLabel}
        </span>
      </button>
    </header>
  )
}
