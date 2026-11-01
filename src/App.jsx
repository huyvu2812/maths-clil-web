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
import FeedbackForm from "./components/FeedbackForm";

const PAGES = {
  HOME: "home",
  TERMS: "terms",
  TERMS_CHAPTER: "terms-chapter",
  TERMS_LESSON: "terms-lesson",
  FLASHCARDS: "flashcards",
  WORKSHEETS: "worksheets",
  WORKSHEETS_CHAPTER: "worksheets-chapter",
  TIPS: "tips",
  ABOUT: "about",
};

const navItems = [
  { id: PAGES.HOME, label: "Home", icon: House },
  { id: PAGES.TERMS, label: "Maths term", icon: Calculator },
  { id: PAGES.FLASHCARDS, label: "Flashcard", icon: Layers3 },
  { id: PAGES.WORKSHEETS, label: "Worksheet", icon: ClipboardList },
  { id: PAGES.TIPS, label: "Teaching tips", icon: Lightbulb },
  { id: PAGES.ABOUT, label: "About us", icon: GraduationCap },
];

const DEFAULT_CHAPTER = "chapter-1";

function getDefaultLesson() {
  return content.terms[0]?.lesson || "all";
}

function App() {
  const [page, setPage] = useState(PAGES.HOME);
  const [search, setSearch] = useState("");
  const [selectedChapter, setSelectedChapter] = useState(DEFAULT_CHAPTER);
  const [selectedLesson, setSelectedLesson] = useState(getDefaultLesson());

  const lessons = useMemo(
    () => [...new Set(content.terms.map((t) => t.lesson))],
    [],
  );

  function resetSearch() {
    setSearch("");
  }

  function navigate(nextPage) {
    setPage(nextPage);
    resetSearch();

    if (nextPage === PAGES.TERMS || nextPage === PAGES.HOME) {
      setSelectedLesson(getDefaultLesson());
    }

    if (nextPage === PAGES.WORKSHEETS) {
      setSelectedChapter(DEFAULT_CHAPTER);
    }
  }

  function openLesson(lessonName) {
    setPage(PAGES.TERMS_LESSON);
    setSelectedLesson(lessonName);
    resetSearch();
  }

  function openTermsChapter(chapterId) {
    setSelectedChapter(chapterId);
    setPage(PAGES.TERMS_CHAPTER);
    resetSearch();
  }

  function openWorksheetChapter(chapterId) {
    setSelectedChapter(chapterId);
    setPage(PAGES.WORKSHEETS_CHAPTER);
    resetSearch();
  }

  function backToLessons() {
    setPage(PAGES.TERMS);
    resetSearch();
    setSelectedLesson(getDefaultLesson());
  }

  function backToTermsChapterList() {
    setPage(PAGES.TERMS);
    resetSearch();
  }

  function backToWorksheetChapterList() {
    setPage(PAGES.WORKSHEETS);
    resetSearch();
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
          <img
            className="brand-mark"
            src="/Main-logo.svg"
            alt="Maths CLIL logo"
          />
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

        {(page === PAGES.TERMS_LESSON ||
          page === PAGES.TIPS ||
          page === PAGES.ABOUT) && <FeedbackForm />}
      </main>
    </div>
  );
}

export default App;
