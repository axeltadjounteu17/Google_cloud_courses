import React, { useEffect, useRef, useState } from "react";
import Icon from "../lib/icons.jsx";
import { Link } from "../lib/router.jsx";
import { Badge, Breadcrumb, Card, EmptyState } from "../components/ui.jsx";
import {
  SECTIONS, PASS_MARK, buildSession, gradeSession, requiredPicks,
  saveAttempt, caseStudyById, questionById, fmtClock, fmtDuration,
} from "../lib/exam.js";

const LETTER = (i) => String.fromCharCode(65 + i);

// Classes statiques : Tailwind ne résout pas `bg-${var}` à la compilation.
const TONE = {
  green: { chip: "bg-green/15 text-green", text: "text-green" },
  yellow: { chip: "bg-yellow/15 text-yellow", text: "text-yellow" },
  red: { chip: "bg-red/15 text-red", text: "text-red" },
};

function OptionRow({ letter, text, state, onClick, disabled }) {
  const tone = {
    idle: "border-borderline bg-transparent text-textmuted hover:border-blue/45 hover:bg-hover",
    picked: "border-blue bg-blue/10 text-textmain",
    correct: "border-green bg-green/10 text-textmain",
    wrong: "border-red bg-red/10 text-textmain",
    missed: "border-green/40 bg-transparent text-textmain",
  }[state];
  const badge = {
    idle: "border-borderline text-textmuted",
    picked: "border-blue text-blue",
    correct: "border-green bg-green text-[#06110c]",
    wrong: "border-red bg-red text-white",
    missed: "border-green text-green",
  }[state];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-start gap-3 rounded-[12px] border px-4 py-3 text-left text-[14px] leading-snug transition-colors ${tone} ${disabled ? "cursor-default" : ""}`}
    >
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${badge}`}>
        {state === "correct" ? <Icon name="check" size={12} /> : state === "wrong" ? <Icon name="x" size={12} /> : letter}
      </span>
      <span className="min-w-0 flex-1">{text}</span>
    </button>
  );
}

function Explanation({ q, order, picked }) {
  const expected = new Set(q.answer);
  return (
    <div className="mt-4 rounded-[12px] border border-borderline bg-hover/40 p-4">
      <div className="mb-2 flex items-center gap-2 text-[11px] font-bold tracking-wider text-textmuted uppercase">
        <Icon name="sparkles" size={13} /> Pourquoi
      </div>
      <p className="text-[13.5px] leading-relaxed text-textmain">{q.explanation}</p>

      <div className="mt-3.5 flex flex-col gap-2">
        {order.map((orig, di) => {
          const good = expected.has(orig);
          const chosen = picked.includes(di);
          return (
            <div key={di} className="flex gap-2.5 text-[12.5px] leading-snug">
              <span className={`mt-px shrink-0 font-bold ${good ? "text-green" : chosen ? "text-red" : "text-textmuted"}`}>
                {LETTER(di)}.
              </span>
              <span className={good ? "text-textmain" : "text-textmuted"}>{q.why[orig]}</span>
            </div>
          );
        })}
      </div>

      {(q.refs?.length || q.note) && (
        <div className="mt-3.5 border-t border-borderline pt-3">
          {q.refs?.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-textmuted uppercase">Voir</span>
              {q.refs.map((r) => (
                <span key={r} className="rounded-full bg-hover px-2 py-0.5 text-[11px] text-textmuted">{r}</span>
              ))}
            </div>
          )}
          {q.note && <p className="mt-2 text-[11.5px] leading-snug text-textmuted italic">{q.note}</p>}
        </div>
      )}
    </div>
  );
}

