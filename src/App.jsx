import React, { useEffect, useState } from "react";
import Icon from "./lib/icons.jsx";
import { useStore } from "./lib/store.jsx";
import { useRoute } from "./lib/router.jsx";
import SecurityGuard from "./components/SecurityGuard.jsx";
import Home from "./pages/Home.jsx";
import Courses from "./pages/Courses.jsx";
import CourseDetail from "./pages/CourseDetail.jsx";
import LessonReader from "./pages/LessonReader.jsx";
import Slides from "./pages/Slides.jsx";
import SlideViewer from "./pages/SlideViewer.jsx";
import Search from "./pages/Search.jsx";
import Progress from "./pages/Progress.jsx";
import Settings from "./pages/Settings.jsx";
import QuizList from "./pages/QuizList.jsx";
import QuizReader from "./pages/QuizReader.jsx";
import ExamHome from "./pages/ExamHome.jsx";
import ExamRunner from "./pages/ExamRunner.jsx";
import CaseStudy from "./pages/CaseStudy.jsx";
import CaseStudies from "./pages/CaseStudies.jsx";
import Onboarding from "./components/Onboarding.jsx";
import { SECTION } from "./components/ui.jsx";

// Navigation groupée par intention : apprendre, s'entraîner, se situer.
// L'ordre suit le parcours réel d'une révision de certification.
const NAV_GROUPS = [
  {
    items: [{ path: "home", label: "Accueil", icon: "home" }],
  },
  {
    label: "Apprendre",
    items: [
      { path: "courses", label: "Cours", icon: "book" },
      { path: "search", label: "Recherche", icon: "search" },
    ],
  },
  {
    label: "S'entraîner",
    items: [
      { path: "quiz", label: "Quiz de révision", icon: "target" },
      { path: "exam", label: "Examen blanc", icon: "award" },
      { path: "cases", label: "Études de cas", icon: "book-open" },
    ],
  },
  {
    label: "Suivi",
    items: [
      { path: "progress", label: "Progression", icon: "chart" },
      { path: "settings", label: "Paramètres", icon: "settings" },
    ],
  },
];

const NAV = NAV_GROUPS.flatMap((g) => g.items);

// Rattache chaque route à l'entrée de menu qui doit s'allumer.
const ACTIVE_FOR = {
  course: "courses", lesson: "courses", slides: "courses", slide: "courses",
  quizc: "quiz",
  examrun: "exam", examrunt: "exam",
  case: "cases",
};

function Page({ route }) {
  switch (route.page) {
    case "courses": return <Courses />;
    case "course": return <CourseDetail id={route.params[0]} />;
    case "lesson": return <LessonReader cid={route.params[0]} lidx={Number(route.params[1])} />;
    case "slides": return <Slides cid={route.params[0]} />;
    case "slide": return <SlideViewer cid={route.params[0]} deckId={route.params[1]} page={route.params[2]} />;
    case "quiz": return <QuizList />;
    case "quizc": return <QuizReader qid={route.params[0]} />;
    case "exam": return <ExamHome />;
    case "examrun": return <ExamRunner key={route.hash} mode={route.params[0]} target={null} />;
    case "examrunt": return <ExamRunner key={route.hash} mode={route.params[0]} target={route.params[1]} />;
    case "cases": return <CaseStudies />;
    case "case": return <CaseStudy id={route.params[0]} />;
    case "search": return <Search />;
    case "progress": return <Progress />;
    case "settings": return <Settings />;
    default: return <Home />;
  }
}

function Sidebar({ active }) {
  const store = useStore();
  const st = store.globalStats();
  const sec = SECTION[active] || SECTION.home;
  const [theme, setTheme] = useState(() => localStorage.getItem("gcp_theme") || "dark");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => {
    const nt = t === "dark" ? "light" : "dark";
    localStorage.setItem("gcp_theme", nt);
    return nt;
  });

  const dark = theme === "dark";

  const nav = (
    <>
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="brand-icon">G</div>
        <div className="min-w-0">
          <div className="text-[15px] leading-tight font-bold">GCP Étude</div>
          <div className="text-[11px] text-textmuted">Certification Cloud</div>
        </div>
      </div>

      <nav className="flex flex-col px-3" aria-label="Sections">
        {NAV_GROUPS.map((g, gi) => (
          <div key={gi} className="flex flex-col gap-0.5">
            {g.label && <div className="nav-group">{g.label}</div>}
            {g.items.map((n) => {
              const on = active === n.path;
              return (
                <a
                  key={n.path}
                  href={`#/${n.path}`}
                  onClick={() => setOpen(false)}
                  aria-current={on ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-[9px] px-3 py-2.5 text-[13.5px] font-semibold no-underline transition-colors ${
                    on ? sec.active : "text-textmuted hover:bg-hover hover:text-textmain"
                  }`}
                >
                  <Icon name={n.icon} size={17} className="shrink-0" />
                  {n.label}
                </a>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="mt-auto px-5 pb-5">
        <div className="mb-1.5 flex items-baseline justify-between text-[11px]">
          <span className="text-textmuted">Progression globale</span>
          <span className="font-bold text-cyan">{st.pct}%</span>
        </div>
        <div className="h-[6px] overflow-hidden rounded-full bg-borderline">
          <div className="h-full rounded-full bg-cyan transition-[width] duration-300" style={{ width: `${st.pct}%` }} />
        </div>
        <div className="mt-1.5 text-[11px] text-textmuted">{st.done} / {st.total} leçons lues</div>
        <button
          onClick={toggleTheme}
          className="mt-4 flex w-full items-center gap-2.5 rounded-[9px] bg-hover px-3 py-2.5 text-[13.5px] font-semibold text-textmuted transition-colors hover:bg-active hover:text-textmain"
        >
          <Icon name={dark ? "moon" : "sun"} size={17} />
          {dark ? "Mode sombre" : "Mode clair"}
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside
        aria-label="Navigation principale"
        className={`fixed inset-y-0 left-0 z-50 flex w-[276px] max-w-[84vw] flex-col border-r border-borderline bg-bg transition-transform duration-300 ease-out lg:static lg:z-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto">{nav}</div>
      </aside>

      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-scrim/80 transition-opacity duration-300 lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      <header className="sticky top-0 z-30 flex h-[58px] w-full items-center gap-2 border-b border-borderline bg-bgsoft px-3.5 lg:hidden">
        <button className="icon-btn" onClick={() => setOpen(true)} aria-label="Ouvrir le menu"><Icon name="menu" size={20} /></button>
        <div className="flex-1 truncate text-[15px] font-bold">GCP Étude</div>
        <button className="icon-btn" onClick={toggleTheme} aria-label="Basculer le thème"><Icon name={dark ? "moon" : "sun"} size={18} /></button>
      </header>
    </>
  );
}

export default function App() {
  const route = useRoute();
  const { onboarding, closeOnboarding } = useStore();
  const active = NAV.some((n) => n.path === route.page)
    ? route.page
    : ACTIVE_FOR[route.page] || "home";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route.hash]);

  return (
    <SecurityGuard>
      <div className="app">
        <Sidebar active={active} />
        <main className="main" tabIndex="-1">
          <div key={route.hash} className="page-fade">
            <Page route={route} />
          </div>
        </main>
      </div>
      {onboarding && <Onboarding onClose={closeOnboarding} />}
    </SecurityGuard>
  );
}

