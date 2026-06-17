import {
  createEmptyCard,
  fsrs,
  Rating,
  State,
  type Card as FSRSCard,
} from 'ts-fsrs'
import type { CardReviewRecord, ReviewRating, StudySettings } from '../types/study'

export const DEFAULT_STUDY_SETTINGS: StudySettings = {
  desiredRetention: 0.9,
}

export const REVIEW_RATINGS: ReviewRating[] = [1, 2, 3, 4]

export const REVIEW_LABELS: Record<ReviewRating, string> = {
  1: 'Снова',
  2: 'Трудно',
  3: 'Хорошо',
  4: 'Легко',
}

const schedulerCache = new Map<number, ReturnType<typeof fsrs>>()

function getScheduler(settings: StudySettings) {
  const cached = schedulerCache.get(settings.desiredRetention)
  if (cached) return cached

  const instance = fsrs({
    request_retention: settings.desiredRetention,
  })
  schedulerCache.set(settings.desiredRetention, instance)
  return instance
}

export function recordToFsrsCard(record: CardReviewRecord): FSRSCard {
  return {
    due: new Date(record.due),
    stability: record.stability,
    difficulty: record.difficulty,
    elapsed_days: record.elapsed_days,
    scheduled_days: record.scheduled_days,
    learning_steps: 0,
    reps: record.reps,
    lapses: record.lapses,
    state: record.state as State,
    last_review: record.last_review ? new Date(record.last_review) : undefined,
  }
}

export function fsrsCardToRecord(cardId: string, card: FSRSCard): CardReviewRecord {
  return {
    cardId,
    due: card.due.getTime(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review?.getTime(),
  }
}

export function scheduleReview(
  cardId: string,
  record: CardReviewRecord | null,
  rating: ReviewRating,
  settings: StudySettings = DEFAULT_STUDY_SETTINGS,
  now = new Date(),
): CardReviewRecord {
  const scheduler = getScheduler(settings)
  const card = record ? recordToFsrsCard(record) : createEmptyCard(now)
  const { card: nextCard } = scheduler.next(card, now, rating)
  return fsrsCardToRecord(cardId, nextCard)
}

export function previewInterval(
  record: CardReviewRecord | null,
  rating: ReviewRating,
  settings: StudySettings = DEFAULT_STUDY_SETTINGS,
  now = new Date(),
): string {
  const scheduler = getScheduler(settings)
  const card = record ? recordToFsrsCard(record) : createEmptyCard(now)
  const previews = scheduler.repeat(card, now)
  const nextDue = previews[rating].card.due
  return formatInterval(now, nextDue)
}

export function previewAllRatings(
  record: CardReviewRecord | null,
  settings: StudySettings = DEFAULT_STUDY_SETTINGS,
  now = new Date(),
): Record<ReviewRating, string> {
  return {
    1: previewInterval(record, Rating.Again, settings, now),
    2: previewInterval(record, Rating.Hard, settings, now),
    3: previewInterval(record, Rating.Good, settings, now),
    4: previewInterval(record, Rating.Easy, settings, now),
  }
}

export function formatInterval(from: Date, to: Date): string {
  const diffMs = Math.max(0, to.getTime() - from.getTime())
  const minutes = Math.round(diffMs / 60_000)

  if (minutes < 60) {
    return minutes <= 1 ? 'через 1 мин' : `через ${minutes} мин`
  }

  const hours = Math.round(minutes / 60)
  if (hours < 24) {
    return hours === 1 ? 'через 1 ч' : `через ${hours} ч`
  }

  const days = Math.round(hours / 24)
  if (days === 1) return 'через 1 день'
  if (days < 30) return `через ${days} дн`
  if (days < 365) {
    const months = Math.round(days / 30)
    return months === 1 ? 'через 1 мес' : `через ${months} мес`
  }

  const years = Math.round(days / 365)
  return years === 1 ? 'через 1 год' : `через ${years} лет`
}

export function isDue(record: CardReviewRecord, now = Date.now()): boolean {
  return record.due <= now
}

export function isLearningState(state: number): boolean {
  return state === State.Learning || state === State.Relearning
}

export { Rating, State }
