import React from "react";
import Icon from "../lib/icons.jsx";
import { useStore, buildResume } from "../lib/store.jsx";
import { Link } from "../lib/router.jsx";
import { Card, ProgressBar, SectionTitle } from "../components/ui.jsx";

export default function Progress() {
  const store = useStore();
  const { ALL_COURSES, globalStats, courseRead, coursePct } = store;
  const st = globalStats();
  const resume = buildResume(store);
  let next = null;
  if (resume) {
    if (resume.index + 1 < resume.course.lessons.length) {
      next = { course: resume.course, lesson: resume.course.lessons[resume.index + 1], index: resume.index + 1 };
    } else {
      const i = ALL_COURSES.findIndex((c) => c.id === resume.course.id);
      const nc = ALL_COURSES[i + 1];
      if (nc && nc.lessons.length) next = { course: nc, lesson: nc.lessons[0], index: 0 };
    }
  }

  return (
    <div className="ambient container mx-auto max-w-[1080px]">
      <h1 className="mb-1.5 text-h2 text-textmain">Progression</h1>
      <p className="mb-5 text-sm text-textmuted">Votre avancement vers la certification Google Cloud Professional Cloud Architect.</p>

      <Card className="mb-6 p-6 max-sm:p-4">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div className="text-[44px] leading-none font-extrabold tracking-tight text-textmain">{st.pct}%</div>
          <div className="text-sm text-textmuted">
            <strong className="text-textmain">{st.done}</strong> leçons lues sur {st.total} · <strong className="text-textmain">{st.doneCourses}</strong> cours terminés sur {st.courses}
          </div>
        </div>
        <ProgressBar pct={st.pct} />
        {next ? (
          <Link href={`#/lesson/${next.course.id}/${next.index}`} className="mt-5 inline-flex items-center gap-2 rounded-[8px] bg-textmain px-4 py-2.5 text-sm font-bold text-onaccent no-underline transition-opacity hover:opacity-90">
            <Icon name="play" size={18} /> Prochaine leçon : {next.lesson.title.slice(0, 46)}
          </Link>
        ) : (
          <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-textmain">
            <Icon name="check" size={16} /> Félicitations, tout est lu !
          </div>
        )}
      </Card>

      <SectionTitle>Détail par cours</SectionTitle>
      <div className="flex flex-col gap-2.5">
        {ALL_COURSES.map((c) => {
          const read = courseRead(c);
          const total = c.lessons.length;
          const pct = coursePct(c);
          return (
            <Link key={c.id} href={`#/course/${c.id}`} className="no-underline">
              <Card className="flex flex-wrap items-center gap-4 p-4.5 transition-colors hover:bg-hover max-sm:p-3.5">
                <span className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[4px] bg-hover text-textmain"><Icon name={c.icon} size={20} /></span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-bold">{c.title}</span>
                    <span className="text-[11.5px] text-textmuted">{read} / {total} leçons</span>
                  </div>
                  <ProgressBar pct={pct} />
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${read === total ? "bg-hover text-textmain" : read > 0 ? "bg-hover text-textmain" : "bg-hover text-textmuted"}`}>
                  {read === total ? "Terminé" : read > 0 ? "En cours" : "À commencer"}
                </span>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
