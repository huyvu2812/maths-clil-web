import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Layers3,
  Search,
  ArrowRight,
  Volume2,
  Star,
  ArrowUpDown,
  ListChecks,
} from "lucide-react";
import content from "../data/content.json";
import volume2Terms from "../data/volume2Terms.json";
import EmptyState from "../components/EmptyState";
import FeedbackForm from "../components/FeedbackForm";
import VolumeChapterPage from "../components/VolumeChapterPage";
import FillTheGap from "../components/FillTheGap";
import { getChapterById } from "../constants/chapterMeta";

const REVIEW_KEY = "maths-clil-review-words";
const STUDY_MODES = {
  FLASHCARD: "flashcard",
  MULTIPLE_CHOICE: "multiple-choice",
  ACTIVE_RECALL: "active-recall",
  FILL_THE_GAP: "fill-the-gap",
};
const CHAPTER_CODE_BY_ID = {
  "chapter-1": "MATH6_U1_C1",
  "chapter-2": "MATH6_U1_C2",
  "chapter-3": "MATH6_U1_C3",
  "chapter-4": "MATH6_U1_C4",
  "chapter-5": "MATH6_U1_C5",
  "chapter-6": "MATH6_U2_C6",
  "chapter-7": "MATH6_U2_C7",
  "chapter-8": "MATH6_U2_C8",
  "chapter-9": "MATH6_U2_C9",
};
const VOLUME_2_LESSON_RANGES = [
  { chapterCode: "MATH6_U2_C6", start: 23, end: 27 },
  { chapterCode: "MATH6_U2_C7", start: 28, end: 31 },
  { chapterCode: "MATH6_U2_C8", start: 32, end: 37 },
  { chapterCode: "MATH6_U2_C9", start: 38, end: 43 },
];
const volume2Flashcards = volume2Terms.map((term) => {
  const lessonNumber = Number(term.lesson.match(/^Lesson (\d+):/)?.[1]);
  const chapter = VOLUME_2_LESSON_RANGES.find(
    ({ start, end }) => lessonNumber >= start && lessonNumber <= end,
  );
  if (!chapter) {
    throw new Error(`No flashcard chapter found for ${term.lesson}.`);
  }
  return { ...term, chapterCode: chapter.chapterCode };
});
const flashcards = [...content.flashcards, ...volume2Flashcards];
const volume1ChapterIds = ["chapter-1", "chapter-2", "chapter-3", "chapter-4", "chapter-5"];

