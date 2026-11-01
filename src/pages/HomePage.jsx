import React from "react";
import { BookOpen, Calculator, Layers3, ArrowRight } from "lucide-react";
import content from "../data/content.json";

export default function HomePage({ navigate }) {
  const termCount = content.terms.length;
  const cardCount = content.flashcards.length;

  return (
    <section className="home-page">
      <div className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" /> MATHS + LANGUAGE, TOGETHER
          </div>
          <h1>
            Understand the
            <br />
            <em>maths concept.</em>
          </h1>
          <p className="hero-description">
            A friendly learning space to explore maths vocabulary, practise with
            flashcards, and bring concepts to life in English.
          </p>
          <div className="hero-actions">
            <button
              className="primary-button"
              onClick={() => navigate("terms")}
            >
              Explore maths terms <ArrowRight size={17} />
            </button>
            <button
              className="secondary-button"
              onClick={() => navigate("flashcards")}
            >
              Try flashcards <Layers3 size={16} />
            </button>
          </div>
          <div className="hero-trust">
            <div className="mini-avatars">
              <span>A</span>
              <span>M</span>
              <span>+</span>
            </div>
            <span>Learn at your own pace</span>
            <span className="trust-star">✳</span>
          </div>
        </div>

        <div
          className="hero-illustration"
          aria-label="Abstract maths illustration"
        >
          <div className="blob blob-one" />
          <div className="blob blob-two" />
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="math-paper">
            <span className="paper-label">TODAY'S LITTLE REMINDER</span>
            <div className="paper-equation">
              x + <span>y</span> = <b>?</b>
            </div>
            <div className="paper-rule" />
            <div className="paper-bottom">
              <span>
                Keep asking
                <br />
                why.
              </span>
              <span className="paper-flower">✳</span>
            </div>
          </div>
          <span className="float-symbol symbol-plus">+</span>
          <span className="float-symbol symbol-pi">π</span>
          <span className="float-symbol symbol-star">✳</span>
          <span className="float-symbol symbol-circle">○</span>
          <span className="float-symbol symbol-triangle">△</span>
          <div className="hero-caption">
            <span className="caption-dot" /> Curious minds welcome
          </div>
        </div>

        <div className="hero-sticker">
          LEARN
          <br />
          BY DOING <span>↗</span>
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
