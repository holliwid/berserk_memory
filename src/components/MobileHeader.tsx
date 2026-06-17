import type { ElementId } from '../config/elementThemes'
import type { StudyMode, StudyStats } from '../types/study'
import { ElementMark } from './ElementMark'

type MobileHeaderProps = {
  elementId: ElementId
  studyMode: StudyMode
  hasSelection: boolean
  collectionSetCount: number
  studyStats: StudyStats
  onOpenTheme: () => void
  onOpenCollection: () => void
}

export function MobileHeader({
  elementId,
  studyMode,
  hasSelection,
  collectionSetCount,
  studyStats,
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
        <span className="mobile-header__logo">Берсерк</span>
      </button>

      {studyMode === 'srs' && hasSelection && (
        <p className="mobile-header__stats" aria-label="Статистика повторения">
          <span>{studyStats.due}</span>
          <span aria-hidden="true">·</span>
          <span>{studyStats.new}</span>
          <span aria-hidden="true">·</span>
          <span>{studyStats.total}</span>
        </p>
      )}

      <button
        type="button"
        className="mobile-header__collection"
        onClick={onOpenCollection}
        aria-label="Коллекция выпусков"
      >
        <span className="mobile-header__collection-label">Коллекция</span>
        <span
          className={`mobile-header__badge${collectionSetCount === 0 ? ' mobile-header__badge--warn' : ''}`}
        >
          {badgeLabel}
        </span>
      </button>
    </header>
  )
}
