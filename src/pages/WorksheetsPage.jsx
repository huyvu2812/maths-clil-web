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
import chapterIReviewPdf from "./worksheet/Chapter_I_Worksheets/Chapter_I/Chapter_I_Review.pdf?url";
import lesson01SetsPdf from "./worksheet/Chapter_I_Worksheets/Chapter_I/Lesson_01_Sets.pdf?url";
import lesson02NaturalNumbersPdf from "./worksheet/Chapter_I_Worksheets/Chapter_I/Lesson_02_Writing_Natural_Numbers.pdf?url";
import lesson03OrderPdf from "./worksheet/Chapter_I_Worksheets/Chapter_I/Lesson_03_Order_in_the_Set_of_Natural_Numbers.pdf?url";
import lesson04AdditionPdf from "./worksheet/Chapter_I_Worksheets/Chapter_I/Lesson_04_Addition_and_Subtraction.pdf?url";
import lesson05MultiplicationPdf from "./worksheet/Chapter_I_Worksheets/Chapter_I/Lesson_05_Multiplication_and_Division.pdf?url";
import lesson06PowersPdf from "./worksheet/Chapter_I_Worksheets/Chapter_I/Lesson_06_Powers_with_Natural_Exponents.pdf?url";
import lesson07OperationsPdf from "./worksheet/Chapter_I_Worksheets/Chapter_I/Lesson_07_Order_of_Operations.pdf?url";

const CHAPTER_WORKSHEET_PDFS = {
  ...import.meta.glob("./worksheet/Chapter_II_Worksheets/Chapter_II/*.pdf", {
    eager: true,
    query: "?url",
    import: "default",
  }),
  ...import.meta.glob("./worksheet/Chapter_III_Worksheets/Chapter_III/*.pdf", {
    eager: true,
    query: "?url",
    import: "default",
  }),
  ...import.meta.glob("./worksheet/Chapter_IV_Worksheets/Chapter_IV/*.pdf", {
    eager: true,
    query: "?url",
    import: "default",
  }),
  ...import.meta.glob("./worksheet/Chapter_V_Worksheets/Chapter_V/*.pdf", {
    eager: true,
    query: "?url",
    import: "default",
  }),
};

const WORKSHEET_CHAPTER_ROMANS = {
  "chapter-2": "II",
  "chapter-3": "III",
  "chapter-4": "IV",
  "chapter-5": "V",
};

const CHAPTER_1_PRINTABLE_PDFS = {
  "lesson-1": lesson01SetsPdf,
  "lesson-2": lesson02NaturalNumbersPdf,
  "lesson-3": lesson03OrderPdf,
  "lesson-4": lesson04AdditionPdf,
  "lesson-5": lesson05MultiplicationPdf,
  "lesson-6": lesson06PowersPdf,
  "lesson-7": lesson07OperationsPdf,
  review: chapterIReviewPdf,
};

function getWorksheetPath(worksheet) {
  const lessonNumber = /^lesson\s*(\d+)/i.exec(worksheet.lesson)?.[1];
  const worksheetId =
    worksheet.worksheetId || (lessonNumber ? `lesson-${lessonNumber}` : "review");
  const query = new URLSearchParams({ lesson: worksheetId });
  const pdfUrl = worksheet.pdfUrl || CHAPTER_1_PRINTABLE_PDFS[worksheetId];
  if (pdfUrl) query.set("pdf", pdfUrl);
  return `/worksheet.html?${query.toString()}`;
}

function getChapterWorksheetResources(chapter) {
  const roman = WORKSHEET_CHAPTER_ROMANS[chapter.id];
  if (!roman) return [];

  const directory = `./worksheet/Chapter_${roman}_Worksheets/Chapter_${roman}/`;
  return Object.entries(CHAPTER_WORKSHEET_PDFS)
    .filter(([path]) => path.startsWith(directory))
    .map(([path, url]) => {
      const filename = path
        .slice(path.lastIndexOf("/") + 1)
        .replace(/\.pdf$/i, "");
      const lessonMatch = /^Lesson_(\d+)_(.+)$/.exec(filename);
      if (lessonMatch) {
        return {
          chapter: chapter.label.replace(/:$/, ""),
          lesson: `Lesson ${Number(lessonMatch[1])}: ${lessonMatch[2].replace(/_/g, " ")}`,
          worksheetId: `lesson-${Number(lessonMatch[1])}`,
          pdfUrl: url,
          isInteractive: true,
        };
      }

      if (filename === `Chapter_${roman}_Review`) {
        return {
          chapter: chapter.label.replace(/:$/, ""),
          lesson: `${chapter.label.replace(/:$/, "")} Review`,
          worksheetId: `${chapter.id}-review`,
          pdfUrl: url,
          isReview: true,
          isInteractive: true,
        };
      }

      return null;
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (a.isReview) return 1;
      if (b.isReview) return -1;
      return Number(/\d+/.exec(a.lesson)?.[0]) - Number(/\d+/.exec(b.lesson)?.[0]);
    });
}

export function WorksheetsChapterPage({ chapterId, onBack }) {
  const chapter = getChapterById(chapterId);
  const resources = useMemo(
    () =>
      chapterId === "chapter-1"
        ? content.worksheets.map((worksheet) => ({
            ...worksheet,
            isInteractive: true,
          }))
        : getChapterWorksheetResources(chapter),
    [chapter, chapterId],
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
                browser. Use Print / Save as PDF inside the worksheet to open
                the original.
              </p>
            </div>
            <span className="resource-total">{resources.length} resources</span>
          </div>

          <div className="resource-grid">
            {resources.map((w, i) => (
              <a
                key={`${w.lesson}-${i}`}
                className="resource-card"
                href={getWorksheetPath(w)}
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
