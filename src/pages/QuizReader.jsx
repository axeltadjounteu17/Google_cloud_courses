import React, { useEffect, useMemo, useState } from "react";
import Icon from "../lib/icons.jsx";
import { useStore } from "../lib/store.jsx";
import { Link } from "../lib/router.jsx";
import { Badge, Breadcrumb, EmptyState } from "../components/ui.jsx";
import QUIZ from "../data/quizzes.js";

const MODES = [
  { k: "all", l: "Toutes" },
  { k: "flash", l: "Flashcards" },
  { k: "mcq", l: "QCM" },
];

export default function QuizReader({ qid }) {
  const store = useStore();
  const { ALL_COURSES } = store;
  const quiz = (QUIZ.quizzes || []).find((q) => q.courseId === Number(qid));
  const course = ALL_COURSES.find((c) => c.folder === quiz?.folder);
  const [mode, setMode] = useState("all");
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sel, setSel] = useState(null);
  const [known, setKnown] = useState({});

  const list = useMemo(
    () => (quiz ? quiz.questions.filter((q) => mode === "all" || (mode === "flash" ? q.type === "flash" : q.type !== "flash")) : []),
    [quiz, mode]
  );
  const nb = list.length;
  const q = list[idx];
  const isFlash = q && q.type === "flash";
  const nknown = list.reduce((n, x, i) => n + (known[i] ? 1 : 0), 0);

  useEffect(() => {
    setIdx(0);
    setFlipped(false);
    setSel(null);
  }, [mode, quiz]);

  const next = () => { if (!nb) return; setFlipped(false); setSel(null); setIdx((i) => Math.min(i + 1, nb)); };
  const prev = () => { if (!nb) return; setFlipped(false); setSel(null); setIdx((i) => Math.max(i - 1, 0)); };

  useEffect(() => {
    const onKey = (e) => {
      if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [nb, idx]);

  if (!quiz) return <div className="container mx-auto max-w-[820px]"><EmptyState title="Quiz introuvable" sub="" /></div>;

  const done = idx >= nb;

  const mark = (v) => {
    setKnown((k) => ({ ...k, [idx]: v }));
    setFlipped(false);
  };

  const restart = () => { setIdx(0); setFlipped(false); setSel(null); setKnown({}); };

  return (
    <div className="container mx-auto max-w-[760px]">
      <div className="mb-4">
        <Breadcrumb items={[{ label: "Quiz", href: "#/quiz" }, { label: quiz.title }]} />
        <h1 className="mb-3 text-2xl leading-snug text-orange">{quiz.title}</h1>
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge color="orange">{quiz.questions.length} questions</Badge>
          <div className="flex rounded-[10px] border border-borderline p-1">
            {MODES.map((m) => (
              <button
                key={m.k}
                onClick={() => setMode(m.k)}
                className={`rounded-[7px] px-3 py-1.5 text-[12.5px] font-bold transition-colors ${mode === m.k ? "bg-orange/15 text-orange" : "text-textmuted hover:text-textmain"}`}
              >
                {m.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4 h-[6px] overflow-hidden rounded-full bg-borderline">
        <div className="h-full rounded-full bg-orange transition-[width] duration-300" style={{ width: `${((done ? nb : idx) / nb) * 100}%` }} />
      </div>

      {done ? (
        <div className="rounded-[16px] border border-borderline bg-secondary p-8 text-center shadow-[0_8px_30px_-10px_rgba(0,0,0,0.5)] max-sm:p-5">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-green/15 text-green"><Icon name="check" size={30} /></span>
          <div className="mt-4 text-xl font-bold">Révision terminée</div>
          <div className="mt-1 text-sm text-textmuted">
            {nknown} / {nb} questions maîtrisées — vous avez parcouru toutes les questions de ce cours.
          </div>
          <div className="mx-auto mt-5 flex max-w-[260px]">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-hover">
              <div className="h-full rounded-full bg-gradient-to-r from-green to-cyan" style={{ width: `${nb ? (nknown / nb) * 100 : 0}%` }} />
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button onClick={restart} className="inline-flex items-center gap-2 rounded-[10px] border border-borderline bg-transparent px-4 py-2.5 text-sm font-bold text-textmain transition-colors hover:bg-hover">
              <Icon name="rotate" size={15} /> Recommencer
            </button>
            <Link href="#/quiz" className="inline-flex items-center gap-2 rounded-[10px] bg-orange px-4 py-2.5 text-sm font-bold text-[#241604] no-underline transition-opacity hover:opacity-90">
              <Icon name="book" size={15} /> Choisir un autre cours
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-[16px] border border-borderline bg-secondary p-6 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.5)] max-sm:p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="text-[11px] font-bold tracking-wider text-textmuted uppercase">Question {idx + 1} / {nb}</span>
            <Badge color={isFlash ? "orange" : "orange"}>{isFlash ? "Flashcard" : "QCM"}</Badge>
          </div>

          {isFlash ? (
            <div className="persp">
              <div
                onClick={() => setFlipped((f) => !f)}
                className={`preserve relative h-[320px] cursor-pointer max-sm:h-[300px] ${flipped ? "rotate-y-180" : ""}`}
              >
                <div className="backface-hidden absolute inset-0 flex flex-col items-center justify-center rounded-[14px] border border-borderline bg-hover/60 p-6 text-center">
                  <Icon name="target" size={22} className="text-orange" />
                  <div className="mt-3 text-[16px] leading-relaxed font-semibold">{q.q}</div>
                  <div className="mt-4 text-[11px] font-bold text-textmuted uppercase">Cliquez pour voir la réponse</div>
                </div>
                <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col items-center justify-center overflow-y-auto rounded-[14px] border border-orange/30 bg-orange/5 p-6 text-center">
                  <div className="text-[15px] leading-relaxed text-textmain">{q.answer || "Réponse non disponible."}</div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4 text-[16px] leading-relaxed font-semibold">{q.q}</div>
              <div className="flex flex-col gap-2.5">
                {(q.options || []).map((o, oi) => {
                  const selected = sel === oi;
                  return (
                    <button
                      key={oi}
                      onClick={() => setSel(oi)}
                      className={`flex items-start gap-3 rounded-[12px] border px-4 py-3 text-left text-[14px] leading-snug transition-colors ${
                        selected ? "border-orange bg-orange/10 text-textmain" : "border-borderline bg-transparent text-textmuted hover:border-orange/40 hover:bg-hover"
                      }`}
                    >
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${selected ? "border-orange text-orange" : "border-borderline text-textmuted"}`}>
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span className="min-w-0">{o}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 text-[11px] text-textmuted">Sélectionnez votre réponse, puis estimez si vous l'aviez correcte.</div>
            </div>
          )}

          {((isFlash && flipped) || (!isFlash && sel != null)) && (
            <div className="mt-5 flex items-center justify-center gap-3 border-t border-borderline pt-4">
              <div className="text-[12.5px] font-bold text-textmuted">Ma réponse :</div>
              <button
                onClick={() => mark(true)}
                className={`inline-flex items-center gap-1.5 rounded-[10px] border px-3.5 py-2 text-[12.5px] font-bold transition-colors ${known[idx] ? "border-green bg-green text-[#06110c]" : "border-borderline bg-transparent text-textmain hover:bg-hover"}`}
              >
                <Icon name="check" size={13} /> Je savais
              </button>
              <button
                onClick={() => mark(false)}
                className={`inline-flex items-center gap-1.5 rounded-[10px] border px-3.5 py-2 text-[12.5px] font-bold transition-colors ${known[idx] === false ? "border-red bg-red/15 text-red" : "border-borderline bg-transparent text-textmain hover:bg-hover"}`}
              >
                <Icon name="x" size={13} /> À revoir
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          onClick={prev}
          disabled={idx === 0}
          className="inline-flex h-11 items-center gap-1.5 rounded-[10px] border border-borderline bg-transparent px-4 text-sm font-bold text-textmain transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-35"
        >
          <Icon name="chevron-left" size={16} /> Précédent
        </button>
        <div className="hidden text-[11.5px] text-textmuted max-sm:block">
          <Icon name="check" size={11} /> {nknown} maîtrisées
        </div>
        <button
          onClick={next}
          disabled={done}
          className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-orange px-5 text-sm font-bold text-[#241604] shadow-[0_6px_18px_-8px_rgba(255,169,77,0.7)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
        >
          {idx === nb - 1 ? "Voir le résultat" : "Suivant"} <Icon name="chevron-right" size={16} />
        </button>
      </div>
      <div className="mt-2 text-center text-[11px] text-textmuted max-sm:hidden">Astuce : utilisez les flèches ← → du clavier.</div>
    </div>
  );
}