function Results({ session, result, elapsed, onRestart }) {
  const tone = TONE[result.passed ? "green" : result.score >= 50 ? "yellow" : "red"];
  const [open, setOpen] = useState(() => new Set());
  const toggle = (id) => setOpen((s) => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });
  const wrong = result.details.filter((d) => !d.correct);

  return (
    <div>
      <Card className="p-6 text-center max-sm:p-4">
        <span className={`mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] ${tone.chip}`}>
          <Icon name={result.passed ? "award" : "target"} size={30} />
        </span>
        <div className={`mt-3 text-[34px] leading-none font-bold ${tone.text}`}>{result.score} %</div>
        <div className="mt-2 text-[15px] font-bold">
          {result.passed ? "Objectif atteint" : "En dessous du seuil d'entraînement"}
        </div>
        <div className="mt-1 text-[13px] text-textmuted">
          {result.correct} / {result.total} bonnes réponses
          {result.skipped > 0 && ` · ${result.skipped} non répondue(s)`}
          {" · "}{fmtDuration(elapsed)} · seuil {PASS_MARK} %
        </div>

        <div className="mx-auto mt-5 max-w-[440px] text-left">
          <div className="mb-2 text-[11px] font-bold tracking-wider text-textmuted uppercase">Par section</div>
          <div className="flex flex-col gap-2">
            {SECTIONS.map((s) => {
              const v = result.perSection[s.id];
              if (!v || !v.total) return null;
              const pct = Math.round((v.correct / v.total) * 100);
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="w-[132px] shrink-0 truncate text-[12px] text-textmuted">S{s.id} {s.short}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-hover">
                    <div
                      className={`h-full rounded-full ${pct >= PASS_MARK ? "bg-green" : pct >= 50 ? "bg-yellow" : "bg-red"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-[62px] shrink-0 text-right text-[12px] font-bold">{v.correct}/{v.total}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onRestart}
            className="inline-flex items-center gap-2 rounded-[10px] border border-borderline px-4 py-2.5 text-sm font-bold text-textmain transition-colors hover:bg-hover"
          >
            <Icon name="rotate" size={15} /> Refaire
          </button>
          {wrong.length > 0 && (
            <Link
              href="#/exam/run/review"
              className="inline-flex items-center gap-2 rounded-[10px] bg-yellow px-4 py-2.5 text-sm font-bold text-[#1c1400] no-underline transition-opacity hover:opacity-90"
            >
              <Icon name="target" size={15} /> Rejouer mes {wrong.length} erreur(s)
            </Link>
          )}
          <Link
            href="#/exam"
            className="inline-flex items-center gap-2 rounded-[10px] bg-blue px-4 py-2.5 text-sm font-bold text-white no-underline transition-opacity hover:opacity-90"
          >
            <Icon name="award" size={15} /> Mode Examen
          </Link>
        </div>
      </Card>

      <h2 className="mt-8 mb-3 text-[17px] font-semibold">
        Correction détaillée{wrong.length > 0 && <span className="ml-2 text-[13px] font-normal text-textmuted">({wrong.length} à revoir)</span>}
      </h2>

      <div className="flex flex-col gap-2.5">
        {result.details.map((d, i) => {
          const isOpen = open.has(d.id);
          return (
            <Card key={d.id} className="overflow-hidden">
              <button onClick={() => toggle(d.id)} className="flex w-full items-start gap-3 p-4 text-left">
                <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${d.correct ? "bg-green/15 text-green" : d.answered ? "bg-red/15 text-red" : "bg-hover text-textmuted"}`}>
                  <Icon name={d.correct ? "check" : d.answered ? "x" : "help-circle"} size={13} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-[10.5px] font-bold tracking-wider text-textmuted uppercase">
                      {i + 1} · {d.question.id} · S{d.question.section} · {d.question.objective}
                    </span>
                    {d.question.caseStudy && (
                      <Badge color="violet">{caseStudyById(d.question.caseStudy)?.name}</Badge>
                    )}
                    {d.question.official && <Badge color="cyan">Officielle</Badge>}
                  </span>
                  <span className="mt-1 block text-[13.5px] leading-snug font-semibold">{d.question.q}</span>
                </span>
                <Icon name={isOpen ? "chevron-left" : "chevron-right"} size={16} className="mt-1 shrink-0 text-textmuted" />
              </button>
              {isOpen && (
                <div className="border-t border-borderline p-4 pt-3.5">
                  <div className="flex flex-col gap-2">
                    {d.order.map((orig, di) => {
                      const good = d.question.answer.includes(orig);
                      const chosen = d.picked.includes(di);
                      const state = good && chosen ? "correct" : good ? "missed" : chosen ? "wrong" : "idle";
                      return (
                        <OptionRow key={di} letter={LETTER(di)} text={d.question.options[orig]} state={state} disabled />
                      );
                    })}
                  </div>
                  <Explanation q={d.question} order={d.order} picked={d.picked} />
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function ExamRunner({ mode, target }) {
  const [session, setSession] = useState(() => buildSession(mode, target));
  const [answers, setAnswers] = useState({});
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(() => new Set());
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(Date.now());
  const savedRef = useRef(false);

  const ids = session.questionIds;
  const nb = ids.length;
  const qid = ids[idx];

  // Chrono
  useEffect(() => {
    if (finished) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [finished]);

  const remaining = session.timed ? session.minutes * 60 - elapsed : null;

  const finish = () => {
    const r = gradeSession(session, answers);
    setResult(r);
    setFinished(true);
    if (!savedRef.current) {
      savedRef.current = true;
      saveAttempt(session, r, Math.floor((Date.now() - startedAt.current) / 1000));
    }
  };

  // Fin de temps
  useEffect(() => {
    if (session.timed && remaining != null && remaining <= 0 && !finished) finish();
  }, [remaining, finished]);

  const restart = () => {
    setSession(buildSession(mode, target));
    setAnswers({});
    setIdx(0);
    setRevealed(new Set());
    setFinished(false);
    setResult(null);
    setElapsed(0);
    startedAt.current = Date.now();
    savedRef.current = false;
    window.scrollTo(0, 0);
  };

  if (!nb) {
    return (
      <div className="container mx-auto max-w-[820px]">
        <Breadcrumb items={[{ label: "Examen", href: "#/exam" }, { label: session.label }]} />
        <EmptyState title="Aucune question pour ce mode" sub="Terminez une session d'examen pour alimenter la liste de vos erreurs." />
      </div>
    );
  }

  if (finished && result) {
    return (
      <div className="container mx-auto max-w-[820px]">
        <div className="mb-4">
          <Breadcrumb items={[{ label: "Examen", href: "#/exam" }, { label: "Résultat" }]} />
          <h1 className="text-h2 leading-snug text-blue">{session.label}</h1>
        </div>
        <Results session={session} result={result} elapsed={elapsed} onRestart={restart} />
      </div>
    );
  }

  const question = questionById(qid);
  const order = session.order[qid];
  const picked = answers[qid] || [];
  const need = requiredPicks(question);
  const isRevealed = revealed.has(qid);
  const graded = isRevealed;
  const answeredCount = Object.values(answers).filter((a) => a.length > 0).length;
  const cs = question.caseStudy ? caseStudyById(question.caseStudy) : null;

  const pick = (di) => {
    if (graded) return;
    setAnswers((a) => {
      const cur = a[qid] || [];
      if (need === 1) return { ...a, [qid]: cur[0] === di ? [] : [di] };
      if (cur.includes(di)) return { ...a, [qid]: cur.filter((x) => x !== di) };
      if (cur.length >= need) return a; // pas plus de réponses que demandé
      return { ...a, [qid]: [...cur, di] };
    });
  };

  const reveal = () => setRevealed((s) => new Set(s).add(qid));
  const go = (n) => { setIdx(Math.max(0, Math.min(nb - 1, n))); window.scrollTo(0, 0); };

  const stateOf = (di) => {
    const orig = order[di];
    const good = question.answer.includes(orig);
    const chosen = picked.includes(di);
    if (!graded) return chosen ? "picked" : "idle";
    if (good && chosen) return "correct";
    if (good) return "missed";
    if (chosen) return "wrong";
    return "idle";
  };

  const lowTime = session.timed && remaining != null && remaining <= 300;

  return (
    <div className="container mx-auto max-w-[820px]">
      <div className="mb-4">
        <Breadcrumb items={[{ label: "Examen", href: "#/exam" }, { label: session.label }]} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-h3 leading-snug text-blue">{session.label}</h1>
          {session.timed && (
            <span className={`inline-flex items-center gap-1.5 rounded-[9px] px-2.5 py-1.5 font-mono text-[14px] font-bold tabular-nums ${lowTime ? "bg-red/15 text-red" : "bg-hover text-textmain"}`}>
              <Icon name="clock" size={14} /> {fmtClock(remaining)}
            </span>
          )}
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-borderline">
          <div className="h-full rounded-full bg-blue transition-[width] duration-300" style={{ width: `${((idx + 1) / nb) * 100}%` }} />
        </div>
        <span className="shrink-0 text-[11.5px] text-textmuted tabular-nums">{answeredCount}/{nb} répondues</span>
      </div>

      <Card className="p-6 max-sm:p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold tracking-wider text-textmuted uppercase">
            Question {idx + 1} / {nb}
          </span>
          <Badge color="cyan">S{question.section} · {question.objective}</Badge>
          {question.multi && <Badge color="orange">2 réponses</Badge>}
          {question.official && <Badge color="green">Officielle</Badge>}
        </div>

        {cs && (
          <Link
            href={`#/case/${cs.id}`}
            className="mb-3 flex items-center gap-2 rounded-[10px] border border-violet/30 bg-violet/5 px-3 py-2 text-[12.5px] font-semibold text-violet no-underline transition-colors hover:bg-violet/10"
          >
            <Icon name="book-open" size={14} />
            Étude de cas : {cs.name}
            <span className="ml-auto text-[11px] font-normal opacity-80">Relire le contexte ›</span>
          </Link>
        )}

        <p className="mb-4 text-[15.5px] leading-relaxed font-semibold">{question.q}</p>

        <div className="flex flex-col gap-2.5">
          {order.map((orig, di) => (
            <OptionRow
              key={di}
              letter={LETTER(di)}
              text={question.options[orig]}
              state={stateOf(di)}
              onClick={() => pick(di)}
              disabled={graded}
            />
          ))}
        </div>

        {!graded && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11.5px] text-textmuted">
              {need > 1 ? `Sélectionnez ${need} réponses (${picked.length}/${need}).` : "Sélectionnez une réponse."}
            </span>
            <button
              onClick={reveal}
              disabled={picked.length === 0}
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-blue/50 px-3.5 py-2 text-[12.5px] font-bold text-blue transition-colors hover:bg-blue/10 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <Icon name="check" size={13} /> Vérifier
            </button>
          </div>
        )}

        {graded && <Explanation q={question} order={order} picked={picked} />}
      </Card>

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          onClick={() => go(idx - 1)}
          disabled={idx === 0}
          className="inline-flex h-11 items-center gap-1.5 rounded-[10px] border border-borderline px-4 text-sm font-bold text-textmain transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-35"
        >
          <Icon name="chevron-left" size={16} /> Précédent
        </button>

        {idx === nb - 1 ? (
          <button
            onClick={finish}
            className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-green px-5 text-sm font-bold text-[#06110c] transition-opacity hover:opacity-90"
          >
            <Icon name="award" size={16} /> Terminer et corriger
          </button>
        ) : (
          <button
            onClick={() => go(idx + 1)}
            className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-blue px-5 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            Suivant <Icon name="chevron-right" size={16} />
          </button>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {ids.map((id, i) => {
          const done = (answers[id] || []).length > 0;
          return (
            <button
              key={id}
              onClick={() => go(i)}
              title={`Question ${i + 1}`}
              className={`h-7 w-7 rounded-[7px] text-[11px] font-bold tabular-nums transition-colors ${
                i === idx ? "bg-blue text-white"
                : revealed.has(id) ? "bg-hover text-textmain ring-1 ring-blue/40"
                : done ? "bg-hover text-textmain"
                : "border border-borderline text-textmuted hover:bg-hover"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {nb > 1 && (
        <button onClick={finish} className="mt-5 text-[12.5px] font-semibold text-textmuted hover:text-textmain">
          Terminer maintenant et voir le résultat
        </button>
      )}
    </div>
  );
}
