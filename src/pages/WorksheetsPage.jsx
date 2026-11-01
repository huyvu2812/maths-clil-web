import React from "react";
import {
  BookOpen,
  ClipboardList,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import content from "../data/content.json";

export default function WorksheetsPage() {
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
        <div className="heading-sticker sticker-blue">
          <BookOpen size={29} />
        </div>
      </div>

      <div className="resource-intro">
        <div className="resource-icon">
          <BookOpen size={24} />
        </div>
        <div>
          <strong>Maths CLIL worksheets</strong>
          <p>Resources are opened from their original Google Drive links.</p>
        </div>
        <span className="resource-total">
          {content.worksheets.length} resources
        </span>
      </div>

      <div className="resource-grid">
        {content.worksheets.map((w, i) => (
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
    </section>
  );
}
