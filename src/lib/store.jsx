import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import DATA from "../data/courses.js";
import SLIDES from "../data/slides.js";

const LS = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
};
const KEYS = {
  progress: "gcp_progress",
  position: "gcp_position",
  recent: "gcp_recent",
  settings: "gcp_settings",
  theme: "gcp_theme",
  onboarded: "gcp_onboarded",
  studyDays: "gcp_study_days",
  bookmarks: "gcp_bookmarks",
};

function dayKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function computeStreak(days) {
  const set = new Set(days);
  let streak = 0;
  const d = new Date();
  if (!set.has(dayKey(d))) d.setDate(d.getDate() - 1);
  while (set.has(dayKey(d))) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function slideCourses() {
  const ids = new Set(DATA.courses.map((c) => c.id));
  return SLIDES.filter((s) => !ids.has(s.courseId)).map((s) => ({
    id: s.courseId,
    title: s.title,
    icon: "layers",
    mode: "slides",
    level: "Slides",
    hours: null,
    lessons: [],
    slideCourse: true,
    slideMeta: s,
  }));
}

const ALL_COURSES = DATA.courses.concat(slideCourses());

const StoreCtx = createContext(null);

export function StoreProvider({ children }) {
  const [progress, setProgress] = useState(LS.get(KEYS.progress, {}));
  const [position, setPosition] = useState(LS.get(KEYS.position, {}));
  const [recent, setRecent] = useState(LS.get(KEYS.recent, []));
  const [settings, setSettings] = useState(LS.get(KEYS.settings, { font: "md", timestamps: true, dots: true }));
  const [theme, setTheme] = useState(LS.get(KEYS.theme, "dark"));
  const [studyDays, setStudyDays] = useState(LS.get(KEYS.studyDays, []));
  const [bookmarks, setBookmarks] = useState(LS.get(KEYS.bookmarks, {}));
  const [route, setRoute] = useState("");
  const [onboarding, setOnboarding] = useState(() => !LS.get(KEYS.onboarded, false));

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    LS.set(KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    LS.set(KEYS.progress, progress);
    LS.set(KEYS.position, position);
    LS.set(KEYS.recent, recent);
    LS.set(KEYS.settings, settings);
    LS.set(KEYS.studyDays, studyDays);
    LS.set(KEYS.bookmarks, bookmarks);
  }, [progress, position, recent, settings, studyDays, bookmarks]);

  useEffect(() => {
    const parse = () => setRoute(location.hash.replace(/^#\/?/, "") || "home");
    parse();
    window.addEventListener("hashchange", parse);
    return () => window.removeEventListener("hashchange", parse);
  }, []);

  const value = useMemo(() => {
    const findCourse = (id) => ALL_COURSES.find((c) => c.id === Number(id));
    const slideForCourse = (cid) => SLIDES.find((s) => s.courseId === Number(cid));
    const slidesTotal = (cid) => {
      const s = slideForCourse(cid);
      return s ? s.decks.reduce((n, d) => n + d.pages.length, 0) : 0;
    };
    const deckForLesson = (cid, lidx) => {
      const s = slideForCourse(cid);
      if (!s) return null;
      const n = lidx + 1;
      return s.decks.find((d) => d.lessonStart != null && n >= d.lessonStart && n <= d.lessonEnd) || null;
    };
    const deckById = (cid, deckId) => {
      const s = slideForCourse(cid);
      return s ? s.decks.find((d) => d.id === deckId) || null : null;
    };
    const courseRead = (c) => {
      const p = progress[String(c.id)] || {};
      return c.lessons.filter((_, i) => p[i]).length;
    };
    const coursePct = (c) => {
      const n = c.lessons.length || 1;
      return Math.round((courseRead(c) / n) * 100);
    };
    const totalLessons = () => DATA.courses.reduce((n, c) => n + c.lessons.length, 0);
    const globalStats = () => {
      const total = totalLessons();
      const done = DATA.courses.reduce((n, c) => n + courseRead(c), 0);
      return {
        total,
        done,
        pct: total ? Math.round((done / total) * 100) : 0,
        courses: DATA.courses.length,
        doneCourses: DATA.courses.filter((c) => courseRead(c) === c.lessons.length).length,
      };
    };
    const toggleRead = (cid, lidx) => {
      setProgress((p) => {
        const c = p[String(cid)] || {};
        return { ...p, [String(cid)]: { ...c, [lidx]: !c[lidx] } };
      });
    };
    const setRead = (cid, lidx, val) => {
      setProgress((p) => {
        const c = p[String(cid)] || {};
        return { ...p, [String(cid)]: { ...c, [lidx]: val } };
      });
    };
    const markAll = (c) => {
      setProgress((p) => ({ ...p, [String(c.id)]: Object.fromEntries(c.lessons.map((_, i) => [i, true])) }));
    };
    const unmarkAll = (c) => {
      setProgress((p) => ({ ...p, [String(c.id)]: {} }));
      setPosition((pos) => (pos.courseId === c.id ? {} : pos));
    };
    const setLessonPos = (cid, lidx) => {
      setPosition({ courseId: cid, lessonIdx: lidx });
      setRecent((r) => [{ c: cid, l: lidx, ts: Date.now() }, ...r.filter((x) => !(x.c === cid && x.l === lidx))].slice(0, 8));
      const today = dayKey(new Date());
      setStudyDays((s) => (s.includes(today) ? s : [...s, today].slice(-400)));
    };
    const toggleBookmark = (cid, lidx) => {
      setBookmarks((b) => {
        const c = { ...(b[String(cid)] || {}) };
        if (c[lidx]) delete c[lidx];
        else c[lidx] = true;
        return { ...b, [String(cid)]: c };
      });
    };
    const isBookmarked = (cid, lidx) => !!((bookmarks[String(cid)] || {})[lidx]);
    const bookmarkedCount = () => Object.values(bookmarks).reduce((n, c) => n + Object.keys(c).length, 0);
    const resetAll = () => {
      setProgress({});
      setPosition({});
      setRecent([]);
    };
    const importData = (d) => {
      if (d.progress && typeof d.progress === "object") setProgress(d.progress);
      if (d.position && typeof d.position === "object") setPosition(d.position);
      if (Array.isArray(d.recent)) setRecent(d.recent);
    };
    const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
    const openOnboarding = () => {
      LS.set(KEYS.onboarded, false);
      setOnboarding(true);
    };
    const closeOnboarding = () => {
      LS.set(KEYS.onboarded, true);
      setOnboarding(false);
    };

    return {
      DATA,
      SLIDES,
      ALL_COURSES,
      progress,
      position,
      recent,
      settings,
      setSettings,
      theme,
      toggleTheme,
      route,
      studyDays,
      bookmarks,
      toggleBookmark,
      isBookmarked,
      bookmarkedCount,
      computeStreak: () => computeStreak(studyDays),
      onboarding,
      openOnboarding,
      closeOnboarding,
      findCourse,
      slideForCourse,
      slidesTotal,
      deckForLesson,
      deckById,
      courseRead,
      coursePct,
      totalLessons,
      globalStats,
      toggleRead,
      setRead,
      markAll,
      unmarkAll,
      setLessonPos,
      resetAll,
      importData,
    };
  }, [progress, position, recent, settings, theme, route, onboarding, studyDays, bookmarks]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function hl(text, q) {
  const re = q && q.trim().length >= 2 ? new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig") : null;
  if (!re) return text;
  const parts = String(text).split(re);
  return parts.map((part, i) => (re.test(part) ? <mark key={i}>{part}</mark> : part));
}

export function fmtTime(t) {
  const m = String(t).match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return t;
  return m[3] ? `${m[1]}:${m[2]}:${m[3]}` : `${+m[1]}:${m[2]}`;
}

export function buildResume(store) {
  const { position, findCourse } = store;
  if (position.courseId == null) return null;
  const c = findCourse(position.courseId);
  if (!c) return null;
  const lesson = c.lessons[position.lessonIdx];
  if (!lesson) return null;
  return { course: c, lesson, index: position.lessonIdx };
}

export function buildSearchIndex(DATA) {
  const idx = [];
  DATA.courses.forEach((c) => {
    c.lessons.forEach((l, li) => {
      const full = l.segments.map((s) => s.text).join(" ");
      idx.push({ c, li, title: l.title, full, ts: l.segments.map((s) => s.t).filter(Boolean) });
    });
  });
  return idx;
}
