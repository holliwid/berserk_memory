import type { StudyMode, ReviewRating } from '../types/study'
import { REVIEW_LABELS, REVIEW_RATINGS } from '../lib/fsrs'

type TrainerControlsProps = {
  studyMode: StudyMode
  revealed: boolean
  seenCount: number
  poolSize: number
  sessionGoal: number
  srsComplete: boolean
  disabled: boolean
  ratingPreviews: Record<ReviewRating, string> | null
  onReveal: () => void
  onNext: () => void
  onRate: (rating: ReviewRating) => void
}

export function TrainerControls({
  studyMode,
  revealed,
  seenCount,
  poolSize,
  sessionGoal,
  srsComplete,
  disabled,
  ratingPreviews,
  onReveal,
  onNext,
  onRate,
}: TrainerControlsProps) {
  const isSrs = studyMode === 'srs'
  const goal = isSrs ? Math.max(sessionGoal, 1) : poolSize
  const current = isSrs ? Math.min(seenCount, goal) : Math.min(seenCount, poolSize)
  const progress = goal > 0 ? Math.min(100, (current / goal) * 100) : 0
  const title = isSrs ? 'Повторение' : 'Тренировка'

  return (
    <div className="trainer-controls">
      <div className="trainer-controls__frame">
        <header className="trainer-controls__head">
          <span className="trainer-controls__title">{title}</span>
          <span className="trainer-controls__counter">
            <span className="trainer-controls__counter-current">{current}</span>
            <span className="trainer-controls__counter-sep">из</span>
            <span className="trainer-controls__counter-total">{goal}</span>
          </span>
        </header>

        <div className="trainer-controls__divider">
          <div
            className="trainer-controls__progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={goal}
            aria-valuenow={current}
            aria-label={`Прогресс ${current} из ${goal}`}
          >
            <div
              className="trainer-controls__progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="trainer-controls__body">
          <span className="trainer-controls__ornament trainer-controls__ornament--tl" aria-hidden="true" />
          <span className="trainer-controls__ornament trainer-controls__ornament--tr" aria-hidden="true" />
          <span className="trainer-controls__ornament trainer-controls__ornament--bl" aria-hidden="true" />
          <span className="trainer-controls__ornament trainer-controls__ornament--br" aria-hidden="true" />

          {isSrs && srsComplete ? (
            <p className="trainer-controls__done">На сегодня повторений нет. Отличная работа!</p>
          ) : isSrs && revealed && ratingPreviews ? (
            <>
              <p className="trainer-controls__hint">
                Оцените, насколько хорошо вспомнили карту
              </p>
              <div className="trainer-controls__ratings">
                {REVIEW_RATINGS.map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    className={`rating-btn rating-btn--${rating}`}
                    onClick={() => onRate(rating)}
                    disabled={disabled}
                  >
                    <kbd className="rating-btn__key">{rating}</kbd>
                    <span className="rating-btn__label">{REVIEW_LABELS[rating]}</span>
                    <span className="rating-btn__interval">{ratingPreviews[rating]}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="trainer-controls__hint">
                <kbd>Пробел</kbd>
                <span>показать ответ</span>
                {!isSrs && (
                  <>
                    <span className="trainer-controls__hint-sep" aria-hidden="true" />
                    <kbd>→</kbd>
                    <span>следующая</span>
                  </>
                )}
                {isSrs && revealed && (
                  <>
                    <span className="trainer-controls__hint-sep" aria-hidden="true" />
                    <kbd>→</kbd>
                    <span>хорошо</span>
                  </>
                )}
              </p>

              <div className="trainer-controls__actions">
                <button
                  type="button"
                  className="button button--primary"
                  onClick={onReveal}
                  disabled={disabled || revealed}
                >
                  Показать ответ
                </button>
                {!isSrs && (
                  <button
                    type="button"
                    className="button trainer-controls__next"
                    onClick={onNext}
                    disabled={disabled}
                  >
                    Следующая карта
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
