import React, { useEffect, useRef } from "react";
import Icon from "../lib/icons.jsx";
import { useStore, fmtTime } from "../lib/store.jsx";
import { Link } from "../lib/router.jsx";
import { Badge, Breadcrumb, EmptyState } from "../components/ui.jsx";

export default function LessonReader({ cid, lidx }) {
  const store = useStore();
  const { findCourse, deckForLesson, setLessonPos, toggleRead, setRead, setSettings, settings, toggleBookmark, isBookmarked } = store;
  const c = findCourse(cid);
  const lesson = c ? c.lessons[lidx] : null;
  const didSet = useRef(false);

  useEffect(() => {
    if (!c || !lesson) return;
    if (!didSet.current) {
      didSet.current = true;
      setLessonPos(c.id, lidx);
    }
    // restauration scroll
    const saved = Number(localStorage.getItem(`gcp_scroll_${c.id}_${lidx}`) || 0);
    if (saved) window.scrollTo(0, saved);
    const onScroll = () => localStorage.setItem(`gcp_scroll_${c.id}_${lidx}`, String(window.scrollY));
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [c, lesson, lidx, setLessonPos]);

  const read = !!((store.progress[String(c.id)] || {})[lidx]);
  const marked = c ? isBookmarked(c.id, lidx) : false;
  const prev = lidx > 0 && c ? c.lessons[lidx - 1] : null;
  const next = lidx < (c ? c.lessons.length - 1 : -1) ? c.lessons[lidx + 1] : null;
  const deck = c ? deckForLesson(c.id, lidx) : null;

  const goNext = () => {
    setRead(c.id, lidx, true);
    if (next) location.hash = `#/lesson/${c.id}/${lidx + 1}`;
    else location.hash = `#/course/${c.id}`;
  };
  const goPrev = () => location.hash = `#/lesson/${c.id}/${lidx - 1}`;

  useEffect(() => {
    if (!c || !prev) return;
    const onKey = (e) => {
      if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
      if (e.key === "ArrowLeft") goPrev();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [c, lidx, prev]);

  useEffect(() => {
    if (!c) return;
    const onKey = (e) => {
      if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
      if (e.key === "ArrowRight") goNext();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [c, lidx, next]);

  if (!c || !lesson) return <div className="container mx-auto max-w-[820px]"><EmptyState title="Leçon introuvable" sub="" /></div>;

  const fontSizes = { sm: "text-[13px] leading-relaxed", md: "text-[15px] leading-relaxed", lg: "text-[17px] leading-[1.75]" };

  return (
    <div className="container mx-auto max-w-[820px]">
      <div className="mb-5">
        <Breadcrumb items={[{ label: c.title, href: `#/course/${c.id}` }, { label: `Leçon ${lidx + 1} / ${c.lessons.length}` }]} />
        <h1 className="mb-3.5 text-2xl leading-snug">{lesson.title}</h1>
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge color={read ? "green" : "violet"}>{read ? "Leçon lue" : `Leçon ${lidx + 1} / ${c.lessons.length}`}</Badge>
          <button
            onClick={() => toggleBookmark(c.id, lidx)}
            className={`inline-flex items-center gap-2 rounded-[10px] border px-4 py-2.5 text-sm font-bold transition-colors ${
              marked ? "border-yellow/40 bg-yellow/15 text-yellow hover:bg-yellow/25" : "border-borderline bg-transparent text-textmain hover:bg-hover"
            }`}
          >
            <Icon name="bookmark" size={15} /> {marked ? "Marquée à réviser" : "À réviser"}
          </button>
          <button
            onClick={() => setSettings((s) => ({ ...s, timestamps: !s.timestamps }))}
            className="inline-flex items-center gap-2 rounded-[10px] border border-borderline bg-transparent px-4 py-2.5 text-sm font-bold text-textmain transition-colors hover:bg-hover"
          >
            <Icon name="clock" size={15} /> Horodatages : {settings.timestamps ? "ON" : "OFF"}
          </button>
          {deck && (
            <Link href={`#/slide/${c.id}/${deck.id}/1`} className="inline-flex items-center gap-2 rounded-[10px] border border-borderline bg-transparent px-4 py-2.5 text-sm font-bold text-textmain no-underline transition-colors hover:bg-hover">
              <Icon name="layers" size={16} /> Slides du module
            </Link>
          )}
          <Link href={`#/course/${c.id}`} className="inline-flex items-center gap-2 rounded-[10px] border border-borderline bg-transparent px-4 py-2.5 text-sm font-bold text-textmain no-underline transition-colors hover:bg-hover">
            <Icon name="arrow-left" size={16} /> Liste
          </Link>
        </div>
      </div>

      <div className={`rounded-[14px] border border-borderline bg-secondary p-8 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.5)] max-lg:p-5 max-sm:p-3.5 ${fontSizes[settings.font] || fontSizes.md}`}>
        {lesson.segments.map((s, i) => {
          if (s.h) return <div key={i} className="mb-2.5 mt-5 font-bold text-cyan" style={{ fontSize: "1.02em" }}>{s.text}</div>;
          const time = s.t && settings.timestamps ? (
            <span className="mt-1 shrink-0 rounded-md border border-cyan/20 bg-cyan/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-cyan whitespace-nowrap">{fmtTime(s.t)}</span>
          ) : null;
          return (
            <div key={i} className="mb-3.5 flex items-start gap-3.5">
              {time}
              <div className="min-w-0">{s.text}</div>
            </div>
          );
        })}
      </div>

      {next ? (
        <Link
          href={`#/lesson/${c.id}/${lidx + 1}`}
          onClick={() => setRead(c.id, lidx, true)}
          className="mt-5 flex items-center justify-between gap-4 rounded-[14px] border border-borderline bg-secondary p-5 no-underline shadow-[0_8px_30px_-10px_rgba(0,0,0,0.5)] transition-colors hover:border-violet/40 hover:bg-hover max-sm:p-4"
        >
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-textmuted uppercase tracking-wide">À suivre</div>
            <div className="mt-1 truncate text-[15px] font-semibold text-textmain">{next.title}</div>
            <div className="mt-0.5 text-[12px] text-textmuted">Leçon {lidx + 2} / {c.lessons.length}</div>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet text-white"><Icon name="arrow-right" size={18} /></span>
        </Link>
      ) : (
        <div className="mt-5 flex items-center justify-between gap-4 rounded-[14px] border border-borderline bg-secondary p-5 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.5)] max-sm:p-4">
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-textmuted uppercase tracking-wide">Fin du cours</div>
            <div className="mt-1 text-[15px] font-semibold text-textmain">Vous avez terminé toutes les leçons.</div>
          </div>
          <Link href={`#/course/${c.id}`} className="inline-flex shrink-0 items-center gap-2 rounded-[10px] bg-violet px-4 py-2.5 text-sm font-bold text-white no-underline transition-opacity hover:opacity-90">
            <Icon name="check" size={14} /> Terminer
          </Link>
        </div>
      )}

      <div className="sticky bottom-3 z-20 mt-5 flex items-center justify-between gap-3 rounded-[14px] border border-borderline bg-bgsoft/80 p-3 shadow-[0_12px_34px_-14px_rgba(0,0,0,0.65)] backdrop-blur-xl max-sm:gap-2 max-sm:p-2.5">
        {prev ? (
          <Link href={`#/lesson/${c.id}/${lidx - 1}`} aria-label="Leçon précédente" className="inline-flex h-11 items-center gap-1.5 rounded-[10px] border border-borderline bg-transparent px-3.5 text-sm font-bold text-textmain no-underline transition-colors hover:bg-hover max-sm:px-3">
            <Icon name="chevron-left" size={16} /> <span className="max-sm:hidden">Précédent</span>
          </Link>
        ) : <span className="w-[110px] max-sm:hidden" />}

        <button
          onClick={() => toggleRead(c.id, lidx)}
          className={`inline-flex h-11 items-center gap-2 rounded-[10px] px-4 text-sm font-bold transition-opacity ${read ? "border border-borderline bg-transparent text-textmain hover:bg-hover" : "bg-green text-[#06110c] hover:opacity-90"}`}
        >
          <Icon name="check" size={15} /> {read ? "Marquée lue ✓" : "Marquer comme lue"}
        </button>

        {next ? (
          <button onClick={goNext} className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-violet px-4 text-sm font-bold text-white no-underline shadow-[0_6px_18px_-8px_rgba(124,92,255,0.7)] transition-opacity hover:opacity-90">
            Suivant <Icon name="chevron-right" size={16} />
          </button>
        ) : (
          <button onClick={goNext} className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-violet px-4 text-sm font-bold text-white no-underline shadow-[0_6px_18px_-8px_rgba(124,92,255,0.7)] transition-opacity hover:opacity-90">
            Terminer <Icon name="check" size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