function shuffleArray(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export default function FlashcardsPage() {
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [search, setSearch] = useState("");
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [flipDirection, setFlipDirection] = useState("eng-to-vie");
  const [showReviewList, setShowReviewList] = useState(false);
  const [studyMode, setStudyMode] = useState(STUDY_MODES.FLASHCARD);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [activeRecallInput, setActiveRecallInput] = useState("");
  const [activeRecallStatus, setActiveRecallStatus] = useState("idle");
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

  useEffect(() => {
    setSelectedAnswer(null);
    setIsAnswerRevealed(false);
    setActiveRecallInput("");
    setActiveRecallStatus("idle");
  }, [cardIndex, studyMode]);

  const chapterCards = useMemo(
    () =>
      flashcards.filter(
        (card) => card.chapterCode === CHAPTER_CODE_BY_ID[selectedChapter],
      ),
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
    () => chapterCards.filter((card) => reviewedWords.has(String(card.id))),
    [chapterCards, reviewedWords],
  );

  const studyCards = useMemo(
    () =>
      studyMode === STUDY_MODES.MULTIPLE_CHOICE && reviewCards.length
        ? filteredCards.filter((card) => reviewedWords.has(String(card.id)))
        : filteredCards,
    [filteredCards, reviewedWords, reviewCards.length, studyMode],
  );

  const activeCard = studyCards.length
    ? studyCards[cardIndex % studyCards.length]
    : null;

  const multipleChoiceOptions = useMemo(() => {
    if (!activeCard) return [];

    const correctAnswer = activeCard.vietnamese;
    const distractors = flashcards
      .filter(
        (card) =>
          String(card.id) !== String(activeCard.id) &&
          card.vietnamese !== correctAnswer,
      )
      .map((card) => card.vietnamese)
      .filter(Boolean);

    const options = [correctAnswer];
    for (const option of shuffleArray(distractors)) {
      if (options.length >= 4) break;
      if (!options.includes(option)) {
        options.push(option);
      }
    }

    while (options.length < 4) {
      const fallback = flashcards.find(
        (card) => !options.includes(card.vietnamese),
      );
      if (!fallback) break;
      options.push(fallback.vietnamese);
    }

    return shuffleArray(options).slice(0, 4);
  }, [activeCard]);

  function nextCard(direction) {
    if (!studyCards.length) return;
    setCardIndex(
      (i) => (i + direction + studyCards.length) % studyCards.length,
    );
    setFlipped(false);
    setActiveRecallInput("");
    setActiveRecallStatus("idle");
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
    setStudyMode(STUDY_MODES.FLASHCARD);
  }

  function toggleFlipDirection() {
    setFlipDirection((current) =>
      current === "eng-to-vie" ? "vie-to-eng" : "eng-to-vie",
    );
    setFlipped(false);
  }

  const selectedChapterMeta = selectedChapter
    ? getChapterById(selectedChapter)
    : null;

  const frontLabel =
    flipDirection === "eng-to-vie" ? "ENGLISH TERM" : "VIETNAMESE TERM";
  const backLabel =
    flipDirection === "eng-to-vie" ? "VIETNAMESE" : "ENGLISH TERM";
  const displayFront =
    flipDirection === "eng-to-vie"
      ? activeCard?.english
      : activeCard?.vietnamese;
  const displayBack =
    flipDirection === "eng-to-vie"
      ? activeCard?.vietnamese
      : activeCard?.english;

  const modeOptions = [
    { id: STUDY_MODES.FLASHCARD, label: "Flashcard", icon: Layers3 },
    {
      id: STUDY_MODES.MULTIPLE_CHOICE,
      label: "Multiple choice",
      icon: Layers3,
    },
    { id: STUDY_MODES.ACTIVE_RECALL, label: "Active recall", icon: Star },
    ...(volume1ChapterIds.includes(selectedChapter)
      ? [{ id: STUDY_MODES.FILL_THE_GAP, label: "Fill the gap", icon: ListChecks }]
      : []),
  ];

  const progressValue = filteredCards.length
    ? ((cardIndex + 1) / filteredCards.length) * 100
    : 0;

  function handleActiveRecallCheck() {
    if (!activeCard) return;

    const trimmed = activeRecallInput.trim();
    if (!trimmed) {
      setActiveRecallStatus("empty");
      return;
    }

    const normalizedUser = trimmed.toLowerCase().replace(/\s+/g, " ");
    const normalizedAnswer = activeCard.english
      .toLowerCase()
      .replace(/\s+/g, " ");

    if (normalizedUser === normalizedAnswer) {
      setActiveRecallStatus("correct");
      window.setTimeout(() => {
        nextCard(1);
      }, 450);
      return;
    }

    setActiveRecallStatus("incorrect");
  }

  function handleActiveRecallSkip() {
    if (!activeCard) return;

    setActiveRecallInput(activeCard.english);
    setActiveRecallStatus("revealed");
  }

  const activeRecallView = activeCard ? (
    <div className="active-recall-screen">
      <div className="active-recall-card">
        <div className="active-recall-header">Fill in the English word</div>
        <div className="active-recall-word">{activeCard.vietnamese}</div>

        <div
          className={`active-recall-input-wrap ${
            activeRecallStatus === "incorrect" ? "error" : ""
          } ${activeRecallStatus === "revealed" ? "revealed" : ""}`}
        >
          <input
            type="text"
            value={activeRecallInput}
            onChange={(event) => {
              setActiveRecallInput(event.target.value);
              if (activeRecallStatus !== "idle") {
                setActiveRecallStatus("idle");
              }
            }}
            className="active-recall-input"
            placeholder="Type the English term"
            aria-label="Type the English term"
          />
        </div>

        {activeRecallStatus === "incorrect" && (
          <div className="active-recall-feedback error">
            Incorrect — the correct answer is{" "}
            <strong>{activeCard.english}</strong>
          </div>
        )}

        {activeRecallStatus === "revealed" && (
          <div className="active-recall-feedback revealed">
            Correct answer: <strong>{activeCard.english}</strong>
          </div>
        )}

        <div className="active-recall-actions">
          <button
            type="button"
            className="primary-button active-check-button"
            onClick={handleActiveRecallCheck}
          >
            Check
          </button>
          <button
            type="button"
            className="secondary-button active-skip-button"
            onClick={handleActiveRecallSkip}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  ) : (
    <EmptyState text="No flashcards found. Try another search." />
  );

  const flashcardView = activeCard ? (
    <div className="flashcard-layout">
      <div className="flashcard-column">
        <div className="flashcard-progress">
          <strong>
            {cardIndex + 1}/{filteredCards.length}
          </strong>
          <div
            className="flashcard-progress-track"
            role="progressbar"
            aria-label="Flashcard progress"
            aria-valuemin={0}
            aria-valuemax={filteredCards.length}
            aria-valuenow={cardIndex + 1}
          >
            <span style={{ width: `${progressValue}%` }} />
          </div>
        </div>
        <div
          className={`flashcard ${flipped ? "flipped" : ""} ${flipDirection === "vie-to-eng" ? "reverse" : ""}`}
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
          <div className="flashcard-inner">
            <div className="flashcard-face flashcard-front">
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
              <button
                type="button"
                className="card-corner"
                onClick={(event) => {
                  event.stopPropagation();
                  speak(activeCard.english);
                }}
                aria-label="Listen to pronunciation"
                title="Listen to pronunciation"
              >
                <Volume2 size={15} />
              </button>
              <span className="flashcard-label">{frontLabel}</span>
              <strong>{displayFront}</strong>
              <span className="flip-hint">
                Flip the card to see Vietnamese and example
              </span>
            </div>

            <div className="flashcard-face flashcard-back">
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
              <button
                type="button"
                className="card-corner"
                onClick={(event) => {
                  event.stopPropagation();
                  speak(activeCard.english);
                }}
                aria-label="Listen to pronunciation"
                title="Listen to pronunciation"
              >
                <Volume2 size={15} />
              </button>
              <span className="flashcard-label">{backLabel}</span>
              <strong>{displayBack}</strong>
              {activeCard.example && (
                <span className="flash-example">{activeCard.example}</span>
              )}
              <span className="flip-hint">
                Flip the card to see the English term
              </span>
            </div>
          </div>
        </div>

        <div className="flash-controls">
          <button
            type="button"
            className="secondary-button"
            onClick={() => nextCard(-1)}
            aria-label="Previous flashcard"
          >
            <ArrowLeft size={34} />
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={() => nextCard(1)}
            aria-label="Next flashcard"
          >
            <ArrowRight size={34} />
          </button>
        </div>
      </div>
    </div>
  ) : (
    <EmptyState text="No flashcards found. Try another search." />
  );

  const searchTools = (
    <>
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
          {search && (
            <button
              type="button"
              className="clear-search-button"
              aria-label="Clear search"
              onClick={() => {
                setSearch("");
                setCardIndex(0);
                setFlipped(false);
                setShowReviewList(false);
              }}
            >
              ×
            </button>
          )}
        </div>

        <div className="toolbar-actions">
          {studyMode === STUDY_MODES.FLASHCARD && (
            <button
              type="button"
              className="flip-direction-button"
              onClick={toggleFlipDirection}
              aria-label="Reverse card direction"
              title="Reverse card direction"
            >
              <ArrowUpDown size={16} />
            </button>
          )}

          <button
            type="button"
            className="review-button"
            onClick={() => setShowReviewList((value) => !value)}
          >
            <Star size={15} /> Words to review{" "}
            <span>{reviewCards.length}</span>
          </button>
        </div>
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
                  const index = chapterCards.findIndex(
                    (item) => String(item.id) === String(card.id),
                  );
                  if (index >= 0) {
                    setCardIndex(index);
                  }
                  setSearch("");
                  setShowReviewList(false);
                  setFlipped(false);
                }}
              >
                <span className="review-list-word">{card.english}</span>
                <span className="review-list-meaning">{card.vietnamese}</span>
              </button>
            ))
          ) : (
            <p className="review-empty">No words marked for review yet.</p>
          )}
        </div>
      )}
    </>
  );

  const multipleChoiceView = activeCard ? (
    <div className="multiple-choice-screen">
      <div className="multiple-choice-card">
        <div className="multiple-choice-header">CHOOSE THE CORRECT MEANING</div>
        <div className="multiple-choice-word">{activeCard.english}</div>

        <div className="multiple-choice-grid">
          {multipleChoiceOptions.map((option, index) => {
            const isCorrect = option === activeCard.vietnamese;
            const isSelected = selectedAnswer === option;
            const statusClass =
              isAnswerRevealed && isCorrect
                ? "correct"
                : isAnswerRevealed && isSelected && !isCorrect
                  ? "incorrect"
                  : "";

            return (
              <button
                key={`${option}-${index}`}
                type="button"
                className={`multiple-choice-option ${statusClass}`}
                onClick={() => {
                  const nextAnswer = option;
                  setSelectedAnswer(nextAnswer);
                  setIsAnswerRevealed(true);

                  if (nextAnswer === activeCard.vietnamese) {
                    window.setTimeout(() => {
                      setSelectedAnswer(null);
                      setIsAnswerRevealed(false);
                      nextCard(1);
                    }, 550);
                  }
                }}
              >
                <span className="choice-number">
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="multiple-choice-nav">
        <button className="secondary-button" onClick={() => nextCard(-1)}>
          <ArrowLeft size={18} />
        </button>
        <button className="primary-button" onClick={() => nextCard(1)}>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  ) : (
    <EmptyState text="No flashcards found. Try another search." />
  );

  return (
    <>
      {!selectedChapter ? (
        <VolumeChapterPage
          eyebrow={
            <>
              <Layers3 size={14} /> ACTIVE RECALL
            </>
          }
          title="Flip it. <em>Learn it.</em>"
          description="Practise key maths vocabulary with your flashcard deck."
          volumeId="volume-1"
          onOpenChapter={handleSelectChapter}
        />
      ) : Object.prototype.hasOwnProperty.call(
          CHAPTER_CODE_BY_ID,
          selectedChapter,
        ) ? (
        <section
          className={`page-section flashcards-page-shell ${studyMode === STUDY_MODES.FLASHCARD ? "flashcard-mode" : ""}`}
        >
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

          <div className="study-mode-switch" aria-label="Study mode selector">
            {modeOptions.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={`mode-toggle-button ${studyMode === id ? "active" : ""}`}
                onClick={() => setStudyMode(id)}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {studyMode === STUDY_MODES.FLASHCARD ? (
            <>
              {searchTools}
              {flashcardView}
            </>
          ) : studyMode === STUDY_MODES.ACTIVE_RECALL ? (
            <>
              {searchTools}
              {activeRecallView}
            </>
          ) : studyMode === STUDY_MODES.FILL_THE_GAP ? (
            <FillTheGap chapterId={selectedChapter} />
          ) : (
            multipleChoiceView
          )}

          <FeedbackForm />
        </section>
      ) : (
        <section className="page-section flashcards-page-shell">
          <div className="empty-chapter-panel">
            No flashcards available yet for this chapter.
          </div>
        </section>
      )}
    </>
  );
}
