// Logique du mode Examen : tirage pondéré, correction, scoring, historique.
import QUESTIONS, { SECTIONS } from "../data/exam.js";
import CASE_STUDIES from "../data/caseStudies.js";

export { QUESTIONS, SECTIONS, CASE_STUDIES };

const HISTORY_KEY = "gcp_exam_history";
const MAX_HISTORY = 30;

// Seuil de réussite retenu pour l'entraînement. Google ne publie pas le score
// de passage réel du PCA ; 70 % est la cible d'usage la plus courante.
export const PASS_MARK = 70;

// Examen blanc complet : 50 questions en 2 h, format proche de l'épreuve réelle.
export const FULL_EXAM_SIZE = 50;
export const FULL_EXAM_MINUTES = 120;

export const MODES = {
  full: { id: "full", label: "Examen blanc", icon: "award",
    desc: "50 questions pondérées comme l'épreuve réelle, chronométrées sur 2 h." },
  section: { id: "section", label: "Par section", icon: "target",
    desc: "Toutes les questions d'un domaine du guide d'examen, sans chrono." },
  case: { id: "case", label: "Par étude de cas", icon: "book-open",
    desc: "Les questions rattachées à une étude de cas officielle." },
  review: { id: "review", label: "Mes erreurs", icon: "rotate",
    desc: "Rejoue uniquement les questions manquées lors des sessions passées." },
};

function shuffle(arr, rnd = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function questionById(id) {
  return QUESTIONS.find((q) => q.id === id) || null;
}

export function caseStudyById(id) {
  return CASE_STUDIES.find((c) => c.id === id) || null;
}

export function sectionById(id) {
  return SECTIONS.find((s) => s.id === Number(id)) || null;
}

/** Répartition cible d'un examen de `size` questions selon les pondérations du guide. */
export function quotaForSize(size = FULL_EXAM_SIZE) {
  const raw = SECTIONS.map((s) => ({ id: s.id, exact: (size * s.weight) / 100 }));
  const quota = raw.map((r) => ({ id: r.id, n: Math.floor(r.exact), frac: r.exact - Math.floor(r.exact) }));
  let left = size - quota.reduce((n, q) => n + q.n, 0);
  // Les places restantes vont aux sections dont la partie décimale est la plus forte.
  quota.sort((a, b) => b.frac - a.frac);
  for (let i = 0; left > 0; i = (i + 1) % quota.length, left--) quota[i].n += 1;
  return Object.fromEntries(quota.map((q) => [q.id, q.n]));
}

/**
 * Construit une session d'examen.
 * @returns {{mode:string, label:string, timed:boolean, minutes:number|null, questionIds:string[], createdAt:number, target:string|null}}
 */
export function buildSession(mode, target = null, opts = {}) {
  const { size = FULL_EXAM_SIZE, missedIds = [], shuffleOptions = true } = opts;
  let ids = [];
  let label = MODES[mode]?.label || "Examen";
  let timed = false;
  let minutes = null;

  if (mode === "full") {
    const quota = quotaForSize(size);
    for (const s of SECTIONS) {
      const pool = shuffle(QUESTIONS.filter((q) => q.section === s.id));
      ids.push(...pool.slice(0, quota[s.id]).map((q) => q.id));
    }
    // Si une section est trop pauvre, on complète avec le reste de la banque.
    if (ids.length < size) {
      const rest = shuffle(QUESTIONS.filter((q) => !ids.includes(q.id)));
      ids.push(...rest.slice(0, size - ids.length).map((q) => q.id));
    }
    ids = shuffle(ids);
    timed = true;
    minutes = opts.minutes ?? FULL_EXAM_MINUTES;
    label = `Examen blanc — ${ids.length} questions`;
  } else if (mode === "section") {
    const s = sectionById(target);
    ids = shuffle(QUESTIONS.filter((q) => q.section === Number(target))).map((q) => q.id);
    label = s ? `Section ${s.id} — ${s.short}` : "Section";
  } else if (mode === "case") {
    const c = caseStudyById(target);
    ids = shuffle(QUESTIONS.filter((q) => q.caseStudy === target)).map((q) => q.id);
    label = c ? c.name : "Étude de cas";
  } else if (mode === "review") {
    const set = new Set(missedIds.length ? missedIds : missedQuestionIds());
    ids = shuffle(QUESTIONS.filter((q) => set.has(q.id))).map((q) => q.id);
    label = `Mes erreurs — ${ids.length} questions`;
  }

  // Ordre des options mélangé par question, en conservant la trace des bonnes réponses.
  const order = {};
  for (const id of ids) {
    const q = questionById(id);
    const idxs = q.options.map((_, i) => i);
    order[id] = shuffleOptions ? shuffle(idxs) : idxs;
  }

  return { mode, target, label, timed, minutes, questionIds: ids, order, createdAt: Date.now() };
}

/** Corrige une réponse. `picked` = indices dans l'ordre affiché. */
export function gradeAnswer(question, picked, order) {
  const original = (picked || []).map((i) => order[i]).sort((a, b) => a - b);
  const expected = question.answer.slice().sort((a, b) => a - b);
  const correct =
    original.length === expected.length && original.every((v, i) => v === expected[i]);
  return { correct, originalPicked: original, expected };
}

export function requiredPicks(question) {
  return question.answer.length;
}

/** Note une session complète. `answers` = { [questionId]: number[] } (indices affichés). */
export function gradeSession(session, answers) {
  const perSection = {};
  for (const s of SECTIONS) perSection[s.id] = { total: 0, correct: 0 };

  const details = session.questionIds.map((id) => {
    const q = questionById(id);
    const order = session.order[id] || q.options.map((_, i) => i);
    const picked = answers[id] || [];
    const answered = picked.length > 0;
    const { correct, expected } = gradeAnswer(q, picked, order);
    const ok = answered && correct;
    perSection[q.section].total += 1;
    if (ok) perSection[q.section].correct += 1;
    return { id, question: q, order, picked, answered, correct: ok, expected };
  });

  const total = details.length;
  const correct = details.filter((d) => d.correct).length;
  const score = total ? Math.round((correct / total) * 100) : 0;

  return {
    total,
    correct,
    wrong: details.filter((d) => d.answered && !d.correct).length,
    skipped: details.filter((d) => !d.answered).length,
    score,
    passed: score >= PASS_MARK,
    perSection,
    details,
    missedIds: details.filter((d) => !d.correct).map((d) => d.id),
  };
}

// ── Historique ────────────────────────────────────────────────────────────

function readHistory() {
  try {
    const v = JSON.parse(localStorage.getItem(HISTORY_KEY));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function history() {
  return readHistory();
}

export function saveAttempt(session, result, elapsedSec) {
  const entry = {
    ts: Date.now(),
    mode: session.mode,
    target: session.target,
    label: session.label,
    score: result.score,
    correct: result.correct,
    total: result.total,
    skipped: result.skipped,
    passed: result.passed,
    elapsedSec,
    askedIds: session.questionIds,
    missedIds: result.missedIds,
    perSection: result.perSection,
  };
  const next = [entry, ...readHistory()].slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    /* quota dépassé : l'historique n'est pas critique */
  }
  return entry;
}

export function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* ignore */
  }
}

