import React from "react";
import { ArrowRight, Calculator } from "lucide-react";

export default function TermsPage({ lessons, onOpenLesson }) {
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
        <div className="heading-sticker">
          x + y <span>✳</span>
        </div>
      </div>

      <div className="lesson-picker-grid">
        <button
          type="button"
          className="lesson-card"
          onClick={() => onOpenLesson("all")}
        >
          <span className="resource-number">00</span>
          <span className="resource-chapter">ALL LESSONS</span>
          <strong>All terms</strong>
          <span className="resource-link">
            Browse all <ArrowRight size={15} />
          </span>
        </button>

        {lessons.map((item, index) => (
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
    </section>
  );
}
