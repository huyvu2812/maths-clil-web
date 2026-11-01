import React, { useMemo, useState } from "react";
import {
  BookOpen,
  Calculator,
  Layers3,
  Lightbulb,
  ClipboardList,
  House,
  GraduationCap,
} from "lucide-react";
import content from "./data/content.json";
import HomePage from "./pages/HomePage";
import TermsPage, { TermsChapterPage } from "./pages/TermsPage";
import LessonDetailPage from "./pages/LessonDetailPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import WorksheetsPage, { WorksheetsChapterPage } from "./pages/WorksheetsPage";
import TipsPage from "./pages/TipsPage";
import AboutPage from "./pages/AboutPage";

const navItems = [
  { id: "home", label: "Home", icon: House },
  { id: "terms", label: "Maths term", icon: Calculator },
  { id: "flashcards", label: "Flashcard", icon: Layers3 },
  { id: "worksheets", label: "Worksheet", icon: ClipboardList },
  { id: "tips", label: "Teaching tips", icon: Lightbulb },
  { id: "about", label: "About us", icon: GraduationCap },
];

function App() {
  const [page, setPage] = useState("home");
  const [search, setSearch] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("chapter-1");
  const [selectedLesson, setSelectedLesson] = useState(
    content.terms[0]?.lesson || "all",
  );

  const lessons = useMemo(
    () => [...new Set(content.terms.map((t) => t.lesson))],
    [],
  );

  function navigate(nextPage) {
    setPage(nextPage);
    setSearch("");
    if (nextPage === "terms" || nextPage === "home") {
      setSelectedLesson(content.terms[0]?.lesson || "all");
    }
    if (nextPage === "worksheets") {
      setSelectedChapter("chapter-1");
    }
  }

  function openLesson(lessonName) {
    setPage("terms-lesson");
    setSelectedLesson(lessonName);
    setSearch("");
  }

  function openTermsChapter(chapterId) {
    setSelectedChapter(chapterId);
    setPage("terms-chapter");
    setSearch("");
  }

  function openWorksheetChapter(chapterId) {
    setSelectedChapter(chapterId);
    setPage("worksheets-chapter");
    setSearch("");
  }

  function backToLessons() {
    setPage("terms");
    setSearch("");
    setSelectedLesson(content.terms[0]?.lesson || "all");
  }

  function backToTermsChapterList() {
    setPage("terms");
    setSearch("");
  }

  function backToWorksheetChapterList() {
    setPage("worksheets");
    setSearch("");
  }

  return (
    <div className="app-shell">
      <header className="horizontal-header">
        <div
          className="brand-block"
          onClick={() => navigate("home")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") navigate("home");
          }}
        >
          <img className="brand-mark" src="/1.svg" alt="Maths CLIL logo" />
          <div className="brand-copy">
            <span className="brand-slogan">
              Empowering Educators through CLIL
            </span>
          </div>
        </div>

        <nav className="top-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-link ${page === item.id ? "active" : ""}`}
                onClick={() => navigate(item.id)}
              >
                <span className="nav-icon">
                  <Icon size={18} />
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      <main className="main-content">
        {page === "home" && <HomePage navigate={navigate} />}
        {page === "terms" && (
          <TermsPage lessons={lessons} onOpenChapter={openTermsChapter} />
        )}
        {page === "terms-chapter" && (
          <TermsChapterPage
            chapterId={selectedChapter}
            lessons={lessons}
            onBack={backToTermsChapterList}
            onOpenLesson={openLesson}
          />
        )}
        {page === "terms-lesson" && (
          <LessonDetailPage
            lesson={selectedLesson}
            lessons={lessons}
            search={search}
            setSearch={setSearch}
            onBack={backToLessons}
            onLessonChange={(nextLesson) => {
              setSelectedLesson(nextLesson);
              setSearch("");
            }}
          />
        )}
        {page === "flashcards" && <FlashcardsPage />}
        {page === "worksheets" && (
          <WorksheetsPage onOpenChapter={openWorksheetChapter} />
        )}
        {page === "worksheets-chapter" && (
          <WorksheetsChapterPage
            chapterId={selectedChapter}
            onBack={backToWorksheetChapterList}
          />
        )}
        {page === "tips" && <TipsPage />}
        {page === "about" && <AboutPage />}
      </main>
    </div>
  );
}

export default App;
