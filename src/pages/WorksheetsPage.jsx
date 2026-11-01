import React, { useMemo } from "react";
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import content from "../data/content.json";

export function WorksheetsChapterPage({ chapterId, onBack }) {
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

  const chapter = chapters.find((item) => item.id === chapterId) || chapters[0];
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
            Open the worksheets and lesson resources linked in your workbook.
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
                Resources are opened from their original Google Drive links.
              </p>
            </div>
            <span className="resource-total">{resources.length} resources</span>
          </div>

          <div className="resource-grid">
            {resources.map((w, i) => (
              <a
                key={`${w.lesson}-${i}`}
                className="resource-card"
                href={w.url || "#"}
                target="_blank"
                rel="noreferrer"
              >
                <div className="resource-card-top">
                  <span className="resource-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="resource-open">
                    <ExternalLink size={16} />
                  </span>
                </div>
                <span className="resource-chapter">{w.chapter}</span>
                <strong>{w.lesson}</strong>
                <span className="resource-link">
                  Open resource <ArrowRight size={15} />
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
            Open the worksheets and lesson resources linked in your workbook.
          </p>
        </div>
      </div>

      <div className="chapter-volume-wrap">
        <div className="volume-pill">Volume 1</div>
      </div>

      <div className="chapter-selector-grid">
        {chapters.map((chapter) => (
          <button
            key={chapter.id}
            type="button"
            className="chapter-choice"
            onClick={() => onOpenChapter(chapter.id)}
          >
            <span className="chapter-label">{chapter.label}</span>
            <span className="chapter-title">{chapter.title}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
