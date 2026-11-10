import React from "react";
import {
  BookOpen,
  Layers3,
  ArrowRight,
  UserRound,
  NotebookPen,
  PencilRuler,
  Star,
  UsersRound,
} from "lucide-react";

export default function HomePage({ navigate }) {
  return (
    <section className="home-page hunt-homepage">
      <div className="hunt-hero">
        <div className="hunt-copy">
          <h1>Welcome to The Hunt</h1>
          <p className="hunt-quote">"Hunt the terms, grasp Mathematics"</p>
          <p className="hunt-sub">
            — assisting you with Mathematics teaching materials.
          </p>
        </div>

        <img
          className="hunt-illustration-image"
          src="/Home-search-logo.svg"
          alt="Home search logo"
          aria-label="Home search logo"
        />
      </div>

      <div className="hunt-info-grid">
        <div className="info-panel">
          <div className="info-avatar">
            <UserRound size={28} strokeWidth={2.2} />
          </div>
          <p>
            The Hunt is a dedicated digital hub designed specifically for
            educators teaching Secondary school Mathematics in English.
          </p>
        </div>

        <div className="info-panel info-panel-alt">
          <div className="info-icon">
            <BookOpen size={36} />
          </div>
          <p>
            Based on the Kết nối tri thức với cuộc sống curriculum, our platform
            provides you with practical, ready-to-use resources to make your
            bilingual lessons engaging and effective.
          </p>
        </div>
      </div>

      <div className="section-heading">
        <h2>
          Where will we <em>start?</em>
        </h2>
      </div>

      <div className="feature-grid">
        <button
          className="feature-card feature-card-simple"
          onClick={() => navigate("terms")}
        >
          <PencilRuler
            className="feature-card-icon"
            size={44}
            strokeWidth={1.3}
          />
          <strong>Maths terms</strong>
          <p>
            Discover key concepts in English, with examples and pronunciation.
          </p>
          <span className="feature-bottom">
            Explore glossary <ArrowRight size={15} />
          </span>
        </button>

        <button
          className="feature-card feature-card-simple"
          onClick={() => navigate("flashcards")}
        >
          <Layers3
            className="feature-card-icon"
            size={44}
            strokeWidth={1.3}
          />
          <strong>Flashcards</strong>
          <p>Flip each card, test your memory, and make new words stick.</p>
          <span className="feature-bottom">
            Start practising <ArrowRight size={15} />
          </span>
        </button>

        <button
          className="feature-card feature-card-simple"
          onClick={() => navigate("worksheets")}
        >
          <NotebookPen
            className="feature-card-icon"
            size={44}
            strokeWidth={1.3}
          />
          <strong>Worksheets</strong>
          <p>Find lesson materials and continue learning beyond the screen.</p>
          <span className="feature-bottom">
            Browse resources <ArrowRight size={15} />
          </span>
        </button>

        <button
          className="feature-card feature-card-simple"
          onClick={() => navigate("tips")}
        >
          <Star className="feature-card-icon" size={44} strokeWidth={1.3} />
          <strong>Teaching tips</strong>
          <p>Find practical ideas for engaging, language-rich maths lessons.</p>
          <span className="feature-bottom">
            Explore teaching tips <ArrowRight size={15} />
          </span>
        </button>

        <button
          className="feature-card feature-card-simple"
          onClick={() => navigate("about")}
        >
          <UsersRound
            className="feature-card-icon"
            size={44}
            strokeWidth={1.3}
          />
          <strong>About us</strong>
          <p>Get to know about us</p>
          <span className="feature-bottom">
            Learn about us <ArrowRight size={15} />
          </span>
        </button>
      </div>

    </section>
  );
}
