import React from "react";
import Icon from "../lib/icons.jsx";
import { useStore } from "../lib/store.jsx";
import { Link } from "../lib/router.jsx";
import { DeckGrid, ResourcesGrid } from "../components/cards.jsx";
import { Card, Badge, Breadcrumb, EmptyState, ProgressBar } from "../components/ui.jsx";
import QUIZ from "../data/quizzes.js";

export default function CourseDetail({ id }) {
  const store = useStore();
  const { findCourse, slideForCourse, slidesTotal, progress, position, markAll, unmarkAll, isBookmarked } = store;
  const c = findCourse(id);
  const quizCourse = (QUIZ.quizzes || []).find((q) => q.folder === c?.folder);

  if (!c) return (
    <div className="container mx-auto max-w-[1080px]"><EmptyState title="Cours introuvable" sub="" /></div>
  );

  if (c.slideCourse) {
    const s = slideForCourse(c.id);
    const total = slidesTotal(c.id);
    return (
      <div className="container mx-auto max-w-[1080px]">
        <Card className="mb-5 p-6 max-sm:p-4">
          <Breadcrumb items={[{ label: "Cours", href: "#/courses" }, { label: c.title }]} />
          <div className="mb-2 flex items-center gap-3">
            <span className="flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-violet/15 text-violet"><Icon name={c.icon} size={22} /></span>
            <h1 className="text-[22px]">{c.title}</h1>
          </div>
          <div className="mb-3 flex flex-wrap gap-2.5">
            <Badge color="violet">Diapositives du cours</Badge>
            <Badge>{s.decks.length} modules</Badge>
            <Badge>{total} diapositives</Badge>
          </div>
          <p className="text-sm text-textmuted">Transcripts des modules {c.title} — schémas, titres et points clés, entièrement en français.</p>
        </Card>
        <DeckGrid cid={c.id} />
        <ResourcesGrid resources={c.resources} />
      </div>
    );
  }

  const pct = store.coursePct(c);
  const done = store.courseRead(c);
  const p = progress[String(c.id)] || {};
  const hasSlides = !!slideForCourse(c.id);

  return (
    <div className="container mx-auto max-w-[1080px]">
      <Card className="mb-5 p-6 max-sm:p-4">
        <Breadcrumb items={[{ label: "Cours", href: "#/courses" }, { label: c.title }]} />
        <div className="mb-2 flex items-center gap-3">
          <span className="flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-violet/15 text-violet"><Icon name={c.icon} size={22} /></span>
          <h1 className="text-[22px]">{c.title}</h1>
        </div>
        <div className="mb-4 flex flex-wrap gap-2.5">
          <Badge color="violet">{c.mode === "atelier" ? "Ateliers pratiques" : "Transcript vidéo"}</Badge>
          {c.level && <Badge>{c.level}</Badge>}
          {c.hours && <Badge>{c.hours}</Badge>}
          <Badge>{c.lessons.length} leçons</Badge>
          {hasSlides && <Badge color="violet">{slidesTotal(c.id)} diapositives</Badge>}
        </div>
        <div className="mb-3.5">
          <ProgressBar pct={pct} />
          <span className="mt-2 block text-[11px] text-textmuted">{done} / {c.lessons.length} leçons lues · {pct}%</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {position.courseId === c.id && position.lessonIdx != null && c.lessons[position.lessonIdx] && (
            <Link href={`#/lesson/${c.id}/${position.lessonIdx}`} className="inline-flex items-center gap-2 rounded-[10px] bg-violet px-4 py-2.5 text-sm font-bold text-white no-underline shadow-[0_6px_18px_-8px_rgba(124,92,255,0.7)] transition-opacity hover:opacity-90">
              <Icon name="play" size={15} /> Continuer la lecture
            </Link>
          )}
          <button onClick={() => markAll(c)} className="inline-flex items-center gap-2 rounded-[10px] border border-borderline bg-transparent px-4 py-2.5 text-sm font-bold text-textmain transition-colors hover:bg-hover">
            <Icon name="check" size={14} /> Tout marquer comme lu
          </button>
          <button onClick={() => unmarkAll(c)} className="inline-flex items-center gap-2 rounded-[10px] border border-borderline bg-transparent px-4 py-2.5 text-sm font-bold text-textmain transition-colors hover:bg-hover">
            Réinitialiser
          </button>
          {quizCourse && (
            <Link href={`#/quiz/${quizCourse.courseId}`} className="inline-flex items-center gap-2 rounded-[10px] bg-violet/15 px-4 py-2.5 text-sm font-bold text-violet no-underline transition-colors hover:bg-violet/25">
              <Icon name="target" size={15} /> Quiz du cours
            </Link>
          )}
        </div>
      </Card>

      {hasSlides && (
        <>
          <div className="mb-3.5 mt-7 flex items-baseline justify-between gap-2">
            <h2 className="text-[17px] font-semibold">Diapositives du cours</h2>
            <Link href={`#/slides/${c.id}`} className="text-[13px] font-semibold text-cyan no-underline">Tout voir</Link>
          </div>
          <p className="mb-4 text-sm text-textmuted">Schémas d'architecture, titres et points clés des modules — en français.</p>
          <DeckGrid cid={c.id} />
        </>
      )}

      <ResourcesGrid resources={c.resources} />

      <div className="mb-3.5 mt-7"><h2 className="text-[17px] font-semibold">Leçons du cours</h2></div>
      <div className="flex flex-col gap-1">
        {c.lessons.map((l, i) => {
          const read = !!p[i];
          const isPos = position.courseId === c.id && position.lessonIdx === i;
          return (
            <Link key={i} href={`#/lesson/${c.id}/${i}`} className="flex items-center gap-3.5 rounded-xl border border-borderline bg-secondary p-3.5 no-underline transition-colors hover:bg-hover max-sm:gap-2.5 max-sm:p-3">
              <span className={`inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${read ? "border-green bg-green text-[#06110c]" : "border-borderline text-transparent"}`}>
                {read && <Icon name="check" size={12} />}
              </span>
              <span className="w-[26px] font-mono text-xs text-textmuted">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-sm font-semibold">
                  <span className="truncate">{l.title}</span>
                  {isBookmarked(c.id, i) && <Icon name="bookmark" size={13} className="shrink-0 text-yellow" />}
                </div>
                <div className="mt-0.5 text-[11.5px] text-textmuted">
                  {l.segments.length} segments{l.segments[0] && l.segments[0].t ? " · horodaté" : ""}{isPos ? " · en cours de lecture" : ""}
                </div>
              </span>
              {read ? <Badge color="green">Lue</Badge> : <Badge>À lire</Badge>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
