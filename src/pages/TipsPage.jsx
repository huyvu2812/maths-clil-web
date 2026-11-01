import React from "react";
import {
  Lightbulb,
  Sparkles,
  BookOpen,
  GraduationCap,
  ExternalLink,
} from "lucide-react";
import content from "../data/content.json";

export default function TipsPage() {
  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <Lightbulb size={14} /> FOR TEACHERS
          </div>
          <h1>
            Teach with <em>purpose.</em>
          </h1>
          <p>
            Ideas and practical guidance for bringing language and maths
            together.
          </p>
        </div>
        <div className="heading-sticker sticker-yellow">
          <Lightbulb size={29} />
        </div>
      </div>

      <div className="tips-feature">
        <div className="tips-art">
          <span className="sun">✳</span>
          <span className="art-letter">Aa</span>
          <span className="art-number">1, 2, 3</span>
          <span className="art-shape">△</span>
        </div>

        <div className="tips-copy">
          <div className="eyebrow">TEACHER RESOURCE</div>
          <h2>Classroom tips &amp; ideas</h2>
          <p>
            Open the teaching tips document connected to your materials
            spreadsheet. Use it as a starting point for planning engaging,
            language-rich maths lessons.
          </p>
          {content.teachingTipsUrl ? (
            <a
              className="primary-button link-button"
              href={content.teachingTipsUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open teaching tips <ExternalLink size={16} />
            </a>
          ) : (
            <span className="muted">
              No teaching tips link was found in the workbook.
            </span>
          )}
        </div>
      </div>

      <div className="tip-mini-grid">
        <div>
          <Sparkles size={20} />
          <strong>Make it visual</strong>
          <p>Pair new vocabulary with images, diagrams and worked examples.</p>
        </div>
        <div>
          <BookOpen size={20} />
          <strong>Use the language</strong>
          <p>Model maths terms in short, meaningful English sentences.</p>
        </div>
        <div>
          <GraduationCap size={20} />
          <strong>Check understanding</strong>
          <p>Invite learners to explain a concept in their own words.</p>
        </div>
      </div>
    </section>
  );
}