/** Identifiants des questions manquées au moins une fois et jamais réussies depuis. */
export function missedQuestionIds() {
  const h = readHistory();
  const missed = new Set();
  const succeeded = new Set();
  // Parcours du plus ancien au plus récent : une réussite ultérieure efface l'erreur.
  for (const a of h.slice().reverse()) {
    for (const id of a.missedIds || []) {
      missed.add(id);
      succeeded.delete(id);
    }
    // Les questions posées et non listées comme manquées ont été réussies.
    for (const id of a.askedIds || []) if (!(a.missedIds || []).includes(id)) succeeded.add(id);
  }
  for (const id of succeeded) missed.delete(id);
  return [...missed].filter((id) => questionById(id));
}

export function stats() {
  const h = readHistory();
  const attempts = h.length;
  const best = attempts ? Math.max(...h.map((a) => a.score)) : 0;
  const last = attempts ? h[0].score : null;
  const avg = attempts ? Math.round(h.reduce((n, a) => n + a.score, 0) / attempts) : 0;
  const perSection = {};
  for (const s of SECTIONS) perSection[s.id] = { total: 0, correct: 0 };
  for (const a of h) {
    for (const [sid, v] of Object.entries(a.perSection || {})) {
      if (!perSection[sid]) continue;
      perSection[sid].total += v.total || 0;
      perSection[sid].correct += v.correct || 0;
    }
  }
  return { attempts, best, last, avg, perSection, missed: missedQuestionIds().length };
}

export function bankStats() {
  const perSection = {};
  for (const s of SECTIONS) perSection[s.id] = QUESTIONS.filter((q) => q.section === s.id).length;
  const perCase = {};
  for (const c of CASE_STUDIES) perCase[c.id] = QUESTIONS.filter((q) => q.caseStudy === c.id).length;
  return {
    total: QUESTIONS.length,
    general: QUESTIONS.filter((q) => !q.caseStudy).length,
    multi: QUESTIONS.filter((q) => q.multi).length,
    perSection,
    perCase,
  };
}

export function fmtDuration(sec) {
  if (sec == null) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m ? `${m} min ${String(s).padStart(2, "0")} s` : `${s} s`;
}

export function fmtClock(sec) {
  const m = Math.floor(Math.max(0, sec) / 60);
  const s = Math.max(0, sec) % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
