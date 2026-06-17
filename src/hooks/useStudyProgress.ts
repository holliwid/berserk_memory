import { useCallback, useEffect, useMemo, useState } from 'react'
import { State } from 'ts-fsrs'
import {
  DEFAULT_STUDY_SETTINGS,
  isDue,
  isLearningState,
  scheduleReview,
} from '../lib/fsrs'
import type { Card } from '../types/card'
import type {
  CardReviewRecord,
  ReviewRating,
  StudySettings,
  StudyStats,
} from '../types/study'

const REVIEWS_KEY = 'berserk-trainer-reviews'
const SETTINGS_KEY = 'berserk-trainer-settings'

function loadReviews(): Record<string, CardReviewRecord> {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, CardReviewRecord>
  } catch {
    return {}
  }
}

function loadSettings(): StudySettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_STUDY_SETTINGS
    return { ...DEFAULT_STUDY_SETTINGS, ...JSON.parse(raw) } as StudySettings
  } catch {
    return DEFAULT_STUDY_SETTINGS
  }
}

export function useStudyProgress() {
  const [reviews, setReviews] = useState<Record<string, CardReviewRecord>>(
    loadReviews,
  )
  const [settings] = useState<StudySettings>(loadSettings)

  useEffect(() => {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews))
  }, [reviews])

  const rateCard = useCallback(
    (cardId: string, rating: ReviewRating, now = Date.now()) => {
      const current = reviews[cardId] ?? null
      const next = scheduleReview(cardId, current, rating, settings, new Date(now))
      setReviews((prev) => ({ ...prev, [cardId]: next }))
      return next
    },
    [reviews, settings],
  )

  const getStats = useCallback(
    (pool: Card[], now = Date.now()): StudyStats => {
      let due = 0
      let newCount = 0
      let learning = 0

      for (const card of pool) {
        const record = reviews[card.id]
        if (!record) {
          newCount += 1
          continue
        }

        if (isDue(record, now)) {
          due += 1
        } else if (isLearningState(record.state)) {
          learning += 1
        } else if (record.state === State.New) {
          newCount += 1
        }
      }

      return {
        due,
        new: newCount,
        learning,
        total: pool.length,
      }
    },
    [reviews],
  )

  const resetCollection = useCallback((pool: Card[]) => {
    const ids = new Set(pool.map((card) => card.id))
    setReviews((prev) => {
      const next = { ...prev }
      for (const id of ids) {
        delete next[id]
      }
      return next
    })
  }, [])

  const getReview = useCallback(
    (cardId: string) => reviews[cardId] ?? null,
    [reviews],
  )

  return useMemo(
    () => ({
      reviews,
      settings,
      rateCard,
      getStats,
      resetCollection,
      getReview,
    }),
    [reviews, settings, rateCard, getStats, resetCollection, getReview],
  )
}
