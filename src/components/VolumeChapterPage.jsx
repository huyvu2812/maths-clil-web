import React from "react";
import { getVolumeById } from "../constants/chapterMeta";

export default function VolumeChapterPage({
  eyebrow,
  title,
  description,
  volumeId = "volume-1",
  onOpenChapter,
  chapterContent,
}) {
  const volume = getVolumeById(volumeId);
  const chapters = chapterContent ?? volume?.chapters ?? [];

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h1 dangerouslySetInnerHTML={{ __html: title }} />
          <p>{description}</p>
        </div>
      </div>

      <div className="chapter-volume-wrap">
        <div className="volume-pill">{volume?.label ?? "Volume 1"}</div>
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
