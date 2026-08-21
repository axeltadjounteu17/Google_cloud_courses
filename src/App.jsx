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
import Logo, { LogoMark } from "./components/Logo.jsx";
import TopBar from "./components/TopBar.jsx";
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

/**
 * Couleurs de repérage du menu. Classes statiques : Tailwind ne résout pas
 * `text-${var}`. Le contenu des pages reste achromatique, seule la navigation
 * est colorée, car c'est là que la couleur aide à se situer.
 */
const NAV_TONE = {
  home:     { text: "text-navhome",     bg: "bg-hover", border: "border-navhome" },
  courses:  { text: "text-navcourses",  bg: "bg-hover", border: "border-navcourses" },
  search:   { text: "text-navsearch",   bg: "bg-hover", border: "border-navsearch" },
  quiz:     { text: "text-navquiz",     bg: "bg-hover", border: "border-navquiz" },
  exam:     { text: "text-navexam",     bg: "bg-hover", border: "border-navexam" },
  cases:    { text: "text-navcases",    bg: "bg-hover", border: "border-navcases" },
  progress: { text: "text-navprogress", bg: "bg-hover", border: "border-navprogress" },
  settings: { text: "text-navsettings", bg: "bg-hover", border: "border-navsettings" },
};

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

const JOURS = ["L", "M", "M", "J", "V", "S", "D"];

function dayKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Régularité d'étude : série en cours et 14 derniers jours.
 * Occupe l'espace laissé vide entre le menu et le pied de la barre latérale.
 */
function StreakStrip({ days, streak }) {
  const set = new Set(days || []);
  const today = new Date();

  // 14 jours, du plus ancien au plus récent.
  const cells = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (13 - i));
    return { key: dayKey(d), on: set.has(dayKey(d)), label: d, isToday: i === 13 };
  });

  const total = set.size;
  const last14 = cells.filter((c) => c.on).length;

  return (
    <div className="rounded-[8px] border border-borderline bg-secondary p-3">
      <div className="flex items-center gap-2">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] ${streak > 0 ? "bg-hover text-textmain" : "bg-hover text-textmuted"}`}>
          <Icon name="flame" size={15} />
        </span>
        <div className="min-w-0">
          <div className="text-[13px] leading-tight font-bold">
            {streak > 0 ? `${streak} jour${streak > 1 ? "s" : ""} d'affilée` : "Série à démarrer"}
          </div>
          <div className="text-[10.5px] text-textmuted">
            {total} jour{total > 1 ? "s" : ""} d'étude au total
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex items-end justify-between gap-[3px]" role="img"
           aria-label={`${last14} jours étudiés sur les 14 derniers`}>
        {cells.map((c, i) => (
          <span
            key={c.key}
            title={c.label.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
            className={`h-6 flex-1 rounded-[4px] ${
              c.on ? "bg-textmain" : "bg-hover"
            } ${c.isToday ? "ring-1 ring-borderline" : ""}`}
          />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[9.5px] text-textmuted">
        <span>il y a 14 j</span>
        <span>aujourd'hui</span>
      </div>
    </div>
  );
}

function Sidebar({ active, open, setOpen }) {
  const store = useStore();
  const st = store.globalStats();
  const sec = SECTION[active] || SECTION.home;

  const nav = (
    <>
      <a href="#/home" className="flex items-center px-4 py-5 no-underline" aria-label="GCP Étude, accueil">
        <Logo size={34} />
      </a>

      <nav className="flex flex-col px-3" aria-label="Sections">
        {NAV_GROUPS.map((g, gi) => (
          <div key={gi} className="flex flex-col gap-0.5">
            {g.label && <div className="nav-group">{g.label}</div>}
            {g.items.map((n) => {
              const on = active === n.path;
              const tone = NAV_TONE[n.path] || NAV_TONE.home;
              return (
                <a
                  key={n.path}
                  href={`#/${n.path}`}
                  onClick={() => setOpen(false)}
                  aria-current={on ? "page" : undefined}
                  className={`group flex items-center gap-3 rounded-[4px] px-3 py-2.5 text-[13.5px] font-semibold no-underline transition-colors ${
                    on
                      ? `${tone.bg} ${tone.text} border-l-2 ${tone.border}`
                      : "border-l-2 border-transparent text-textmuted hover:bg-hover hover:text-textmain"
                  }`}
                >
                  {/* L'icône garde sa couleur de rôle même inactive : c'est
                      elle qui permet de se repérer dans le menu. */}
                  <Icon name={n.icon} size={17} className={`shrink-0 ${tone.text}`} />
                  {n.label}
                </a>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Compteur de régularité, placé juste sous le menu : c'est la métrique
          qu'on veut voir en permanence pendant une préparation. */}
      <div className="mt-6 px-3">
        <StreakStrip days={store.studyDays} streak={store.computeStreak()} />
      </div>

      <div className="mt-auto px-5 pb-5">
        <div className="mb-1.5 flex items-baseline justify-between text-[11px]">
          <span className="text-textmuted">Progression globale</span>
          <span className="font-bold text-textmain">{st.pct}%</span>
        </div>
        <div className="h-[6px] overflow-hidden bg-borderline">
          <div className="h-full bg-textmain transition-[width] duration-300" style={{ width: `${st.pct}%` }} />
        </div>
        <div className="mt-1.5 text-[11px] text-textmuted">{st.done} / {st.total} leçons lues</div>
      </div>
    </>
  );

  return (
    <>
      {/* `shrink-0` est indispensable : sans lui, la largeur intrinsèque du
          titre d'accroche comprime la barre latérale et tronque le menu. */}
      <aside
        aria-label="Navigation principale"
        className={`fixed inset-y-0 left-0 z-50 flex w-[276px] max-w-[84vw] shrink-0 flex-col border-r border-borderline bg-bg transition-transform duration-300 ease-out lg:static lg:z-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto">{nav}</div>
      </aside>

      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-scrim/80 transition-opacity duration-300 lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

    </>
  );
}

export default function App() {
  const route = useRoute();
  const { onboarding, closeOnboarding } = useStore();
  // L'ouverture du menu mobile est portée ici : la barre supérieure la
  // déclenche, la barre latérale la consomme.
  const [menuOpen, setMenuOpen] = useState(false);
  const active = NAV.some((n) => n.path === route.page)
    ? route.page
    : ACTIVE_FOR[route.page] || "home";

  useEffect(() => {
    window.scrollTo(0, 0);
    setMenuOpen(false);
  }, [route.hash]);

  return (
    <SecurityGuard>
      <div className="app">
        <Sidebar active={active} open={menuOpen} setOpen={setMenuOpen} />
        {/* Colonne de contenu : barre supérieure fixe puis zone de lecture,
            comme dans les maquettes où la recherche et les notifications
            restent accessibles en permanence. */}
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar onOpenMenu={() => setMenuOpen(true)} />
          <main className="main" tabIndex="-1">
            <div key={route.hash} className="page-fade">
              <Page route={route} />
            </div>
          </main>
        </div>
      </div>
      {onboarding && <Onboarding onClose={closeOnboarding} />}
    </SecurityGuard>
  );
}

