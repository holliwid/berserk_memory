import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import type { Card } from '../types/card'
import { getCropBottom } from '../config/maskZones'
import { assetUrl } from '../lib/assetUrl'

type CardWithMasksProps = {
  card: Card
  revealed: boolean
}

function cardImageUrl(card: Card): string {
  if (card.imageUrl) return card.imageUrl
  return assetUrl(`cards/${card.setId}/${card.number}.webp`)
}

export function CardWithMasks({ card, revealed }: CardWithMasksProps) {
  const [imageError, setImageError] = useState(false)
  const [loadedCardId, setLoadedCardId] = useState<string | null>(null)
  const imageLoaded = loadedCardId === card.id
  const coverHeight = getCropBottom(card.type)
  const src = cardImageUrl(card)

  useEffect(() => {
    setImageError(false)
  }, [card.id])

  const markLoaded = useCallback(() => {
    setLoadedCardId(card.id)
    setImageError(false)
  }, [card.id])

  const handleImageRef = useCallback(
    (node: HTMLImageElement | null) => {
      if (node?.complete && node.naturalWidth > 0) {
        markLoaded()
      }
    },
    [markLoaded],
  )

  return (
    <div className="card-with-masks">
      <div
        className={`card-frame${revealed ? ' card-frame--revealed' : ''}`}
        style={{ '--cover-height': `${coverHeight}%` } as CSSProperties}
      >
        {!imageError ? (
          <>
            <div className="card-image-layer">
              <div
                className={`card-skeleton${imageLoaded ? ' card-skeleton--hidden' : ''}`}
                aria-hidden="true"
              >
                <div className="card-skeleton__shimmer" />
              </div>

              <img
                ref={handleImageRef}
                className={`card-image${imageLoaded ? ' card-image--loaded' : ''}`}
                src={src}
                alt={card.name}
                onLoad={markLoaded}
                onError={() => {
                  setImageError(true)
                  setLoadedCardId(null)
                }}
              />

              {!revealed && (
                <div className="card-stats-cover" aria-hidden="true" />
              )}
            </div>
          </>
        ) : (
          <div className="card-image-fallback">
            <span>Изображение недоступно</span>
            <a
              href="https://berserk.ru/?route=catalog/cards"
              target="_blank"
              rel="noreferrer"
            >
              Открыть на berserk.ru
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
