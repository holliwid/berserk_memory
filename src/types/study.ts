export type StudyMode = 'srs' | 'browse'

export type StudyCollection = {
  setIds: number[]
}

export type StudySettings = {
  desiredRetention: number
}

export type CardReviewRecord = {
  cardId: string
  due: number
  stability: number
  difficulty: number
  elapsed_days: number
  scheduled_days: number
  reps: number
  lapses: number
  state: number
  last_review?: number
}

export type StudyStats = {
  due: number
  new: number
  learning: number
  total: number
}

export type ReviewRating = 1 | 2 | 3 | 4
