import React, { useState } from "react";
import Icon from "../lib/icons.jsx";
import { Link } from "../lib/router.jsx";
import { Badge, Card } from "../components/ui.jsx";
import {
  SECTIONS, CASE_STUDIES, MODES, PASS_MARK, FULL_EXAM_SIZE, FULL_EXAM_MINUTES,
  bankStats, stats, history, clearHistory, fmtDuration,
} from "../lib/exam.js";

function ScoreRing({ score, size = 74 }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const tone = score >= PASS_MARK ? "text-textmain" : score >= 50 ? "text-textmain" : "text-red";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} className="stroke-borderline" strokeWidth="6" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r} strokeWidth="6" fill="none" strokeLinecap="round"
          className={`${tone} transition-[stroke-dashoffset] duration-700`}
          stroke="currentColor" strokeDasharray={c} strokeDashoffset={c - (c * score) / 100}
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center text-[17px] font-bold ${tone}`}>{score}%</div>
    </div>
  );
}

// Classes statiques : Tailwind ne peut pas résoudre `bg-${var}` à la compilation.
const CASE_TONE = {
  violet: "bg-hover text-textmain",
  orange: "bg-hover text-textmain",
  cyan: "bg-hover text-textmain",
  green: "bg-hover text-textmain",
  blue: "bg-hover text-textmain",
};

function ModeCard({ mode, href, children, disabled }) {
  const m = MODES[mode];
  const inner = (
    <>
      <div className="flex items-start gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px]  ${disabled ? "bg-hover text-textmuted" : "bg-hover text-textmain"}`}>
          <Icon name={m.icon} size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <div className={`text-[15px] font-bold ${disabled ? "text-textmuted" : ""}`}>{m.label}</div>
          <div className="mt-0.5 text-[12.5px] leading-snug text-textmuted">{m.desc}</div>
        </div>
      </div>
      {children}
    </>
  );
  // Un état désactivé doit rester lisible : l'opacité globale rendait le texte
  // illisible et donnait l'impression d'un défaut d'affichage.
  if (disabled) {
    return <Card className="p-4">{inner}</Card>;
  }
  return (
    <Link
      href={href}
      className="block rounded-[8px] border border-borderline bg-secondary p-4 no-underline transition-colors hover:border-borderline hover:bg-hover"
    >
      {inner}
    </Link>
  );
}

