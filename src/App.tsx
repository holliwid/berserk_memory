import { useEffect, useState, type CSSProperties } from 'react'

import { CollectionDrawer } from './components/CollectionDrawer'

import { CollectionPanel } from './components/CollectionPanel'

import { ElementMark } from './components/ElementMark'

import { CardWithMasks } from './components/CardWithMasks'

import { MobileHeader } from './components/MobileHeader'

import { ThemePicker } from './components/ThemePicker'

import { TrainerControls } from './components/TrainerControls'

import { themeStyle, useElementTheme } from './hooks/useElementTheme'

import { useCardPool } from './hooks/useCardPool'

import type { ReviewRating } from './types/study'

import './styles/app.css'

import './styles/masks.css'



const BOARD_CELLS = 15



function App() {

  const [themeOpen, setThemeOpen] = useState(false)

  const [collectionOpen, setCollectionOpen] = useState(false)

  const { elementId, theme, selectTheme } = useElementTheme()

  const {

    constData,

    currentCard,

    collection,

    studyMode,

    loading,

    error,

    revealed,

    poolSize,

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

  } = useCardPool()



  const hasSelection = collection.setIds.length > 0

  const showTrainer =

    !loading && !error && hasSelection && (currentCard || srsComplete)



  useEffect(() => {

    function onKeyDown(event: KeyboardEvent) {

      if (event.target instanceof HTMLInputElement) return

      if (themeOpen || collectionOpen) return



      if (event.code === 'Space' && !revealed && currentCard) {

        event.preventDefault()

        reveal()

        return

      }



      if (studyMode === 'srs' && revealed && currentCard) {

        const digit = event.key

        if (digit >= '1' && digit <= '4') {

          event.preventDefault()

          rateCurrentCard(Number(digit) as ReviewRating)

          return

        }



        if (event.code === 'ArrowRight') {

          event.preventDefault()

          rateCurrentCard(3)

        }

        return

      }



      if (studyMode === 'browse' && event.code === 'ArrowRight' && currentCard) {

        event.preventDefault()

        nextCard()

      }

    }



    window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)

  }, [

    currentCard,

    revealed,

    reveal,

    nextCard,

    rateCurrentCard,

    studyMode,

    themeOpen,

    collectionOpen,

  ])



  function handleCardTap() {

    if (!revealed && currentCard) {

      reveal()

    }

  }



  return (

    <div className="board" style={themeStyle(theme) as CSSProperties}>

      <aside className="board-rail board-rail--left board-rail--desktop">

        <div className="board-rail__label" aria-hidden="true">

          <span className="board-rail__title">Коллекция</span>

        </div>

        <div className="board-rail__body">

          {constData && (

            <CollectionPanel

              constData={constData}

              collection={collection}

              studyMode={studyMode}

              studyStats={studyStats}

              onCollectionChange={updateCollection}

              onModeChange={setStudyMode}

              onResetProgress={resetCollectionProgress}

            />

          )}

        </div>

      </aside>



      <main className="board-field">

        <div className="board-field__veil" aria-hidden="true" />

        <div className="board-field__grid" aria-hidden="true">

          {Array.from({ length: BOARD_CELLS }, (_, index) => (

            <div key={index} className="board-cell" />

          ))}

        </div>



        <div className="board-field__content">

          <MobileHeader
            elementId={elementId}
            studyMode={studyMode}

            hasSelection={hasSelection}

            collectionSetCount={collection.setIds.length}

            studyStats={studyStats}

            onOpenTheme={() => setThemeOpen(true)}

            onOpenCollection={() => setCollectionOpen(true)}

          />



          <button

            type="button"

            className="board-brand desktop-only"

            onClick={() => setThemeOpen(true)}

            aria-haspopup="dialog"

            aria-expanded={themeOpen}

            aria-label="Сменить стиль интерфейса"

          >

            <ElementMark elementId={elementId} className="board-brand__mark" />

            <div className="board-brand__text">

              <span className="board-brand__logo">Берсерк</span>

              <span className="board-brand__subtitle">

                тренажёр карт · стихия {theme.name.toLowerCase()}

              </span>

            </div>

          </button>



          <section className="trainer">

            {loading && <p className="status-message">Загрузка базы карт...</p>}

            {error && <p className="status-message status-message--error">{error}</p>}

            {!loading && !error && !hasSelection && (

              <p className="status-message">

                Выберите один или несколько выпусков, чтобы начать.

                <button

                  type="button"

                  className="button button--primary status-message__action mobile-only"

                  onClick={() => setCollectionOpen(true)}

                >

                  Выбрать выпуски

                </button>

              </p>

            )}

            {!loading && !error && hasSelection && poolSize === 0 && (

              <p className="status-message">

                В выбранных выпусках нет карт с изображениями.

              </p>

            )}

            {showTrainer && (

              <div className="trainer-stack">

                {currentCard && (

                  <div

                    className={`card-slot${!revealed ? ' card-slot--tappable' : ''}`}

                    onClick={handleCardTap}

                    onKeyDown={(event) => {

                      if (event.key === 'Enter' || event.key === ' ') {

                        event.preventDefault()

                        handleCardTap()

                      }

                    }}

                    role={!revealed ? 'button' : undefined}

                    tabIndex={!revealed ? 0 : undefined}

                    aria-label={!revealed ? 'Показать ответ' : undefined}

                  >

                    <CardWithMasks card={currentCard} revealed={revealed} />

                  </div>

                )}

                <TrainerControls

                  studyMode={studyMode}

                  revealed={revealed}

                  seenCount={seenCount}

                  poolSize={poolSize}

                  sessionGoal={sessionGoal}

                  srsComplete={srsComplete}

                  disabled={poolSize === 0}

                  ratingPreviews={ratingPreviews}

                  onReveal={reveal}

                  onNext={nextCard}

                  onRate={rateCurrentCard}

                />

              </div>

            )}

          </section>

        </div>

      </main>



      <aside className="board-rail board-rail--right desktop-only" aria-hidden="true">

        <div className="board-rail__section">

          <span className="board-rail__title">Колода</span>

        </div>

        <div className="board-rail__section">

          <span className="board-rail__title">Кладбище</span>

        </div>

        <div className="board-rail__section">

          <span className="board-rail__title">Изгнание</span>

        </div>

      </aside>



      {constData && (

        <CollectionDrawer

          open={collectionOpen}

          onClose={() => setCollectionOpen(false)}

          constData={constData}

          collection={collection}

          studyMode={studyMode}

          studyStats={studyStats}

          onCollectionChange={updateCollection}

          onModeChange={setStudyMode}

          onResetProgress={resetCollectionProgress}

        />

      )}



      <ThemePicker

        open={themeOpen}

        currentId={elementId}

        onSelect={selectTheme}

        onClose={() => setThemeOpen(false)}

      />

    </div>

  )

}



export default App


