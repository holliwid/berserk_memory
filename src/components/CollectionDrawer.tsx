import { useEffect } from 'react'
import type { CardConst } from '../types/card'
import type { StudyCollection, StudyMode, StudyStats } from '../types/study'
import { CollectionPanel } from './CollectionPanel'

type CollectionDrawerProps = {
  open: boolean
  onClose: () => void
  constData: CardConst
  collection: StudyCollection
  studyMode: StudyMode
  studyStats: StudyStats
  onCollectionChange: (collection: StudyCollection) => void
  onModeChange: (mode: StudyMode) => void
  onResetProgress: () => void
}

export function CollectionDrawer({
  open,
  onClose,
  constData,
  collection,
  studyMode,
  studyStats,
  onCollectionChange,
  onModeChange,
  onResetProgress,
}: CollectionDrawerProps) {
  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="collection-drawer" role="presentation">
      <button
        type="button"
        className="collection-drawer__backdrop"
        aria-label="Закрыть коллекцию"
        onClick={onClose}
      />
      <div
        className="collection-drawer__sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="collection-drawer-title"
      >
        <div className="collection-drawer__handle" aria-hidden="true" />
        <header className="collection-drawer__header">
          <h2 id="collection-drawer-title" className="collection-drawer__title">
            Коллекция
          </h2>
          <button
            type="button"
            className="collection-drawer__close"
            onClick={onClose}
            aria-label="Закрыть"
          >
            ✕
          </button>
        </header>
        <div className="collection-drawer__body">
          <CollectionPanel
            constData={constData}
            collection={collection}
            studyMode={studyMode}
            studyStats={studyStats}
            onCollectionChange={onCollectionChange}
            onModeChange={onModeChange}
            onResetProgress={onResetProgress}
          />
        </div>
      </div>
    </div>
  )
}
