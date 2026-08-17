import React from "react";
import Icon from "../lib/icons.jsx";
import { useStore, buildResume } from "../lib/store.jsx";
import { Link } from "../lib/router.jsx";
import { CourseCard } from "../components/cards.jsx";
import { Card, Badge, SectionTitle, ProgressBar } from "../components/ui.jsx";

export default function Home() {
  const store = useStore();
  const { ALL_COURSES, globalStats, recent, findCourse, coursePct, computeStreak, bookmarkedCount, isBookmarked } = store;
  const st = globalStats();
  const resume = buildResume(store);
  const streak = computeStreak();
  const bookmarks = bookmarkedCount();
  const recentItems = recent.slice(0, 4).map((r) => {
    const c = findCourse(r.c);
    if (!c) return null;
    const l = c.lessons[r.l];
    if (!l) return null;
    const read = !!(store.progress[String(c.id)] || {})[r.l];
    const marked = isBookmarked(c.id, r.l);
    return (
      <Link key={`${r.c}-${r.l}`} href={`#/lesson/${c.id}/${r.l}`} className="flex items-center gap-3 rounded-[10px] px-3.5 py-2.5 no-underline transition-colors hover:bg-hover">
        <span className={`inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${read ? "border-green bg-green text-[#06110c]" : "border-borderline text-transparent"}`}>
          {read && <Icon name="check" size={12} />}
        </span>
        <span className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-textmain">{l.title}</span>
            {marked && <Icon name="bookmark" size={12} className="shrink-0 text-yellow" />}
          </div>
          <div className="text-[11px] text-textmuted">{c.title}</div>
        </span>
        <Badge color="violet">{c.lessons.length} leçons</Badge>
      </Link>
    );
  }).filter(Boolean);

  const stats = [
    { icon: "book", chip: "bg-violet/15", color: "text-violet", num: st.done, lbl: "Leçons lues" },
    { icon: "award", chip: "bg-green/15", color: "text-green", num: st.doneCourses, lbl: "Cours terminés" },
    { icon: "flame", chip: "bg-cyan/15", color: "text-cyan", num: streak, lbl: "Jours d'étude d'affilée" },
    { icon: "bookmark", chip: "bg-yellow/15", color: "text-yellow", num: bookmarks, lbl: "Leçons à réviser" },
  ];

  return (
    <div className="container mx-auto max-w-[1080px]">
      <div className="relative mb-8 overflow-hidden rounded-[18px] border border-borderline bg-gradient-to-br from-violet/25 via-cyan/10 to-transparent p-6 backdrop-blur-2xl max-sm:p-4">
        <Icon name="cloud" size={52} className="pointer-events-none absolute -right-3 -bottom-4 text-cyan/20" />
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-cyan max-sm:text-xl">Bienvenue sur votre espace d'étude</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-[12px] font-bold text-cyan">
            <Icon name="flame" size={13} /> {streak} jour{streak > 1 ? "s" : ""} d'affilée
          </span>
        </div>
        <p className="text-sm text-textmuted">
          Préparez la certification <strong className="text-textmain">Google Cloud Professional Cloud Architect</strong> — lecture de{" "}
          <strong className="text-textmain">{st.courses} cours</strong>, {st.total} leçons, en français.
        </p>
      </div>

      {resume && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-cyan/40 bg-gradient-to-br from-cyan/15 to-violet/10 p-5 backdrop-blur-2xl max-sm:p-4">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-extrabold tracking-wider text-cyan uppercase">Reprendre la lecture</div>
            <div className="mt-1.5 truncate text-lg font-bold">{resume.lesson.title}</div>
            <div className="text-xs text-textmuted">
              {resume.course.title} · Leçon {resume.index + 1} sur {resume.course.lessons.length}
            </div>
            <div className="mt-3 max-w-[380px]">
              <ProgressBar pct={coursePct(resume.course)} h="h-2" />
            </div>
            <div className="mt-1.5 text-[11.5px] text-textmuted">{coursePct(resume.course)}% du cours lu</div>
          </div>
          <Link href={`#/lesson/${resume.course.id}/${resume.index}`} className="inline-flex items-center gap-2 rounded-[10px] bg-cyan px-4 py-2.5 text-sm font-bold text-white no-underline shadow-[0_6px_18px_-8px_rgba(56,189,248,0.7)] transition-opacity hover:opacity-90">
            <Icon name="play" size={18} /> Continuer
          </Link>
        </div>
      )}

      <SectionTitle link="Tout voir" linkHref="#/courses" className="mt-10">Vos cours</SectionTitle>
      <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {ALL_COURSES.map((c) => <CourseCard key={c.id} c={c} />)}
      </div>

      <SectionTitle className="mt-12">Statistiques rapides</SectionTitle>
      <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-2">
        {stats.map((s, i) => (
          <Card key={i} className="flex items-center gap-3.5 p-4">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] ${s.chip}`}>
              <Icon name={s.icon} size={20} />
            </span>
            <div className="min-w-0">
              <div className={`text-[22px] leading-none font-extrabold tracking-tight ${s.color}`}>{s.num}</div>
              <div className="mt-1 text-[11px] text-textmuted">{s.lbl}</div>
            </div>
          </Card>
        ))}
      </div>

      {recentItems.length > 0 && (
        <>
          <SectionTitle className="mt-12">Dernières leçons consultées</SectionTitle>
          <Card className="p-2">{recentItems}</Card>
        </>
      )}
    </div>
  );
}
