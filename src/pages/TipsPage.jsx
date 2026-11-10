import React from "react";
import { ArrowLeft, Lightbulb } from "lucide-react";
import teachingTips from "../data/teachingTips";

export default function TipsPage({ onOpenTip }) {
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
      </div>

      <div className="teaching-tip-grid">
        {teachingTips.map((tip) => (
          <button
            key={tip.id}
            type="button"
            className="teaching-tip-card"
            onClick={() => onOpenTip(tip.id)}
          >
            <img src={tip.image} alt={tip.imageAlt} />
            <span className="teaching-tip-card-title">{tip.title}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function TeachingTipDetailPage({ tipId, onBack }) {
  const tip = teachingTips.find((item) => item.id === tipId);

  if (!tip) {
    return null;
  }

  return (
    <section className="page-section">
      <button
        type="button"
        className="secondary-button back-button teaching-tip-back"
        onClick={onBack}
      >
        <ArrowLeft size={16} /> Quay lại Teaching Tips
      </button>

      <article
        className="teaching-tip-details"
        aria-labelledby={`teaching-tip-title-${tip.id}`}
      >
        <img
          className="teaching-tip-detail-image"
          src={tip.image}
          alt={tip.imageAlt}
        />
        <div className="teaching-tip-detail-content">
          <div className="eyebrow">TEACHING TIP</div>
          <h1 id={`teaching-tip-title-${tip.id}`}>{tip.title}</h1>
          <div className="teaching-tip-copy">
            {tip.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}

            {tip.items.length > 0 && (
              <>
                {tip.itemsHeading && <h2>{tip.itemsHeading}</h2>}
                <ul>
                  {tip.items.map((item) => (
                    <li key={item.title}>
                      <strong>{item.title}:</strong> {item.text}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {tip.closing && <p>{tip.closing}</p>}
          </div>
        </div>
      </article>
    </section>
  );
}
