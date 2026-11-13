import React, { useMemo, useState } from "react";
import fillTheGapLessons from "../data/fillTheGapVolume1.json";

function normalizeAnswer(answer) {
  return answer.trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

export default function FillTheGap({ chapterId }) {
  const [lessonIndex, setLessonIndex] = useState(0);
  const [filledAnswers, setFilledAnswers] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const lessons = useMemo(
    () => fillTheGapLessons.filter((item) => item.chapterId === chapterId),
    [chapterId],
  );
  const lesson = lessons[lessonIndex];

  const gapAnswers = useMemo(
    () => lesson.exercises.flatMap((exercise) => exercise.answers),
    [lesson],
  );

  function placeWord(word, gapIndex) {
    if (!lesson.wordBank.includes(word)) return;

    setFilledAnswers((current) => {
      const next = [...current];
      const previousIndex = next.indexOf(word);
      if (previousIndex >= 0) next[previousIndex] = null;
      next[gapIndex] = word;
      return next;
    });
    setSelectedWord(null);
    setIsChecked(false);
  }

  function handleGapClick(gapIndex) {
    if (selectedWord) {
      placeWord(selectedWord, gapIndex);
      return;
    }

    if (filledAnswers[gapIndex]) {
      setFilledAnswers((current) => {
        const next = [...current];
        next[gapIndex] = null;
        return next;
      });
      setIsChecked(false);
    }
  }

  function handleNextLesson() {
    setLessonIndex((current) => (current + 1) % lessons.length);
    setFilledAnswers([]);
    setSelectedWord(null);
    setIsChecked(false);
  }

  let gapIndex = 0;

  return (
    <section className="fill-gap-screen" aria-label="Fill the gap exercise">
      <div className="fill-gap-heading">
        <div>
          <span className="fill-gap-eyebrow">
            Lesson {lesson.lessonNumber} · {lessonIndex + 1} of {lessons.length}
          </span>
          <h3>{lesson.title}</h3>
        </div>
        <label className="fill-gap-lesson-picker">
          <span>Choose lesson</span>
          <select
            value={lessonIndex}
            onChange={(event) => {
              setLessonIndex(Number(event.target.value));
              setFilledAnswers([]);
              setSelectedWord(null);
              setIsChecked(false);
            }}
          >
            {lessons.map((item, index) => (
              <option key={item.title} value={index}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="fill-gap-word-bank" aria-label="Word bank">
        <div className="fill-gap-bank-title">WORD BANK</div>
        <div className="fill-gap-word-list">
          {lesson.wordBank.map((word) => {
            const isUsed = filledAnswers.includes(word);
            return (
              <button
                key={word}
                type="button"
                className={`fill-gap-word ${isUsed ? "used" : ""} ${selectedWord === word ? "selected" : ""}`}
                draggable={!isUsed}
                aria-pressed={selectedWord === word}
                disabled={isUsed}
                onClick={() =>
                  setSelectedWord((current) => (current === word ? null : word))
                }
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", word);
                  event.dataTransfer.effectAllowed = "move";
                }}
              >
                {word}
              </button>
            );
          })}
        </div>
        <p className="fill-gap-hint">
          Drag a word into a blank, or select a word and tap a blank.
        </p>
      </div>

      <div className="fill-gap-exercise-card">
        <div className="fill-gap-instructions">
          Exercises: Fill in the blanks with the correct terms from the word
          bank.
        </div>
        <ol className="fill-gap-exercise-list">
          {lesson.exercises.map((exercise, exerciseIndex) => {
            let exerciseGapIndex = 0;
            return (
              <li key={`${lesson.title}-${exerciseIndex}`}>
                {exercise.text.split(/(_{3,})/g).map((part, partIndex) => {
                  if (!/^_{3,}$/.test(part)) {
                    return <React.Fragment key={partIndex}>{part}</React.Fragment>;
                  }

                  const currentGapIndex = gapIndex;
                  gapIndex += 1;
                  const answer = exercise.answers[exerciseGapIndex];
                  exerciseGapIndex += 1;
                  const value = filledAnswers[currentGapIndex];
                  const isCorrect =
                    value && normalizeAnswer(value) === normalizeAnswer(answer);
                  const statusClass = isChecked
                    ? isCorrect
                      ? "correct"
                      : "incorrect"
                    : "";

                  return (
                    <button
                      key={partIndex}
                      type="button"
                      className={`fill-gap-blank ${statusClass} ${value ? "filled" : ""}`}
                      aria-label={`Blank ${currentGapIndex + 1}${value ? `: ${value}` : ""}`}
                      onClick={() => handleGapClick(currentGapIndex)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        placeWord(
                          event.dataTransfer.getData("text/plain"),
                          currentGapIndex,
                        );
                      }}
                    >
                      {value || "____________"}
                    </button>
                  );
                })}
              </li>
            );
          })}
        </ol>
      </div>

      {isChecked && (
        <div className="fill-gap-answer-key" aria-live="polite">
          <strong>Correct answers</strong>
          <ol>
            {gapAnswers.map((answer, index) => (
              <li key={`${index}-${answer}`}>{answer}</li>
            ))}
          </ol>
        </div>
      )}

      <div className="fill-gap-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={() => setIsChecked(true)}
        >
          Check answers
        </button>
        <button
          type="button"
          className="primary-button"
          onClick={handleNextLesson}
        >
          Next lesson
        </button>
      </div>
    </section>
  );
}
