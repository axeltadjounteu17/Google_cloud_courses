import React from "react";
import Icon from "../lib/icons.jsx";
import { useStore, buildResume } from "../lib/store.jsx";
import { Link } from "../lib/router.jsx";
import { CourseCard } from "../components/cards.jsx";
import { Card, Badge, SectionTitle } from "../components/ui.jsx";

export default function Home() {
  const store = useStore();
  const { ALL_COURSES, globalStats, recent, findCourse, coursePct } = store;
  const st = globalStats();
  const resume = buildResume(store);
  const recentItems = recent.slice(0, 4).map((r) => {
    const c = findCourse(r.c);
    if (!c) return null;
    const l = c.lessons[r.l];
    if (!l) return null;
    const read = !!(store.progress[String(c.id)] || {})[r.l];
    return (
      <Link key={`${r.c}-${r.l}`} href={`#/lesson/${c.id}/${r.l}`} className="flex items-center gap-3 rounded-[10px] px-3.5 py-2.5 no-underline transition-colors hover:bg-hover">
        <span className={`inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${read ? "border-green bg-green text-[#06110c]" : "border-borderline text-transparent"}`}>
          {read && <Icon name="check" size={12} />}
        </span>
        <span className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-textmain">{l.title}</div>
          <div className="text-[11px] text-textmuted">{c.title}</div>
        </span>
        <Badge color="blue">{c.lessons.length} leçons</Badge>
      </Link>
    );
  }).filter(Boolean);

  const stats = [
    { num: st.done, color: "text-cyan", lbl: "Leçons lues" },
    { num: st.total - st.done, color: "text-blue", lbl: "Leçons restantes" },
    { num: st.doneCourses, color: "text-green", lbl: "Cours terminés" },
    { num: `${st.pct}%`, color: "text-textmain", lbl: "Progression globale" },
  ];

  return (
    <div className="container mx-auto max-w-[1080px]">
      <div className="mb-6 rounded-[16px] border border-borderline bg-gradient-to-br from-blue/20 via-cyan/10 p-6 backdrop-blur-2xl max-sm:p-4">
        <h1 className="mb-1 text-2xl font-semibold max-sm:text-xl">Bienvenue sur votre espace d'étude</h1>
        <p className="text-sm text-textmuted">
          Préparez la certification <strong className="text-textmain">Google Cloud Professional Cloud Architect</strong> — lecture de{" "}
          <strong className="text-textmain">{st.courses} cours</strong>, {st.total} leçons, en français.
        </p>
      </div>

      {resume && (
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4 rounded-[16px] border border-cyan/40 bg-gradient-to-br from-cyan/15 to-blue/10 p-4.5 backdrop-blur-2xl max-sm:p-4">
          <div className="min-w-0">
            <div className="text-[11px] font-extrabold tracking-wider text-cyan uppercase">Reprendre la lecture</div>
            <div className="mt-1 text-base font-bold">{resume.lesson.title}</div>
            <div className="text-xs text-textmuted">{resume.course.title} · Leçon {resume.index + 1} sur {resume.course.lessons.length} · {coursePct(resume.course)}% du cours lu</div>
          </div>
          <Link href={`#/lesson/${resume.course.id}/${resume.index}`} className="inline-flex items-center gap-2 rounded-[10px] bg-blue px-4 py-2.5 text-sm font-bold text-white no-underline shadow-[0_6px_18px_-8px_rgba(37,99,235,0.7)] transition-opacity hover:opacity-90">
            <Icon name="play" size={18} /> Continuer
          </Link>
        </div>
      )}

      <SectionTitle link="Tout voir" linkHref="#/courses">Vos cours</SectionTitle>
      <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {ALL_COURSES.map((c) => <CourseCard key={c.id} c={c} />)}
      </div>

      <SectionTitle>Statistiques rapides</SectionTitle>
      <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2">
        {stats.map((s, i) => (
          <Card key={i} className="p-4">
            <div className={`text-[26px] font-extrabold tracking-tight ${s.color}`}>{s.num}</div>
            <div className="mt-1 text-xs text-textmuted">{s.lbl}</div>
          </Card>
        ))}
      </div>

      {recentItems.length > 0 && (
        <>
          <SectionTitle>Dernières leçons consultées</SectionTitle>
          <Card className="p-2">{recentItems}</Card>
        </>
      )}
    </div>
  );
}
