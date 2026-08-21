import React, { useEffect, useMemo, useRef, useState } from "react";
import Icon from "../lib/icons.jsx";
import { useStore } from "../lib/store.jsx";
import { Link } from "../lib/router.jsx";
import { stats as examStats, missedQuestionIds } from "../lib/exam.js";

/**
 * Notifications dérivées de l'état réel de l'étude.
 *
 * Rien n'est simulé : chaque entrée vient de la progression, des marque-pages,
 * de la série de jours ou de l'historique d'examen. Une notification qui
 * n'apporte pas d'action utile n'est pas affichée.
 */
function buildItems(store) {
  const items = [];
  const st = store.globalStats();
  const streak = store.computeStreak();
  const bookmarks = store.bookmarkedCount();

  const today = new Date();
  const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const studiedToday = (store.studyDays || []).includes(key);

  if (!studiedToday) {
    items.push({
      id: "streak",
      icon: "flame",
      label: streak > 0 ? "Série en jeu" : "Aucune session aujourd'hui",
      text: streak > 0
        ? `Vous êtes à ${streak} jour${streak > 1 ? "s" : ""} d'affilée. Lisez une leçon pour ne pas rompre la série.`
        : "Lisez une leçon aujourd'hui pour démarrer une série.",
      href: "#/courses",
      action: "Ouvrir les cours",
    });
  }

  let missed = 0;
  try {
    missed = missedQuestionIds().length;
  } catch {
    missed = 0;
  }
  if (missed > 0) {
    items.push({
      id: "missed",
      icon: "target",
      label: "Questions à rejouer",
      text: `${missed} question${missed > 1 ? "s" : ""} manquée${missed > 1 ? "s" : ""} lors de vos sessions d'examen.`,
      href: "#/exam/run/review",
      action: "Rejouer mes erreurs",
    });
  }

  if (bookmarks > 0) {
    items.push({
      id: "bookmarks",
      icon: "bookmark",
      label: "Marqué à réviser",
      text: `${bookmarks} leçon${bookmarks > 1 ? "s" : ""} en attente de relecture.`,
      href: "#/progress",
      action: "Voir la progression",
    });
  }

  let ex = { attempts: 0, last: null, best: 0 };
  try {
    ex = examStats();
  } catch {
    /* historique illisible : on n'affiche rien */
  }
  if (ex.attempts === 0) {
    items.push({
      id: "first-exam",
      icon: "award",
      label: "Examen blanc jamais tenté",
      text: "Une session chronométrée de 50 questions situe votre niveau réel.",
      href: "#/exam",
      action: "Passer un examen blanc",
    });
  } else if (ex.last != null && ex.last < 70) {
    items.push({
      id: "below-pass",
      icon: "chart",
      label: "Dernier score sous le seuil",
      text: `${ex.last} % à la dernière session, pour une cible de 70 %.`,
      href: "#/exam",
      action: "Refaire une session",
    });
  }

  if (st.total > 0 && st.done === st.total) {
    items.push({
      id: "done",
      icon: "check",
      label: "Programme terminé",
      text: "Toutes les leçons sont lues. Concentrez-vous sur les examens blancs.",
      href: "#/exam",
      action: "Mode Examen",
    });
  }

  return items;
}

export default function Notifications() {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const btnRef = useRef(null);

  const items = useMemo(
    () => buildItems(store),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.progress, store.studyDays, store.bookmarks, open]
  );

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (boxRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const n = items.length;

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={n > 0 ? `Notifications, ${n} en attente` : "Notifications, aucune en attente"}
        className={`relative flex h-9 w-9 items-center justify-center rounded-[4px] border transition-colors ${
          open ? "border-edgeaccent bg-tintaccent text-accent" : "border-transparent text-textmuted hover:bg-hover hover:text-textmain"
        }`}
      >
        <Icon name="bell" size={18} />
        {n > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-bg"
          />
        )}
      </button>

      {open && (
        <div
          ref={boxRef}
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-50 mt-2 w-[340px] max-w-[calc(100vw-2rem)] rounded-[8px] border border-borderline bg-panel"
        >
          <div className="flex items-center justify-between border-b border-borderline px-4 py-3">
            <span className="label-mono-sm text-textmuted">Notifications</span>
            <span className="label-mono-sm text-textmuted">{n} en attente</span>
          </div>

          {n === 0 ? (
            <div className="px-4 py-8 text-center">
              <Icon name="check" size={22} className="mx-auto text-textmuted" />
              <p className="mt-2.5 text-[13px] text-textmuted">
                Rien à signaler. Vous êtes à jour.
              </p>
            </div>
          ) : (
            <ul className="max-h-[380px] divide-y divide-borderline overflow-y-auto">
              {items.map((it) => (
                <li key={it.id}>
                  <Link
                    href={it.href}
                    onClick={() => setOpen(false)}
                    className="flex gap-3 px-4 py-3.5 no-underline transition-colors hover:bg-hover"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] bg-tintaccent text-accent">
                      <Icon name={it.icon} size={14} />
                    </span>
                    <span className="min-w-0">
                      <span className="label-mono-sm block text-textmuted">{it.label}</span>
                      <span className="mt-1 block text-[13px] leading-snug text-textmain">{it.text}</span>
                      <span className="mt-1.5 block text-[12px] font-semibold text-textmuted">
                        {it.action} &rarr;
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
