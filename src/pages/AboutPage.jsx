import React from "react";
import { GraduationCap, Shapes } from "lucide-react";

export default function AboutPage() {
  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <GraduationCap size={14} /> ABOUT US
          </div>
          <h1>
            Learning maths <em>with language.</em>
          </h1>
          <p>
            Our goal is to help teachers and learners build confidence through
            CLIL-based maths vocabulary.
          </p>
        </div>
      </div>

      <div className="about-card">
        <p>
          <strong>Maths CLIL</strong> brings together mathematical thinking and
          English language development in a friendly, practical learning space.
        </p>
        <p>
          Students can explore key maths terms, revise with flashcards, open
          classroom resources, and connect language with real concepts in a
          clear, engaging way.
        </p>
        <p>
          Designed to support curious minds and confident teachers, this
          learning space makes STEM vocabulary accessible and memorable.
        </p>
      </div>
    </section>
  );
}
