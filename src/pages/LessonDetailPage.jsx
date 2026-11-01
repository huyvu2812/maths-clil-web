import React, { useMemo } from "react";
import {
  Calculator,
  Search,
  ChevronDown,
  Volume2,
  ArrowLeft,
} from "lucide-react";
import content from "../data/content.json";
import EmptyState from "../components/EmptyState";

export default function LessonDetailPage({
  lesson,
  lessons,
  search,
  setSearch,
  onBack,
  onLessonChange,
}) {
  const filteredTerms = useMemo(() => {
    return content.terms.filter((t) => {
      const text =
        `${t.english} ${t.vietnamese} ${t.example} ${t.ipa} ${t.lesson}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesLesson = lesson === "all" || t.lesson === lesson;
      return matchesSearch && matchesLesson;
    });
  }, [search, lesson]);

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
    </section>
  );
}
