import React, { useMemo } from "react";
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import content from "../data/content.json";
import VolumeChapterPage from "../components/VolumeChapterPage";
import { getChapterById } from "../constants/chapterMeta";

function getWorksheetPath(lesson) {
  const lessonNumber = /^lesson\s*(\d+)/i.exec(lesson)?.[1];
  return `/worksheet.html?lesson=${lessonNumber ? `lesson-${lessonNumber}` : "review"}`;
}

export function WorksheetsChapterPage({ chapterId, onBack }) {
  const chapter = getChapterById(chapterId);
  const resources = useMemo(
    () => (chapterId === "chapter-1" ? content.worksheets : []),
    [chapterId],
  );

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <ClipboardList size={14} /> PRACTISE & APPLY
          </div>
          <h1>
            Your learning <em>toolkit.</em>
          </h1>
          <p>
            Choose a lesson and complete its interactive worksheet on this site.
          </p>
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

      {resources.length ? (
        <>
          <div className="resource-intro">
            <div className="resource-icon">
              <BookOpen size={24} />
            </div>
            <div>
              <strong>Maths CLIL worksheets</strong>
              <p>
                Complete each worksheet here. Your answers are saved in this
                browser.
              </p>
            </div>
            <span className="resource-total">{resources.length} resources</span>
          </div>

          <div className="resource-grid">
            {resources.map((w, i) => (
              <a
                key={`${w.lesson}-${i}`}
                className="resource-card"
                href={getWorksheetPath(w.lesson)}
              >
                <div className="resource-card-top">
                  <span className="resource-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="resource-open">
                    <ClipboardList size={16} />
                  </span>
                </div>
                <span className="resource-chapter">{w.chapter}</span>
                <strong>{w.lesson}</strong>
                <span className="resource-link">
                  Start worksheet <ArrowRight size={15} />
                </span>
              </a>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-chapter-panel">
          No worksheets available yet for this chapter.
        </div>
      )}
    </section>
  );
}

export default function WorksheetsPage({ onOpenChapter }) {
  return (
    <VolumeChapterPage
      eyebrow={
        <>
          <ClipboardList size={14} /> PRACTISE & APPLY
        </>
      }
      title="Your learning <em>toolkit.</em>"
      description="Choose a chapter to explore interactive maths worksheets."
      volumeId="volume-1"
      onOpenChapter={onOpenChapter}
    />
  );
}
