import type { CardConst } from '../types/card'
import type { StudyCollection, StudyMode, StudyStats } from '../types/study'
import { formatSetLabel, getSetSortOrder, isSetAvailable } from '../config/sets'

type CollectionPanelProps = {
  constData: CardConst
  collection: StudyCollection
  studyMode: StudyMode
  studyStats: StudyStats
  onCollectionChange: (collection: StudyCollection) => void
  onModeChange: (mode: StudyMode) => void
  onResetProgress: () => void
}

function toggleSet(setIds: number[], setId: number): number[] {
  return setIds.includes(setId)
    ? setIds.filter((id) => id !== setId)
    : [...setIds, setId]
}

export function CollectionPanel({
  constData,
  collection,
  studyMode,
  studyStats,
  onCollectionChange,
  onModeChange,
  onResetProgress,
}: CollectionPanelProps) {
  const hasSelection = collection.setIds.length > 0

  function handleResetProgress() {
    if (
      window.confirm(
        'Сбросить прогресс повторения для карт выбранных выпусков? Это действие нельзя отменить.',
      )
    ) {
      onResetProgress()
    }
  }

  return (
    <aside className="filter-panel collection-panel">
      <div className="filter-panel__header">
        <p className="filter-panel__count">
          {hasSelection
            ? `В коллекции: ${studyStats.total} карт`
            : 'Выберите выпуски'}
        </p>
      </div>

      <section className="filter-group">
        <h3>Режим</h3>
        <div className="mode-switch">
          <button
            type="button"
            className={`mode-switch__btn${studyMode === 'srs' ? ' mode-switch__btn--active' : ''}`}
            onClick={() => onModeChange('srs')}
          >
            Повторение
          </button>
          <button
            type="button"
            className={`mode-switch__btn${studyMode === 'browse' ? ' mode-switch__btn--active' : ''}`}
            onClick={() => onModeChange('browse')}
          >
            Свободный просмотр
          </button>
        </div>
      </section>

      {studyMode === 'srs' && hasSelection && (
        <section className="study-stats">
          <div className="study-stats__row">
            <span className="study-stats__label">К повторению</span>
            <span className="study-stats__value">{studyStats.due}</span>
          </div>
          <div className="study-stats__row">
            <span className="study-stats__label">Новые</span>
            <span className="study-stats__value">{studyStats.new}</span>
          </div>
          <div className="study-stats__row">
            <span className="study-stats__label">В изучении</span>
            <span className="study-stats__value">{studyStats.learning}</span>
          </div>
        </section>
      )}

      <section className="filter-group">
        <h3>Выпуски</h3>
        <div className="filter-options">
          {Object.entries(constData.sets)
            .filter(([id]) => isSetAvailable(Number(id)))
            .sort(([a], [b]) => getSetSortOrder(Number(a)) - getSetSortOrder(Number(b)))
            .map(([id, name]) => {
              const setId = Number(id)
              return (
                <label key={id} className="filter-chip">
                  <input
                    type="checkbox"
                    checked={collection.setIds.includes(setId)}
                    onChange={() =>
                      onCollectionChange({
                        setIds: toggleSet(collection.setIds, setId),
                      })
                    }
                  />
                  {formatSetLabel(setId, name)}
                </label>
              )
            })}
        </div>
      </section>

      {hasSelection && studyMode === 'srs' && (
        <button
          type="button"
          className="button button--ghost"
          onClick={handleResetProgress}
        >
          Сбросить прогресс
        </button>
      )}
    </aside>
  )
}
