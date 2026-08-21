import React from "react";
import Icon from "../lib/icons.jsx";
import { useStore, buildResume } from "../lib/store.jsx";
import { Link } from "../lib/router.jsx";
import { CourseCard } from "../components/cards.jsx";
import { Card, Badge, SectionTitle, ProgressBar } from "../components/ui.jsx";
import Button from "../components/Button.jsx";

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
      <Link key={`${r.c}-${r.l}`} href={`#/lesson/${c.id}/${r.l}`} className="flex items-center gap-3 rounded-[8px] px-3.5 py-2.5 no-underline transition-colors hover:bg-hover">
        <span className={`inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${read ? "border-textmain bg-textmain text-onaccent" : "border-borderline text-transparent"}`}>
          {read && <Icon name="check" size={12} />}
        </span>
        <span className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-textmain">{l.title}</span>
            {marked && <Icon name="bookmark" size={12} className="shrink-0 text-textmain" />}
          </div>
          <div className="text-[11px] text-textmuted">{c.title}</div>
        </span>
        <Badge color="violet">{c.lessons.length} leçons</Badge>
      </Link>
    );
  }).filter(Boolean);

  const stats = [
    { icon: "book", chip: "bg-hover", color: "text-textmain", num: st.done, lbl: "Leçons lues" },
    { icon: "award", chip: "bg-hover", color: "text-textmain", num: st.doneCourses, lbl: "Cours terminés" },
    { icon: "flame", chip: "bg-hover", color: "text-textmain", num: streak, lbl: "Jours d'étude d'affilée" },
    { icon: "bookmark", chip: "bg-hover", color: "text-textmain", num: bookmarks, lbl: "Leçons à réviser" },
  ];

  return (
    <div className="ambient container mx-auto max-w-[1080px]">
      {/* Titre court puis sous-titre, comme « Welcome back. / Pick up exactly
          where you left off. » de la maquette de tableau de bord. */}
      <header className="rise pb-8">
        <h1 className="text-h1">Bon retour.</h1>
        <p className="mt-1.5 text-[15px] text-textmuted">
          {resume ? "Reprenez exactement où vous vous êtes arrêté." : "Choisissez un cours pour démarrer."}
        </p>
      </header>

      {/* Carte de reprise : bloc de progression à gauche, contenu à droite. */}
      <section className="rise rise-1">
        <Card className="p-6 max-sm:p-4">
          <div className="flex gap-6 max-md:flex-col max-md:gap-5">
            <div className="flex w-[260px] shrink-0 flex-col justify-center rounded-[4px] border border-borderline bg-bgsoft p-5 max-md:w-full">
              <span className="label-mono-sm text-textmuted">Progression globale</span>
              <span className="text-stat mt-2 text-[42px]">{st.pct}%</span>
              <div className="bar-track mt-3">
                <div className="bar-fill" style={{ width: `${st.pct}%` }} />
              </div>
              <span className="label-mono-sm mt-2.5 text-textmuted">
                {st.done} / {st.total} leçons
              </span>
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-center">
              {resume ? (
                <>
                  <span className="label-mono-sm text-textmuted">
                    Leçon {resume.index + 1} sur {resume.course.lessons.length}
                  </span>
                  <h2 className="text-h2 mt-2">{resume.lesson.title}</h2>
                  <p className="mt-1.5 text-[13.5px] text-textmuted">{resume.course.title}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-2.5">
                    <Button as="a" href={`#/lesson/${resume.course.id}/${resume.index}`} variant="primary" icon="play">
                      Continuer
                    </Button>
                    <Button as="a" href={`#/course/${resume.course.id}`} variant="outline" icon="book">
                      Voir le cours
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <span className="label-mono-sm text-textmuted">Aucune lecture en cours</span>
                  <h2 className="text-h2 mt-2">Préparez la certification Cloud Architect</h2>
                  <p className="mt-1.5 max-w-[52ch] text-[13.5px] leading-relaxed text-textmuted">
                    {st.courses} cours en français, {st.total} leçons, 71 questions type examen
                    corrigées et les quatre études de cas officielles.
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-2.5">
                    <Button as="a" href="#/courses" variant="primary" icon="play">
                      Commencer un cours
                    </Button>
                    <Button as="a" href="#/exam" variant="outline" icon="award">
                      Examen blanc
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>
      </section>

      <div className="relative mb-12 overflow-hidden border-y border-borderline bg-secondary py-2.5">
        <div className="animate-marquee flex w-max whitespace-nowrap">
          {[0, 1].map((dup) => (
            <div key={dup} aria-hidden={dup === 1} className="flex items-center">
              {TOPICS.map((t) => (
                <span key={`${dup}-${t}`} className="mx-5 flex items-center gap-5 text-[11.5px] font-semibold tracking-wide text-textmuted uppercase">
                  {t} <span className="text-textmain">·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {resume && (
        <div className="rise rise-1 mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[8px] border border-borderline bg-hover p-5 max-sm:p-4">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-extrabold tracking-wider text-textmain uppercase">Reprendre la lecture</div>
            <div className="mt-1.5 truncate text-h3">{resume.lesson.title}</div>
            <div className="text-xs text-textmuted">
              {resume.course.title} · Leçon {resume.index + 1} sur {resume.course.lessons.length}
            </div>
            <div className="mt-3 max-w-[380px]">
              <ProgressBar pct={coursePct(resume.course)} h="h-2" />
            </div>
            <div className="mt-1.5 text-[11.5px] text-textmuted">{coursePct(resume.course)}% du cours lu</div>
          </div>
          <Link href={`#/lesson/${resume.course.id}/${resume.index}`} className="inline-flex items-center gap-2 rounded-[8px] bg-textmain px-4 py-2.5 text-sm font-bold text-onaccent no-underline transition-opacity hover:opacity-90">
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
            <span className={`rounded-[4px] flex h-11 w-11 shrink-0 items-center justify-center ${s.chip}`}>
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
