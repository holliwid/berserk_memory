import { useCallback, useEffect, useMemo, useState } from 'react'
import { isSetAvailable } from '../config/sets'
import { previewAllRatings } from '../lib/fsrs'
import { assetUrl } from '../lib/assetUrl'
import { useStudyProgress } from './useStudyProgress'
import type { Card, CardConst } from '../types/card'
import type { ReviewRating, StudyCollection, StudyMode, StudyStats } from '../types/study'

const COLLECTION_KEY = 'berserk-trainer-collection'
const MODE_KEY = 'berserk-trainer-mode'
const LEGACY_FILTERS_KEY = 'berserk-trainer-filters'

const defaultCollection: StudyCollection = { setIds: [] }

function loadCollection(): StudyCollection {
  try {
    const raw = localStorage.getItem(COLLECTION_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as StudyCollection
      return {
        setIds: parsed.setIds.filter(isSetAvailable),
      }
    }

    const legacyRaw = localStorage.getItem(LEGACY_FILTERS_KEY)
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw) as { sets?: number[] }
      if (legacy.sets?.length) {
        return { setIds: legacy.sets.filter(isSetAvailable) }
      }
    }
  } catch {
    // ignore
  }

  return defaultCollection
}

function loadMode(): StudyMode {
  try {
    const raw = localStorage.getItem(MODE_KEY)
    if (raw === 'browse' || raw === 'srs') return raw
  } catch {
    // ignore
  }
  return 'srs'
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function matchesCollection(card: Card, collection: StudyCollection): boolean {
  if (!isSetAvailable(card.setId)) return false
  if (card.nonStandardLayout) return false
  if (collection.setIds.length === 0) return false
  return collection.setIds.includes(card.setId)
}

export function useCardPool() {
  const study = useStudyProgress()
  const [cards, setCards] = useState<Card[]>([])
  const [constData, setConstData] = useState<CardConst | null>(null)
  const [collection, setCollection] = useState<StudyCollection>(loadCollection)
  const [studyMode, setStudyModeState] = useState<StudyMode>(loadMode)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [queue, setQueue] = useState<Card[]>([])
  const [currentCard, setCurrentCard] = useState<Card | null>(null)
  const [seenCount, setSeenCount] = useState(0)
  const [sessionGoal, setSessionGoal] = useState(0)
  const [srsComplete, setSrsComplete] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const [cardsRes, constRes] = await Promise.all([
          fetch(assetUrl('data/cards.json')),
          fetch(assetUrl('data/const.json')),
        ])

        if (!cardsRes.ok || !constRes.ok) {
          throw new Error('Не удалось загрузить базу карт')
        }

        const [cardsJson, constJson] = await Promise.all([
          cardsRes.json(),
          constRes.json(),
        ])

        setCards(cardsJson)
        setConstData(constJson)
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Ошибка загрузки данных',
        )
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const pool = useMemo(
    () =>
      cards.filter(
        (card) => matchesCollection(card, collection) && Boolean(card.imageUrl),
      ),
    [cards, collection],
  )

  const studyStats: StudyStats = useMemo(
    () => study.getStats(pool),
    [study, pool],
  )

  const resetSession = useCallback(() => {
    setQueue([])
    setCurrentCard(null)
    setSeenCount(0)
    setRevealed(false)
    setSrsComplete(false)
  }, [])

  const buildSrsQueue = useCallback(
    (poolCards: Card[]) => {
      const now = Date.now()
      const due: Card[] = []
      const fresh: Card[] = []

      for (const card of poolCards) {
        const record = study.reviews[card.id]
        if (!record) {
          fresh.push(card)
          continue
        }
        if (record.due <= now) {
          due.push(card)
        }
      }

      due.sort(
        (a, b) =>
          (study.reviews[a.id]?.due ?? 0) - (study.reviews[b.id]?.due ?? 0),
      )

      return [...due, ...shuffle(fresh)]
    },
    [study.reviews],
  )

  const drawNextBrowse = useCallback(
    (poolCards: Card[], currentQueue: Card[]) => {
      let nextQueue = currentQueue

      if (nextQueue.length === 0) {
        if (poolCards.length === 0) {
          setCurrentCard(null)
          return
        }
        nextQueue = shuffle(poolCards)
      }

      const [nextCard, ...rest] = nextQueue
      setCurrentCard(nextCard)
      setQueue(rest)
      setRevealed(false)
      setSeenCount((count) => count + 1)
      setSrsComplete(false)
    },
    [],
  )

  const drawNextSrs = useCallback(
    (poolCards: Card[], currentQueue: Card[]) => {
      let nextQueue = currentQueue

      if (nextQueue.length === 0) {
        if (poolCards.length === 0) {
          setCurrentCard(null)
          setSrsComplete(false)
          return
        }

        nextQueue = buildSrsQueue(poolCards)
        if (nextQueue.length === 0) {
          setCurrentCard(null)
          setSrsComplete(true)
          return
        }

        setSessionGoal(nextQueue.length)
        setSeenCount(0)
      }

      const [nextCard, ...rest] = nextQueue
      setCurrentCard(nextCard)
      setQueue(rest)
      setRevealed(false)
      setSrsComplete(false)
    },
    [buildSrsQueue],
  )

  const drawNext = useCallback(
    (poolCards: Card[], currentQueue: Card[]) => {
      if (studyMode === 'browse') {
        drawNextBrowse(poolCards, currentQueue)
      } else {
        drawNextSrs(poolCards, currentQueue)
      }
    },
    [studyMode, drawNextBrowse, drawNextSrs],
  )

  useEffect(() => {
    if (!loading && pool.length > 0 && collection.setIds.length > 0 && !currentCard) {
      drawNext(pool, [])
    }
  }, [loading, pool, collection.setIds.length, currentCard, drawNext])

  useEffect(() => {
    if (pool.length === 0 || collection.setIds.length === 0) {
      setCurrentCard(null)
      setQueue([])
      setSrsComplete(false)
    }
  }, [pool.length, collection.setIds.length])

  useEffect(() => {
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(collection))
  }, [collection])

  useEffect(() => {
    localStorage.setItem(MODE_KEY, studyMode)
  }, [studyMode])

  const updateCollection = useCallback(
    (next: StudyCollection) => {
      setCollection(next)
      resetSession()
    },
    [resetSession],
  )

  const setStudyMode = useCallback(
    (mode: StudyMode) => {
      setStudyModeState(mode)
      resetSession()
    },
    [resetSession],
  )

  const reveal = useCallback(() => {
    setRevealed(true)
  }, [])

  const nextCard = useCallback(() => {
    drawNext(pool, queue)
  }, [drawNext, pool, queue])

  const rateCurrentCard = useCallback(
    (rating: ReviewRating) => {
      if (!currentCard) return
      study.rateCard(currentCard.id, rating)
      setSeenCount((count) => count + 1)
      drawNextSrs(pool, queue)
    },
    [currentCard, study, drawNextSrs, pool, queue],
  )

  const resetCollectionProgress = useCallback(() => {
    study.resetCollection(pool)
    resetSession()
  }, [study, pool, resetSession])

  const ratingPreviews = useMemo(() => {
    if (!currentCard) return null
    return previewAllRatings(study.getReview(currentCard.id), study.settings)
  }, [currentCard, study])

  return {
    cards,
    constData,
    currentCard,
    collection,
    studyMode,
    loading,
    error,
    revealed,
    poolSize: pool.length,
    seenCount,
    sessionGoal,
    srsComplete,
    studyStats,
    ratingPreviews,
    updateCollection,
    setStudyMode,
    resetCollectionProgress,
    reveal,
    nextCard,
    rateCurrentCard,
  }
}
