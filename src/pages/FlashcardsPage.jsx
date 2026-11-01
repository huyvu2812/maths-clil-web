import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Layers3,
  Search,
  ArrowRight,
  RotateCcw,
  Volume2,
  Star,
} from "lucide-react";
import content from "../data/content.json";
import EmptyState from "../components/EmptyState";

const REVIEW_KEY = "maths-clil-review-words";

export default function FlashcardsPage() {
  const chapters = useMemo(
    () => [
      {
        id: "chapter-1",
        label: "Chapter I:",
        title: "THE SET OF NATURAL NUMBERS",
      },
      {
        id: "chapter-2",
        label: "Chapter II:",
        title: "DIVISIBILITY RELATIONS AND PROPERTIES",
      },
      {
        id: "chapter-3",
        label: "Chapter III:",
        title: "THE SET OF INTEGERS",
      },
      {
        id: "chapter-4",
        label: "Chapter IV:",
        title: "SOME PLANE SHAPES IN REAL LIFE",
      },
      {
        id: "chapter-5",
        label: "Chapter V:",
        title: "SYMMETRY OF PLANE SHAPES IN NATURE",
      },
    ],
    [],
  );
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [search, setSearch] = useState("");
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showReviewList, setShowReviewList] = useState(false);
  const [reviewedWords, setReviewedWords] = useState(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = JSON.parse(localStorage.getItem(REVIEW_KEY) || "[]");
      return new Set(Array.isArray(stored) ? stored : []);
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    localStorage.setItem(REVIEW_KEY, JSON.stringify([...reviewedWords]));
  }, [reviewedWords]);

  const chapterCards = useMemo(
    () =>
      selectedChapter === "chapter-1"
        ? content.flashcards
        : selectedChapter
          ? []
          : [],
    [selectedChapter],
  );

  const filteredCards = useMemo(
    () =>
      chapterCards.filter((c) =>
        `${c.english} ${c.vietnamese} ${c.example} ${c.chapterCode}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [chapterCards, search],
  );

  const reviewCards = useMemo(
    () =>
      content.flashcards.filter((card) => reviewedWords.has(String(card.id))),
    [reviewedWords],
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

  function toggleReviewWord(cardId) {
    setReviewedWords((prev) => {
      const next = new Set(prev);
      if (next.has(String(cardId))) {
        next.delete(String(cardId));
      } else {
        next.add(String(cardId));
      }
      return next;
    });
  }

  function speak(text) {
    if ("speechSynthesis" in window && text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  }

  function handleSelectChapter(chapterId) {
    setSelectedChapter(chapterId);
    setCardIndex(0);
    setFlipped(false);
    setSearch("");
    setShowReviewList(false);
  }

  const selectedChapterMeta =
    chapters.find((chapter) => chapter.id === selectedChapter) || null;

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
      </div>

      {!selectedChapter ? (
        <>
          <div className="chapter-volume-wrap">
            <div className="volume-pill">Volume 1</div>
          </div>

          <div className="chapter-selector-grid">
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                type="button"
                className="chapter-choice"
                onClick={() => handleSelectChapter(chapter.id)}
              >
                <span className="chapter-label">{chapter.label}</span>
                <span className="chapter-title">{chapter.title}</span>
              </button>
            ))}
          </div>
        </>
      ) : selectedChapter === "chapter-1" ? (
        <>
          <div className="chapter-detail-header">
            <button
              type="button"
              className="secondary-button back-button"
              onClick={() => setSelectedChapter(null)}
            >
              <ArrowLeft size={16} /> Back to chapters
            </button>
            <div className="chapter-detail-title">
              <span>{selectedChapterMeta.label}</span>
              <h2>{selectedChapterMeta.title}</h2>
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

            <button
              type="button"
              className="review-button"
              onClick={() => setShowReviewList((value) => !value)}
            >
              <Star size={15} /> Words to review{" "}
              <span>{reviewCards.length}</span>
            </button>
          </div>

          {showReviewList && (
            <div className="review-list-panel">
              {reviewCards.length ? (
                reviewCards.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    className="review-list-item"
                    onClick={() => {
                      const index = content.flashcards.findIndex(
                        (item) => String(item.id) === String(card.id),
                      );
                      if (index >= 0) {
                        setCardIndex(index);
                      }
                      setShowReviewList(false);
                      setFlipped(false);
                    }}
                  >
                    <span className="review-list-word">{card.english}</span>
                    <span className="review-list-meaning">
                      {card.vietnamese}
                    </span>
                  </button>
                ))
              ) : (
                <p className="review-empty">No words marked for review yet.</p>
              )}
            </div>
          )}

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
                <div
                  className={`flashcard ${flipped ? "flipped" : ""}`}
                  onClick={() => setFlipped((v) => !v)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setFlipped((v) => !v);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Flip flashcard"
                >
                  <button
                    type="button"
                    className={`review-star ${reviewedWords.has(String(activeCard.id)) ? "active" : ""}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleReviewWord(activeCard.id);
                    }}
                    aria-label="Mark word for review"
                    title="Mark for review"
                  >
                    <Star size={16} fill="currentColor" />
                  </button>
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
                </div>

                <div className="flash-controls">
                  <button
                    className="secondary-button"
                    onClick={() => nextCard(-1)}
                  >
                    ← Previous
                  </button>
                  <button
                    className="primary-button"
                    onClick={() => nextCard(1)}
                  >
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
        </>
      ) : (
        <div className="empty-chapter-panel">
          No flashcards available yet for this chapter.
        </div>
      )}
    </section>
  );
}
