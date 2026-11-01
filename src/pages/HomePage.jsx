import React from "react";
import { BookOpen, Calculator, Layers3, ArrowRight } from "lucide-react";
import content from "../data/content.json";

export default function HomePage({ navigate }) {
  const termCount = content.terms.length;
  const cardCount = content.flashcards.length;

  return (
    <section className="home-page hunt-homepage">
      <div className="hunt-hero">
        <div className="hunt-copy">
          <h1>Welcome to The Hunt</h1>
          <p className="hunt-quote">"Hunt the terms, grasp Mathematics"</p>
          <p className="hunt-sub">
            — assisting you with vivid CLIL Mathematics teaching materials.
          </p>
        </div>

        <div
          className="hunt-illustration"
          aria-label="Magnifying glass illustration"
        >
          <div className="idea-bulb">
            <span className="bulb-glow" />
          </div>
          <div className="lens-wrap">
            <div className="lens-ring" />
            <div className="lens-inner" />
          </div>
          <div className="magnifier-handle" />
        </div>
      </div>

      <div className="hunt-info-grid">
        <div className="info-panel">
          <div className="info-avatar">
            <span>👩‍🏫</span>
          </div>
          <p>
            The Hunt is a dedicated digital hub designed specifically for
            educators teaching Grade 6 Mathematics using the Content and
            Language Integrated Learning (CLIL) approach.
          </p>
        </div>

        <div className="info-panel info-panel-alt">
          <div className="info-icon">
            <BookOpen size={36} />
          </div>
          <p>
            Based on the Kết nối tri thức với cuộc sống curriculum (Volume 1),
            our platform provides you with practical, ready-to-use resources to
            make your bilingual lessons engaging and effective.
          </p>
        </div>
      </div>

      <div className="section-heading">
        <div>
          <div className="eyebrow">PICK YOUR PATH</div>
          <h2>
            Where will you <em>start?</em>
          </h2>
        </div>
        <span className="section-note">
          A little practice goes a long way <span>↘</span>
        </span>
      </div>

      <div className="feature-grid">
        <button
          className="feature-card feature-green"
          onClick={() => navigate("terms")}
        >
          <span className="feature-top">
            <span className="feature-icon">
              <Calculator size={22} />
            </span>
            <span className="feature-arrow">
              <ArrowRight size={18} />
            </span>
          </span>
          <span className="feature-tag">BUILD YOUR VOCABULARY</span>
          <strong>Maths terms</strong>
          <p>
            Discover key concepts in English and Vietnamese, with examples and
            pronunciation.
          </p>
          <span className="feature-bottom">
            Explore glossary <ArrowRight size={15} />
          </span>
          <span className="feature-doodle">∑</span>
        </button>

        <button
          className="feature-card feature-peach"
          onClick={() => navigate("flashcards")}
        >
          <span className="feature-top">
            <span className="feature-icon">
              <Layers3 size={22} />
            </span>
            <span className="feature-arrow">
              <ArrowRight size={18} />
            </span>
          </span>
          <span className="feature-tag">PRACTISE & REMEMBER</span>
          <strong>Flashcards</strong>
          <p>Flip each card, test your memory, and make new words stick.</p>
          <span className="feature-bottom">
            Start practising <ArrowRight size={15} />
          </span>
          <span className="feature-doodle">Aa</span>
        </button>

        <button
          className="feature-card feature-lilac"
          onClick={() => navigate("worksheets")}
        >
          <span className="feature-top">
            <span className="feature-icon">
              <BookOpen size={22} />
            </span>
            <span className="feature-arrow">
              <ArrowRight size={18} />
            </span>
          </span>
          <span className="feature-tag">TAKE IT FURTHER</span>
          <strong>Worksheets</strong>
          <p>Find lesson materials and continue learning beyond the screen.</p>
          <span className="feature-bottom">
            Browse resources <ArrowRight size={15} />
          </span>
          <span className="feature-doodle">✳</span>
        </button>
      </div>

      <div className="quote-banner">
        <span className="quote-mark">“</span>
        <p>
          Mathematics is not about numbers, equations, computations, or
          algorithms: it is about <em>understanding.</em>
        </p>
        <span className="quote-decoration">✳</span>
      </div>
    </section>
  );
}
