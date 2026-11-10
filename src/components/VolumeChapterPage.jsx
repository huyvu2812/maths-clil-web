import React from "react";
import { VOLUMES } from "../constants/chapterMeta";

export default function VolumeChapterPage({
  eyebrow,
  title,
  description,
  onOpenChapter,
  chapterContent,
}) {
  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h1 dangerouslySetInnerHTML={{ __html: title }} />
          <p>{description}</p>
        </div>
      </div>

      <div className="volume-chapters-grid">
        {VOLUMES.map((volume) => {
          const chapters = chapterContent ?? volume.chapters;

          return (
            <div className="volume-chapter-column" key={volume.id}>
              <div className="chapter-volume-wrap">
                <div className="volume-pill">{volume.label}</div>
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
            </div>
          );
        })}
      </div>
    </section>
  );
}
