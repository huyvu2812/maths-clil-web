import React, { useMemo, useState } from "react";
import { Layers3, Search, ArrowRight, RotateCcw, Volume2 } from "lucide-react";
import content from "../data/content.json";
import EmptyState from "../components/EmptyState";

export default function FlashcardsPage() {
  const [search, setSearch] = useState("");
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const filteredCards = useMemo(
    () =>
      content.flashcards.filter((c) =>
        `${c.english} ${c.vietnamese} ${c.example} ${c.chapterCode}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [search],
  );

  const activeCard = filteredCards.length
    ? filteredCards[cardIndex % filteredCards.length]
    : null;

  function nextCard(direction) {
    if (!filteredCards.length) return;
    setCardIndex(
      (i) => (i + direction + filteredCards.length) % filteredCards.length,
    );
    setFlipped(false);
  }

  function speak(text) {
    if ("speechSynthesis" in window && text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  }

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <Layers3 size={14} /> ACTIVE RECALL
          </div>
          <h1>
            Flip it. <em>Learn it.</em>
          </h1>
          <p>Practise key maths vocabulary with your flashcard deck.</p>
        </div>
        <div className="heading-sticker sticker-yellow">
          <span>?</span> <b>!</b>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCardIndex(0);
              setFlipped(false);
            }}
            placeholder="Find a flashcard..."
          />
        </div>
        <div className="deck-count">
          <Layers3 size={16} />
          {filteredCards.length} cards in deck
        </div>
      </div>

      {activeCard ? (
        <div className="flashcard-layout">
          <div className="flashcard-side-note">
            <span className="tiny-label">YOUR STUDY SESSION</span>
            <h3>
              Small steps,
              <br />
              <em>big progress.</em>
            </h3>
            <p>Try to recall the meaning before you flip the card.</p>
            <div className="progress-track">
              <span
                style={{
                  width: `${((cardIndex + 1) / filteredCards.length) * 100}%`,
                }}
              />
            </div>
            <small>
              Card {cardIndex + 1} of {filteredCards.length}
            </small>
          </div>

          <div className="flashcard-column">
            <button
              className={`flashcard ${flipped ? "flipped" : ""}`}
              onClick={() => setFlipped((v) => !v)}
              aria-label="Flip flashcard"
            >
              <span className="card-corner">
                MATHS CLIL <span>✳</span>
              </span>
              <span className="flashcard-label">
                {flipped ? "VIETNAMESE" : "ENGLISH TERM"}
              </span>
              <strong>
                {flipped ? activeCard.vietnamese : activeCard.english}
              </strong>
              {flipped && activeCard.example && (
                <span className="flash-example">{activeCard.example}</span>
              )}
              <span className="flip-hint">
                <RotateCcw size={15} /> Click to flip
              </span>
              <span className="card-decoration">✳</span>
            </button>

            <div className="flash-controls">
              <button className="secondary-button" onClick={() => nextCard(-1)}>
                ← Previous
              </button>
              <button className="primary-button" onClick={() => nextCard(1)}>
                Next card <ArrowRight size={16} />
              </button>
            </div>

            <button
              className="text-button"
              onClick={() => speak(activeCard.english)}
            >
              <Volume2 size={16} /> Listen to pronunciation
            </button>
          </div>
        </div>
      ) : (
        <EmptyState text="No flashcards found. Try another search." />
      )}
    </section>
  );
}
