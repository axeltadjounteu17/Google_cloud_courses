import React from "react";
import Icon from "../lib/icons.jsx";
import { useStore, buildResume } from "../lib/store.jsx";
import { Link } from "../lib/router.jsx";
import { CourseCard } from "../components/cards.jsx";
import { Card, Badge, SectionTitle, ProgressBar } from "../components/ui.jsx";

const TOPICS = ["IAM", "VPC", "Cloud Storage", "Kubernetes", "Cloud Run", "BigQuery", "Pub/Sub", "Terraform", "Cloud SQL", "Load Balancing", "Secret Manager", "Compute Engine", "Cloud Functions", "Monitoring"];

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
        <span className={`inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${read ? "border-green bg-green text-onaccent" : "border-borderline text-transparent"}`}>
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
    { icon: "book", chip: "bg-tintviolet", color: "text-violet", num: st.done, lbl: "Leçons lues" },
    { icon: "award", chip: "bg-tintgreen", color: "text-green", num: st.doneCourses, lbl: "Cours terminés" },
    { icon: "flame", chip: "bg-tintcyan", color: "text-cyan", num: streak, lbl: "Jours d'étude d'affilée" },
    { icon: "bookmark", chip: "bg-tintyellow", color: "text-yellow", num: bookmarks, lbl: "Leçons à réviser" },
  ];

  return (
    <div className="ambient container mx-auto max-w-[1080px]">
      {/* Accroche : une phrase large, la hiérarchie portée par la taille. */}
      <header className="rise pt-6 pb-12 max-sm:pt-2 max-sm:pb-8">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-borderline bg-secondary px-3 py-1.5 text-[11.5px] font-semibold tracking-wide text-textmuted uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-green" />
          Professional Cloud Architect · guide v6.1
        </div>

        <h1 className="text-hero max-w-[19ch]">
          Préparez la certification <span className="text-cyan">sans y passer vos nuits</span>.
        </h1>

        <p className="mt-5 max-w-[58ch] text-[15.5px] leading-relaxed text-textmuted">
          {st.courses} cours en français, {st.total} leçons, {" "}
          <strong className="font-semibold text-textmain">71 questions type examen</strong> corrigées
          et les quatre études de cas officielles. Tout hors ligne, tout à votre rythme.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-2.5">
          <Link
            href={resume ? `#/lesson/${resume.course.id}/${resume.index}` : "#/courses"}
            className="inline-flex items-center gap-2 rounded-[10px] bg-cyan px-5 py-3 text-[14px] font-bold text-onaccent no-underline transition-opacity hover:opacity-90"
          >
            <Icon name="play" size={17} /> {resume ? "Reprendre la lecture" : "Commencer un cours"}
          </Link>
          <Link
            href="#/exam"
            className="inline-flex items-center gap-2 rounded-[10px] border border-borderline px-5 py-3 text-[14px] font-bold text-textmain no-underline transition-colors hover:bg-hover"
          >
            <Icon name="award" size={17} /> Passer un examen blanc
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
          {[
            { n: `${st.pct}%`, l: "du programme lu", c: "text-cyan" },
            { n: streak, l: `jour${streak > 1 ? "s" : ""} d'affilée`, c: "text-orange" },
            { n: st.doneCourses, l: `cours terminé${st.doneCourses > 1 ? "s" : ""}`, c: "text-green" },
          ].map((s, i) => (
            <div key={i} className="flex items-baseline gap-2">
              <span className={`text-stat text-[26px] leading-none ${s.c}`}>{s.n}</span>
              <span className="text-[12.5px] text-textmuted">{s.l}</span>
            </div>
          ))}
        </div>
      </header>

      <div className="relative mb-12 overflow-hidden border-y border-borderline bg-secondary py-2.5">
        <div className="animate-marquee flex w-max whitespace-nowrap">
          {[0, 1].map((dup) => (
            <div key={dup} aria-hidden={dup === 1} className="flex items-center">
              {TOPICS.map((t) => (
                <span key={`${dup}-${t}`} className="mx-5 flex items-center gap-5 text-[11.5px] font-semibold tracking-wide text-textmuted uppercase">
                  {t} <span className="text-violet">·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {resume && (
        <div className="rise rise-1 mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[12px] border border-edgecyan bg-tintcyan p-5 max-sm:p-4">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-extrabold tracking-wider text-cyan uppercase">Reprendre la lecture</div>
            <div className="mt-1.5 truncate text-h3">{resume.lesson.title}</div>
            <div className="text-xs text-textmuted">
              {resume.course.title} · Leçon {resume.index + 1} sur {resume.course.lessons.length}
            </div>
            <div className="mt-3 max-w-[380px]">
              <ProgressBar pct={coursePct(resume.course)} h="h-2" />
            </div>
            <div className="mt-1.5 text-[11.5px] text-textmuted">{coursePct(resume.course)}% du cours lu</div>
          </div>
          <Link href={`#/lesson/${resume.course.id}/${resume.index}`} className="inline-flex items-center gap-2 rounded-[10px] bg-cyan px-4 py-2.5 text-sm font-bold text-onaccent no-underline transition-opacity hover:opacity-90">
            <Icon name="play" size={18} /> Continuer
          </Link>
        </div>
      )}

      <SectionTitle link="Tout voir" linkHref="#/courses" className="mt-14">Vos cours</SectionTitle>
      <div className="rise rise-2 grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {ALL_COURSES.map((c) => <CourseCard key={c.id} c={c} />)}
      </div>

      <SectionTitle className="mt-16">Votre activité</SectionTitle>
      <div className="rise rise-3 grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-2">
        {stats.map((s, i) => (
          <Card key={i} className="card-lift flex items-center gap-3.5 p-4">
            <span className={`hex flex h-11 w-11 shrink-0 items-center justify-center ${s.chip}`}>
              <Icon name={s.icon} size={19} className={s.color} />
            </span>
            <div className="min-w-0">
              <div className={`text-stat text-[24px] leading-none ${s.color}`}>{s.num}</div>
              <div className="mt-1 text-[11.5px] text-textmuted">{s.lbl}</div>
            </div>
          </Card>
        ))}
      </div>

      {recentItems.length > 0 && (
        <>
          <SectionTitle className="mt-16">Dernières leçons consultées</SectionTitle>
          <Card className="rise rise-4 p-2">{recentItems}</Card>
        </>
      )}

      <div className="h-10" />
    </div>
  );
}
