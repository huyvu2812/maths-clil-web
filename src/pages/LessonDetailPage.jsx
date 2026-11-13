import React, { useMemo } from "react";
import {
  Calculator,
  Search,
  ChevronDown,
  Volume2,
  ArrowLeft,
} from "lucide-react";
import EmptyState from "../components/EmptyState";

const REAL_LIFE_RESOURCES = {
  1: {
    image: "/images/lesson-1-market-preview.png",
    alt: "A father and child exploring a lively market",
    previewHref: "/presentation-preview.html",
  },
  2: {
    image: "/images/lesson-2-real-life-preview.png",
    alt: "Children exploring number 258 at a museum",
    previewHref: "/presentation-preview.html?lesson=2",
  },
  3: {
    image: "/images/lesson-3-real-life-preview.png",
    alt: "Children identifying numbers on amusement park seats",
    previewHref: "/presentation-preview.html?lesson=3",
  },
  4: {
    image: "/images/lesson-4-real-life-preview.png",
    alt: "A family choosing food at a bakery",
    previewHref: "/presentation-preview.html?lesson=4",
  },
  5: {
    image: "/images/lesson-5-real-life-preview.png",
    alt: "Children arranging books and snacks",
    previewHref: "/presentation-preview.html?lesson=5",
  },
};

export default function LessonDetailPage({
  terms,
  lesson,
  lessons,
  search,
  setSearch,
  onBack,
  onLessonChange,
}) {
  const filteredTerms = useMemo(() => {
    return terms.filter((t) => {
      const text =
        `${t.english} ${t.vietnamese} ${t.example} ${t.ipa} ${t.lesson}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesLesson = lesson === "all" || t.lesson === lesson;
      return matchesSearch && matchesLesson;
    });
  }, [search, lesson, terms]);
  const lessonNumber = Number(/^Lesson\s+(\d+)/.exec(lesson)?.[1]);
  const realLifeResource = REAL_LIFE_RESOURCES[lessonNumber];

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
            <Calculator size={14} /> YOUR MATHS GLOSSARY
          </div>
          <h1>{lesson === "all" ? "Maths terms" : lesson}</h1>
          <p>Build your mathematical vocabulary in English and Vietnamese.</p>
        </div>
        <button className="secondary-button" onClick={onBack}>
          <ArrowLeft size={16} /> Back to lessons
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search a term, translation or example..."
          />
          {search && (
            <button
              type="button"
              className="clear-search-button"
              aria-label="Clear search"
              onClick={() => setSearch("")}
            >
              ×
            </button>
          )}
        </div>
        <label className="select-wrap">
          <span>Lesson</span>
          <select
            value={lesson}
            onChange={(e) => onLessonChange(e.target.value)}
          >
            <option value="all">All lessons</option>
            {lessons.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <ChevronDown size={15} />
        </label>
      </div>

      <div className="results-line">
        <span>
          <strong>{filteredTerms.length}</strong> terms found
        </span>
        <span>English ↔ Vietnamese</span>
      </div>

      <div className="terms-table-wrap">
        <table className="terms-table">
          <thead>
            <tr>
              <th>ENGLISH TERM</th>
              <th>VIETNAMESE</th>
              <th>EXAMPLE</th>
              <th>IPA</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredTerms.map((t, i) => (
              <tr key={`${t.id}-${i}`}>
                <td>
                  <div className="term-en">{t.english || "—"}</div>
                  <div className="term-lesson">{t.lesson}</div>
                </td>
                <td className="term-vi">{t.vietnamese || "—"}</td>
                <td className="term-example">{t.example || "—"}</td>
                <td className="term-ipa">{t.ipa || "—"}</td>
                <td>
                  <button
                    className="icon-button"
                    title="Hear English pronunciation"
                    onClick={() => speak(t.english)}
                  >
                    <Volume2 size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filteredTerms.length && (
          <EmptyState text="No terms match your search. Try another keyword." />
        )}
      </div>

      {realLifeResource && (
        <section
          className="real-life-resource"
          aria-labelledby={`real-life-title-${lessonNumber}`}
        >
          <div className="real-life-resource-preview">
            <h2 id={`real-life-title-${lessonNumber}`}>Real-life Maths</h2>
            <img src={realLifeResource.image} alt={realLifeResource.alt} />
            {realLifeResource.previewHref ? (
              <a
                className="real-life-download"
                href={realLifeResource.previewHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Preview the Real-life Maths PowerPoint presentation for Lesson ${lessonNumber}`}
              >
                PREVIEW NOW
              </a>
            ) : (
              <button
                className="real-life-download"
                type="button"
                disabled
                aria-label={`Presentation preview for Lesson ${lessonNumber} coming soon`}
              >
                PREVIEW COMING SOON
              </button>
            )}
          </div>
          <div className="real-life-resource-description">
            <p>
              Bring Math to our life! Explore our ready-to-use PowerPoint
              slideshow designed to teach Mathematics through daily, real-world
              scenarios.
            </p>
            <ul>
              <li>Feel free to download and customize according to your preference</li>
              <li>Assist you as a source of lesson plans</li>
            </ul>
          </div>
        </section>
      )}
    </section>
  );
}
