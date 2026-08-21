import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "../lib/icons.jsx";
import { useStore } from "../lib/store.jsx";
import { Link } from "../lib/router.jsx";
import { Badge, Breadcrumb, EmptyState } from "../components/ui.jsx";

export default function SlideViewer({ cid, deckId, page }) {
  const { findCourse, deckById } = useStore();
  const c = findCourse(cid);
  const deck = deckById(cid, deckId);
  const n = deck && deck.pages.length ? deck.pages.length : 0;
  const p = n ? Math.max(1, Math.min(n, Number(page) || 1)) : 1;
  const pg = n ? deck.pages[p - 1] : null;
  const prevPage = p > 1 ? p - 1 : null;
  const nextPage = p < n ? p + 1 : null;
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    if (!deck) return;
    const onKey = (e) => {
      if (zoom && e.key === "Escape") { setZoom(false); return; }
      if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
      if (e.key === "ArrowLeft" && prevPage) location.hash = `#/slide/${cid}/${deck.id}/${prevPage}`;
      if (e.key === "ArrowRight" && nextPage) location.hash = `#/slide/${cid}/${deck.id}/${nextPage}`;
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [cid, deck?.id, prevPage, nextPage, zoom]);

  if (!c || !deck || !n) return <div className="container mx-auto max-w-[1080px]"><EmptyState title="Diapositive introuvable" sub="" /></div>;

  const navBtn = (target, iconName, label) =>
    target ? (
      <Link href={`#/slide/${cid}/${deck.id}/${target}`} aria-label={label} className="flex h-11 w-11 max-sm:h-9 max-sm:w-9 shrink-0 items-center justify-center rounded-full border border-borderline bg-hover text-textmain no-underline transition-colors hover:border-borderline hover:bg-hover">
        <Icon name={iconName} size={24} />
      </Link>
    ) : (
      <span className="flex h-11 w-11 max-sm:h-9 max-sm:w-9 shrink-0 items-center justify-center rounded-full border border-borderline bg-hover text-textmain opacity-35" aria-disabled="true">
        <Icon name={iconName} size={24} />
      </span>
    );

  return (
    <div className="container mx-auto max-w-[1100px]">
      <div className="mb-5">
        <Breadcrumb items={[{ label: `${c.title} · Diapositives`, href: `#/slides/${cid}` }, { label: deck.title }]} />
        <h1 className="mb-3.5 text-h2 leading-snug">{deck.title}</h1>
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge color="violet">Diapositive {p} / {n}</Badge>
          <Link href={`#/course/${cid}`} className="inline-flex items-center gap-2 rounded-[8px] border border-borderline bg-transparent px-4 py-2.5 text-sm font-bold text-textmain no-underline transition-colors hover:bg-hover">
            <Icon name="arrow-left" size={16} /> Cours
          </Link>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3.5 rounded-[8px] border border-borderline bg-secondary p-4 max-sm:gap-2 max-sm:p-2">
        {navBtn(prevPage, "chevron-left", "Précédente")}
        <button
          onClick={() => setZoom(true)}
          aria-label="Agrandir la diapositive"
          title="Cliquer pour agrandir"
          className="flex min-w-0 flex-1 cursor-zoom-in items-center justify-center bg-transparent p-0"
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={p}
              src={pg.img}
              alt={`${pg.title || deck.title} — diapositive ${p}`}
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="max-h-[76vh] max-w-full rounded-[8px] bg-white object-contain max-sm:max-h-[58vh]"
            />
          </AnimatePresence>
        </button>
        <button
          onClick={() => setZoom(true)}
          aria-label="Zoom plein écran"
          title="Zoom plein écran"
          className="icon-btn shrink-0"
        >
          <Icon name="maximize" size={20} />
        </button>
        {navBtn(nextPage, "chevron-right", "Suivante")}
      </div>

      <AnimatePresence>
        {zoom && pg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-bg p-4"
            onClick={() => setZoom(false)}
          >
            <div className="absolute right-4 top-4 flex items-center gap-2">
              <span className="rounded-full bg-hover px-3.5 py-1.5 text-sm font-bold text-textmain">Diapositive {p} / {n}</span>
              <button onClick={() => setZoom(false)} aria-label="Fermer le zoom" className="flex h-10 w-10 items-center justify-center rounded-full bg-hover text-textmain transition-colors hover:bg-active">
                <Icon name="x" size={20} />
              </button>
            </div>

            <motion.img
              key={p}
              src={pg.img}
              alt={`${pg.title || deck.title} — diapositive ${p}`}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[92vh] max-w-[96vw] rounded-[8px] bg-white object-contain"
            />

            {prevPage && (
              <Link
                href={`#/slide/${cid}/${deck.id}/${prevPage}`}
                onClick={(e) => e.stopPropagation()}
                aria-label="Diapositive précédente"
                className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-hover text-textmain no-underline transition-colors hover:bg-active max-sm:h-10 max-sm:w-10"
              >
                <Icon name="chevron-left" size={26} />
              </Link>
            )}
            {nextPage && (
              <Link
                href={`#/slide/${cid}/${deck.id}/${nextPage}`}
                onClick={(e) => e.stopPropagation()}
                aria-label="Diapositive suivante"
                className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-hover text-textmain no-underline transition-colors hover:bg-active max-sm:h-10 max-sm:w-10"
              >
                <Icon name="chevron-right" size={26} />
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {pg.bullets?.length ? (
        <div className="mb-4 rounded-[8px] border border-borderline bg-secondary p-5 max-sm:p-3.5">
          {pg.title && <h3 className="mb-3 text-[17px] font-semibold">{pg.title}</h3>}
          <ul className="list-none">
            {pg.bullets.map((b, i) => (
              <li key={i} className="relative border-b border-dashed border-borderline px-0 py-1.5 pl-5 text-[14.5px] leading-relaxed last:border-none">
                <span className="absolute left-1 top-[15px] h-[7px] w-[7px] rounded-[4px] bg-textmain" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mb-4 rounded-[8px] border border-borderline bg-secondary p-5">
          <p className="text-sm text-textmuted">Schéma — aucun texte exploitable sur cette diapositive.</p>
        </div>
      )}

      <div className="no-scrollbar mb-2 flex gap-2 overflow-x-auto px-0.5 pb-3.5">
        {deck.pages.map((x, i) => (
          <Link
            key={i}
            href={`#/slide/${cid}/${deck.id}/${i + 1}`}
            title={`Diapositive ${i + 1}`}
            className={`h-[70px] w-[124px] shrink-0 overflow-hidden rounded-[8px] border-2 transition-opacity max-sm:h-[56px] max-sm:w-[96px] ${
              i + 1 === p ? "border-textmain opacity-100" : "border-borderline opacity-75 hover:opacity-100 hover:border-borderline"
            }`}
          >
            <img loading="lazy" src={x.img} alt={`Diapositive ${i + 1}`} className="block h-full w-full object-cover" />
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap justify-between gap-3">
        {prevPage ? (
          <Link href={`#/slide/${cid}/${deck.id}/${prevPage}`} className="inline-flex items-center gap-2 rounded-[8px] border border-borderline bg-transparent px-4 py-2.5 text-sm font-bold text-textmain no-underline transition-colors hover:bg-hover">
            <Icon name="chevron-left" size={16} /> Diapositive {prevPage}
          </Link>
        ) : <span />}
        {nextPage ? (
          <Link href={`#/slide/${cid}/${deck.id}/${nextPage}`} className="inline-flex items-center gap-2 rounded-[8px] bg-textmain px-4 py-2.5 text-sm font-bold text-onaccent no-underline transition-opacity hover:opacity-90">
            Diapositive {nextPage} <Icon name="chevron-right" size={16} />
          </Link>
        ) : (
          <Link href={`#/slides/${cid}`} className="inline-flex items-center gap-2 rounded-[8px] border border-borderline bg-transparent px-4 py-2.5 text-sm font-bold text-textmain no-underline transition-colors hover:bg-hover">
            <Icon name="check" size={14} /> Fin du module
          </Link>
        )}
      </div>
    </div>
  );
}
