import React from "react";
import Icon from "../lib/icons.jsx";
import { Link } from "../lib/router.jsx";
import { useStore } from "../lib/store.jsx";
import { Badge, ProgressBar, Card } from "./ui.jsx";

export function CourseCard({ c }) {
  const { slidesTotal, slideForCourse, courseRead, coursePct } = useStore();

  if (c.slideCourse) {
    const total = slidesTotal(c.id);
    const decks = slideForCourse(c.id).decks.length;
    return (
      <Link href={`#/course/${c.id}`} className="card group flex flex-col gap-2.5 p-5 no-underline transition-transform duration-150 hover:-translate-y-[3px]">
        <div className="flex items-center justify-between">
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-blue/15 text-cyan"><Icon name={c.icon} size={22} /></div>
          <Badge color="cyan">Slides</Badge>
        </div>
        <div className="flex-1 text-[15px] font-bold leading-snug">{c.title}</div>
        <div className="text-xs text-textmuted">{decks} modules · {total} diapositives</div>
        <ProgressBar pct={0} h="h-1.25" />
      </Link>
    );
  }

  const pct = coursePct(c);
  const done = courseRead(c);
  const doneClass = done === c.lessons.length ? "green" : pct > 0 ? "blue" : "";
  const status = done === c.lessons.length ? "Terminé" : pct > 0 ? "En cours" : "À venir";
  return (
    <Link href={`#/course/${c.id}`} className="card group flex flex-col gap-2.5 p-5 no-underline transition-transform duration-150 hover:-translate-y-[3px]">
      <div className="flex items-center justify-between">
        <div className="flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-blue/15 text-cyan"><Icon name={c.icon} size={22} /></div>
        <Badge color={doneClass}>{status}</Badge>
      </div>
      <div className="flex-1 text-[15px] font-bold leading-snug">{c.title}</div>
      <div className="text-xs text-textmuted">{c.lessons.length} leçons · {done} lues{c.hours ? ` · ~${c.hours}` : ""}</div>
      <ProgressBar pct={pct} h="h-1.25" />
    </Link>
  );
}

export function DeckGrid({ cid }) {
  const { slideForCourse } = useStore();
  const s = slideForCourse(cid);
  if (!s || !s.decks.length) return null;
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3.5">
      {s.decks.map((d) => {
        const first = d.pages[0] ? d.pages[0].img : "";
        const range = d.lessonStart != null ? `Leçons ${d.lessonStart}–${d.lessonEnd}` : "";
        return (
          <Link key={d.id} href={`#/slide/${cid}/${d.id}/1`} className="card flex gap-3.5 p-3 no-underline transition-transform duration-150 hover:-translate-y-0.5">
            {first ? (
              <div className="h-[76px] w-[132px] shrink-0 overflow-hidden rounded-[10px] border border-borderline bg-hover">
                <img loading="lazy" src={first} alt="" className="block h-full w-full object-cover" />
              </div>
            ) : (
              <div className="flex h-[76px] w-[132px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-borderline bg-hover text-textmuted opacity-60">
                <Icon name="layers" size={26} />
              </div>
            )}
            <div className="flex min-w-0 flex-col justify-center gap-1.5">
              <div className="text-sm font-bold leading-snug">{d.title}</div>
              <div className="text-xs text-textmuted">{d.pages.length} diapositives{range ? ` · ${range}` : ""}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function ResourcesGrid({ resources }) {
  if (!resources || !resources.length) return null;
  return (
    <>
      <div className="mb-3.5 mt-7"><h2 className="text-[17px] font-semibold">Ressources &amp; liens</h2></div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3.5">
        {resources.map((r, i) => (
          <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="card flex gap-3.5 p-3 no-underline transition-transform duration-150 hover:-translate-y-0.5">
            <div className="flex h-[76px] w-[132px] shrink-0 items-center justify-center rounded-[10px] border border-borderline bg-hover text-textmuted opacity-60">
              <Icon name="link" size={22} />
            </div>
            <div className="flex min-w-0 flex-col justify-center gap-1.5">
              <div className="text-sm font-bold leading-snug">{r.title}</div>
              <div className="text-xs text-textmuted">Documentation officielle · nouvel onglet</div>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
