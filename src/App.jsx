import React, { useMemo, useState } from "react";
import content from "./data/content.json";
import HomePage from "./pages/HomePage";
import TermsPage, { TermsChapterPage } from "./pages/TermsPage";
import LessonDetailPage from "./pages/LessonDetailPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import WorksheetsPage, { WorksheetsChapterPage } from "./pages/WorksheetsPage";
import TipsPage, { TeachingTipDetailPage } from "./pages/TipsPage";
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
  TIPS_DETAIL: "tips-detail",
  ABOUT: "about",
};

const navItems = [
  { id: PAGES.HOME, label: "Home" },
  { id: PAGES.TERMS, label: "Maths term" },
  { id: PAGES.FLASHCARDS, label: "Flashcard" },
  { id: PAGES.WORKSHEETS, label: "Worksheet" },
  { id: PAGES.TIPS, label: "Teaching tips" },
  { id: PAGES.ABOUT, label: "About us" },
];

const DEFAULT_CHAPTER = "chapter-1";
const GRADES = [6, 7, 8, 9];
const RESOURCE_PAGES = {
  [PAGES.TERMS]: "Maths terms",
  [PAGES.FLASHCARDS]: "Flashcards",
  [PAGES.WORKSHEETS]: "Worksheets",
};

function getDefaultLesson() {
  return content.terms[0]?.lesson || "all";
}

function App() {
  const [page, setPage] = useState(() => {
    const initialPage = new URLSearchParams(window.location.search).get("page");
    return initialPage === PAGES.WORKSHEETS_CHAPTER
      ? PAGES.WORKSHEETS_CHAPTER
      : PAGES.HOME;
  });
  const [search, setSearch] = useState("");
  const [selectedChapter, setSelectedChapter] = useState(
    () =>
      new URLSearchParams(window.location.search).get("chapter") ??
      DEFAULT_CHAPTER,
  );
  const [selectedLesson, setSelectedLesson] = useState(getDefaultLesson());
  const [selectedTeachingTip, setSelectedTeachingTip] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(6);
  const [openGradeMenu, setOpenGradeMenu] = useState(null);

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
    setOpenGradeMenu(null);

    if (nextPage === PAGES.TIPS) {
      setSelectedTeachingTip(null);
    }

    if (RESOURCE_PAGES[nextPage]) {
      setSelectedGrade(6);
    }

    if (nextPage === PAGES.TERMS || nextPage === PAGES.HOME) {
      setSelectedLesson(getDefaultLesson());
    }

    if (nextPage === PAGES.WORKSHEETS) {
      setSelectedChapter(DEFAULT_CHAPTER);
    }
  }

  function selectGrade(nextPage, grade) {
    setSelectedGrade(grade);
    setPage(nextPage);
    resetSearch();
    setOpenGradeMenu(null);

    if (nextPage === PAGES.TERMS) {
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

  function openTeachingTip(tipId) {
    setSelectedTeachingTip(tipId);
    setPage(PAGES.TIPS_DETAIL);
    setOpenGradeMenu(null);
  }

  function backToTeachingTips() {
    setSelectedTeachingTip(null);
    setPage(PAGES.TIPS);
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
          <div className="brand-identity">
            <img
              className="brand-mark"
              src="/Main-logo.svg"
              alt="Maths CLIL logo"
            />
          </div>
        </div>

        <nav className="top-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const hasGradeMenu = Boolean(RESOURCE_PAGES[item.id]);
            return (
              <div
                key={item.id}
                className={`nav-menu ${openGradeMenu === item.id ? "open" : ""}`}
              >
                <button
                  type="button"
                  className={`nav-link ${
                    page === item.id ||
                    (page === PAGES.TIPS_DETAIL && item.id === PAGES.TIPS)
                      ? "active"
                      : ""
                  }`}
                  aria-haspopup={hasGradeMenu ? "true" : undefined}
                  aria-expanded={hasGradeMenu ? openGradeMenu === item.id : undefined}
                  onClick={() => {
                    if (hasGradeMenu) {
                      setOpenGradeMenu((current) =>
                        current === item.id ? null : item.id,
                      );
                    } else {
                      navigate(item.id);
                    }
                  }}
                >
                  <span>{item.label}</span>
                </button>
                {hasGradeMenu && (
                  <div className="grade-menu" aria-label={`${item.label} grades`}>
                    {GRADES.map((grade) => (
                      <button
                        key={grade}
                        type="button"
                        className="grade-option"
                        onClick={() => selectGrade(item.id, grade)}
                      >
                        <span>Grade {grade}</span>
                        {grade !== 6 && (
                          <span className="grade-option-status">
                            Coming soon
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </header>

      <main className="main-content">
        {page === "home" && <HomePage navigate={navigate} />}
        {page === "terms" && selectedGrade !== 6 && (
          <GradeComingSoon
            grade={selectedGrade}
            resource={RESOURCE_PAGES[PAGES.TERMS]}
            onExploreGradeSix={() => selectGrade(PAGES.TERMS, 6)}
          />
        )}
        {page === "terms" && selectedGrade === 6 && (
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
        {page === "flashcards" && selectedGrade !== 6 && (
          <GradeComingSoon
            grade={selectedGrade}
            resource={RESOURCE_PAGES[PAGES.FLASHCARDS]}
            onExploreGradeSix={() => selectGrade(PAGES.FLASHCARDS, 6)}
          />
        )}
        {page === "flashcards" && selectedGrade === 6 && <FlashcardsPage />}
        {page === "worksheets" && selectedGrade !== 6 && (
          <GradeComingSoon
            grade={selectedGrade}
            resource={RESOURCE_PAGES[PAGES.WORKSHEETS]}
            onExploreGradeSix={() => selectGrade(PAGES.WORKSHEETS, 6)}
          />
        )}
        {page === "worksheets" && selectedGrade === 6 && (
          <WorksheetsPage onOpenChapter={openWorksheetChapter} />
        )}
        {page === "worksheets-chapter" && (
          <WorksheetsChapterPage
            chapterId={selectedChapter}
            onBack={backToWorksheetChapterList}
          />
        )}
        {page === PAGES.TIPS && <TipsPage onOpenTip={openTeachingTip} />}
        {page === PAGES.TIPS_DETAIL && (
          <TeachingTipDetailPage
            tipId={selectedTeachingTip}
            onBack={backToTeachingTips}
          />
        )}
        {page === "about" && <AboutPage />}

        {(page === PAGES.TERMS_LESSON ||
          page === PAGES.TIPS ||
          page === PAGES.ABOUT) && <FeedbackForm />}
      </main>
    </div>
  );
}

function GradeComingSoon({ grade, resource, onExploreGradeSix }) {
  return (
    <section className="page-section">
      <div className="grade-coming-soon">
        <div className="eyebrow">{resource}</div>
        <h1>
          Grade {grade} <em>coming soon.</em>
        </h1>
        <p>We're preparing {resource.toLowerCase()} for this grade.</p>
        <button
          type="button"
          className="secondary-button"
          onClick={onExploreGradeSix}
        >
          Explore Grade 6
        </button>
      </div>
    </section>
  );
}

export default App;
