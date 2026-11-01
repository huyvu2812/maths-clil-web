import React, { useMemo } from "react";
import { ArrowLeft, ArrowRight, Calculator } from "lucide-react";
import VolumeChapterPage from "../components/VolumeChapterPage";
import { getChapterById } from "../constants/chapterMeta";

export function TermsChapterPage({ chapterId, lessons, onBack, onOpenLesson }) {
  const chapter = getChapterById(chapterId);
  const lessonList = useMemo(
    () => (chapterId === "chapter-1" ? lessons : []),
    [chapterId, lessons],
  );

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <Calculator size={14} /> YOUR MATHS GLOSSARY
          </div>
          <h1>
            Maths terms, <em>made clear.</em>
          </h1>
          <p>Build your mathematical vocabulary in English and Vietnamese.</p>
        </div>
      </div>

      <div className="chapter-detail-header">
        <button
          type="button"
          className="secondary-button back-button"
          onClick={onBack}
        >
          <ArrowLeft size={16} /> Back to chapters
        </button>
        <div className="chapter-detail-title">
          <span>{chapter.label}</span>
          <h2>{chapter.title}</h2>
        </div>
      </div>

      {lessonList.length ? (
        <div className="lesson-picker-grid chapter-lesson-grid">
          {lessonList.map((item, index) => (
            <button
              key={item}
              type="button"
              className="lesson-card"
              onClick={() => onOpenLesson(item)}
            >
              <span className="resource-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="resource-chapter">LESSON {index + 1}</span>
              <strong>{item}</strong>
              <span className="resource-link">
                Open lesson <ArrowRight size={15} />
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="empty-chapter-panel">
          No lessons available yet for this chapter.
        </div>
      )}
    </section>
  );
}

export default function TermsPage({ lessons, onOpenChapter }) {
  return (
    <VolumeChapterPage
      eyebrow={
        <>
          <Calculator size={14} /> YOUR MATHS GLOSSARY
        </>
      }
      title="Maths terms, <em>made clear.</em>"
      description="Build your mathematical vocabulary in English and Vietnamese."
      volumeId="volume-1"
      onOpenChapter={onOpenChapter}
    />
  );
}