export default function ExamHome() {
  const bank = bankStats();
  const st = stats();
  const [hist, setHist] = useState(() => history());

  const reset = () => {
    if (!confirm("Effacer tout l'historique des sessions d'examen ?")) return;
    clearHistory();
    setHist([]);
  };

  return (
    <div className="ambient container mx-auto max-w-[900px]">
      <div className="mb-5">
        <h1 className="text-h2 leading-snug text-textmain">Mode Examen</h1>
        <p className="mt-1.5 max-w-[640px] text-[13.5px] leading-relaxed text-textmuted">
          Questions de type examen pour la certification Professional Cloud Architect, ancrées sur
          les quatre études de cas officielles du guide v6.1. Correction automatique et justification
          de chaque option.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge color="blue">{bank.total} questions</Badge>
          <Badge color="violet">{CASE_STUDIES.length} études de cas</Badge>
          <Badge color="cyan">6 sections</Badge>
          <Badge color="orange">Réussite à {PASS_MARK} %</Badge>
        </div>
      </div>

      {st.attempts > 0 && (
        <Card className="mb-6 p-4">
          <div className="flex flex-wrap items-center gap-5">
            <ScoreRing score={st.last ?? 0} />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold tracking-wider text-textmuted uppercase">Dernier score</div>
              <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-[13px]">
                <span className="text-textmuted">Meilleur <b className="text-textmain">{st.best} %</b></span>
                <span className="text-textmuted">Moyenne <b className="text-textmain">{st.avg} %</b></span>
                <span className="text-textmuted">Sessions <b className="text-textmain">{st.attempts}</b></span>
                {st.missed > 0 && (
                  <span className="text-textmuted">À revoir <b className="text-textmain">{st.missed}</b></span>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
        <ModeCard mode="full" href="#/exam/run/full">
          <div className="mt-3 flex items-center gap-2 border-t border-borderline pt-3 text-[11.5px] text-textmuted">
            <Icon name="clock" size={13} /> {FULL_EXAM_SIZE} questions · {FULL_EXAM_MINUTES} min
          </div>
        </ModeCard>
        <ModeCard mode="review" href="#/exam/run/review" disabled={st.missed === 0}>
          <div className="mt-3 flex items-center gap-2 border-t border-borderline pt-3 text-[11.5px] text-textmuted">
            <Icon name="target" size={13} />
            {st.missed > 0 ? `${st.missed} question(s) à revoir` : "Aucune erreur enregistrée"}
          </div>
        </ModeCard>
      </div>

      <h2 className="mt-8 mb-3 text-[17px] font-semibold">Par section du guide d'examen</h2>
      <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
        {SECTIONS.map((s) => {
          const n = bank.perSection[s.id] || 0;
          const seen = st.perSection[s.id] || { total: 0, correct: 0 };
          const pct = seen.total ? Math.round((seen.correct / seen.total) * 100) : null;
          return (
            <Link
              key={s.id}
              href={`#/exam/run/section/${s.id}`}
              className="block rounded-[8px] border border-borderline bg-secondary p-4 no-underline transition-colors hover:border-borderline hover:bg-hover"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] font-bold tracking-wider text-textmain uppercase">
                    Section {s.id} · {s.weight} % de l'examen
                  </div>
                  <div className="mt-1 text-[14px] leading-snug font-semibold">{s.label}</div>
                </div>
                {pct != null && <Badge color={pct >= PASS_MARK ? "green" : pct >= 50 ? "yellow" : "red"}>{pct} %</Badge>}
              </div>
              <div className="mt-2.5 text-[11.5px] text-textmuted">{n} question(s) disponibles</div>
            </Link>
          );
        })}
      </div>

      <h2 className="mt-8 mb-3 text-[17px] font-semibold">Par étude de cas officielle</h2>
      <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
        {CASE_STUDIES.map((c) => (
          <Card key={c.id} className="p-4">
            <div className="flex items-start gap-3">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px]  ${CASE_TONE[c.color] || CASE_TONE.blue}`}>
                <Icon name={c.icon} size={19} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-bold">{c.name}</div>
                <div className="mt-0.5 text-[12px] text-textmuted">{c.sector}</div>
                <div className="mt-1.5 text-[12.5px] leading-snug text-textmuted">{c.tagline}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-borderline pt-3">
              {/* Même hiérarchie que la page Études de cas : lire la fiche est
                  l'action principale, s'entraîner vient après. */}
              <Link
                href={`#/case/${c.id}`}
                className="inline-flex items-center gap-1.5 rounded-[4px] bg-textmain px-3 py-1.5 text-[12px] font-bold text-onaccent no-underline transition-opacity hover:opacity-90"
              >
                <Icon name="book-open" size={13} /> Lire la fiche
              </Link>
              <Link
                href={`#/exam/run/case/${c.id}`}
                className="inline-flex items-center gap-1.5 rounded-[4px] border border-borderline px-3 py-1.5 text-[12px] font-bold text-textmain no-underline transition-colors hover:bg-hover"
              >
                <Icon name="target" size={13} /> {bank.perCase[c.id]} questions
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {hist.length > 0 && (
        <>
          <div className="mt-8 mb-3 flex items-baseline justify-between gap-2">
            <h2 className="text-[17px] font-semibold">Historique</h2>
            <button onClick={reset} className="text-[12.5px] font-semibold text-red">Effacer</button>
          </div>
          <Card className="divide-y divide-borderline">
            {hist.map((a, i) => (
              <div key={i} className="flex flex-wrap items-center gap-3 p-3.5">
                <Badge color={a.passed ? "green" : "red"}>{a.score} %</Badge>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-semibold">{a.label}</div>
                  <div className="mt-0.5 text-[11.5px] text-textmuted">
                    {new Date(a.ts).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
                    {" · "}{a.correct}/{a.total} bonnes
                    {a.skipped ? ` · ${a.skipped} non répondues` : ""}
                    {a.elapsedSec != null ? ` · ${fmtDuration(a.elapsedSec)}` : ""}
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </>
      )}

      <p className="mt-8 text-[11.5px] leading-relaxed text-textmuted">
        Le seuil de {PASS_MARK} % est une cible d'entraînement : Google ne publie pas le score de
        passage réel de l'examen. Les études de cas sont résumées et traduites depuis les documents
        officiels, qui restent la source de référence.
      </p>
    </div>
  );
}
