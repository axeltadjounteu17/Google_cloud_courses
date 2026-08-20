// Validation des données : banque d'examen, études de cas, cours, quiz.
// Exécution : npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import COURSES from "../src/data/courses.js";
import QUIZZES from "../src/data/quizzes.js";
import SLIDES from "../src/data/slides.js";
import CASE_STUDIES from "../src/data/caseStudies.js";
import EXAM, { SECTIONS } from "../src/data/exam.js";
import {
  buildSession, gradeSession, gradeAnswer, quotaForSize,
  questionById, caseStudyById, FULL_EXAM_SIZE, PASS_MARK,
} from "../src/lib/exam.js";

// ── Banque d'examen ───────────────────────────────────────────────────────

test("exam: identifiants uniques", () => {
  const ids = EXAM.map((q) => q.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("exam: chaque question est structurellement complète", () => {
  for (const q of EXAM) {
    assert.ok(q.q.length >= 30, `${q.id}: énoncé trop court`);
    assert.ok(q.options.length >= 4, `${q.id}: moins de 4 options`);
    assert.equal(new Set(q.options).size, q.options.length, `${q.id}: options dupliquées`);
    assert.ok(q.answer.length >= 1, `${q.id}: aucune bonne réponse`);
    assert.equal(q.why.length, q.options.length, `${q.id}: why != options`);
    assert.ok(q.explanation && q.explanation.length > 20, `${q.id}: explication absente`);
    assert.match(q.objective, /^\d\.\d$/, `${q.id}: objectif malformé`);
    assert.ok(["facile", "moyen", "difficile"].includes(q.level), `${q.id}: niveau invalide`);
  }
});

test("exam: les index de réponse sont dans les bornes", () => {
  for (const q of EXAM) {
    for (const a of q.answer) {
      assert.ok(Number.isInteger(a) && a >= 0 && a < q.options.length, `${q.id}: index ${a} hors bornes`);
    }
    assert.equal(new Set(q.answer).size, q.answer.length, `${q.id}: réponse dupliquée`);
  }
});

test("exam: le drapeau multi correspond au nombre de réponses", () => {
  for (const q of EXAM) {
    assert.equal(!!q.multi, q.answer.length > 1, `${q.id}: multi incohérent`);
  }
});

test("exam: sections et études de cas référencées existent", () => {
  const sids = new Set(SECTIONS.map((s) => s.id));
  const cids = new Set(CASE_STUDIES.map((c) => c.id));
  for (const q of EXAM) {
    assert.ok(sids.has(q.section), `${q.id}: section ${q.section} inconnue`);
    if (q.caseStudy) assert.ok(cids.has(q.caseStudy), `${q.id}: étude de cas ${q.caseStudy} inconnue`);
  }
});

test("exam: les pondérations des sections totalisent 100", () => {
  assert.equal(SECTIONS.reduce((n, s) => n + s.weight, 0), 100);
});

test("exam: chaque section dispose d'assez de questions pour un examen blanc", () => {
  const quota = quotaForSize(FULL_EXAM_SIZE);
  for (const s of SECTIONS) {
    const n = EXAM.filter((q) => q.section === s.id).length;
    assert.ok(n >= quota[s.id], `S${s.id}: ${n} question(s) pour un quota de ${quota[s.id]}`);
  }
});

// ── Logique de session ────────────────────────────────────────────────────

test("quotaForSize: la somme vaut la taille demandée", () => {
  for (const size of [20, 30, 50, 60]) {
    const q = quotaForSize(size);
    assert.equal(Object.values(q).reduce((a, b) => a + b, 0), size, `taille ${size}`);
  }
});

test("buildSession full: taille, chrono et ordre mélangé cohérents", () => {
  const s = buildSession("full");
  assert.equal(s.questionIds.length, FULL_EXAM_SIZE);
  assert.equal(new Set(s.questionIds).size, FULL_EXAM_SIZE, "doublons dans le tirage");
  assert.equal(s.timed, true);
  assert.ok(s.minutes > 0);
  for (const id of s.questionIds) {
    const q = questionById(id);
    assert.ok(q, `question ${id} introuvable`);
    const order = s.order[id];
    assert.equal(order.length, q.options.length, `${id}: ordre incomplet`);
    assert.deepEqual([...order].sort((a, b) => a - b), q.options.map((_, i) => i), `${id}: ordre invalide`);
  }
});

test("buildSession section/case: filtre correctement", () => {
  for (const sec of SECTIONS) {
    const s = buildSession("section", sec.id);
    assert.ok(s.questionIds.every((id) => questionById(id).section === sec.id), `S${sec.id}`);
  }
  for (const c of CASE_STUDIES) {
    const s = buildSession("case", c.id);
    assert.ok(s.questionIds.length > 0, `${c.id}: aucune question`);
    assert.ok(s.questionIds.every((id) => questionById(id).caseStudy === c.id), c.id);
  }
});

test("gradeAnswer: traduit l'ordre affiché vers les index d'origine", () => {
  const q = { options: ["a", "b", "c", "d"], answer: [2] };
  const order = [3, 2, 0, 1]; // l'option d'origine 2 est affichée en position 1
  assert.equal(gradeAnswer(q, [1], order).correct, true);
  assert.equal(gradeAnswer(q, [0], order).correct, false);
});

test("gradeAnswer: exige l'ensemble exact pour les questions à réponses multiples", () => {
  const q = { options: ["a", "b", "c", "d", "e"], answer: [0, 4] };
  const order = [0, 1, 2, 3, 4];
  assert.equal(gradeAnswer(q, [0, 4], order).correct, true);
  assert.equal(gradeAnswer(q, [4, 0], order).correct, true, "l'ordre de sélection ne doit pas compter");
  assert.equal(gradeAnswer(q, [0], order).correct, false, "réponse partielle refusée");
  assert.equal(gradeAnswer(q, [0, 1, 4], order).correct, false, "réponse en trop refusée");
});

test("gradeSession: 100 % quand toutes les réponses sont justes", () => {
  const s = buildSession("full");
  const answers = {};
  for (const id of s.questionIds) {
    const q = questionById(id);
    answers[id] = q.answer.map((orig) => s.order[id].indexOf(orig));
  }
  const r = gradeSession(s, answers);
  assert.equal(r.score, 100);
  assert.equal(r.correct, r.total);
  assert.equal(r.skipped, 0);
  assert.equal(r.passed, true);
  assert.deepEqual(r.missedIds, []);
});

test("gradeSession: 0 % et tout non répondu sur une copie vide", () => {
  const s = buildSession("full");
  const r = gradeSession(s, {});
  assert.equal(r.score, 0);
  assert.equal(r.skipped, r.total);
  assert.equal(r.passed, false);
  assert.equal(r.missedIds.length, r.total);
});

test("gradeSession: le total par section correspond au tirage", () => {
  const s = buildSession("full");
  const r = gradeSession(s, {});
  const sum = Object.values(r.perSection).reduce((n, v) => n + v.total, 0);
  assert.equal(sum, s.questionIds.length);
});

test("PASS_MARK est un pourcentage plausible", () => {
  assert.ok(PASS_MARK > 0 && PASS_MARK <= 100);
});

// ── Études de cas ─────────────────────────────────────────────────────────

test("études de cas: champs obligatoires présents", () => {
  assert.ok(CASE_STUDIES.length >= 4);
  for (const c of CASE_STUDIES) {
    for (const f of ["id", "name", "sector", "icon", "color", "tagline", "overview", "concept", "executive", "source"]) {
      assert.ok(c[f], `${c.id}: champ ${f} manquant`);
    }
    for (const f of ["environment", "business", "technical", "keywords"]) {
      assert.ok(Array.isArray(c[f]) && c[f].length > 0, `${c.id}: ${f} vide`);
    }
    assert.match(c.source, /^https:\/\//, `${c.id}: source non HTTPS`);
    assert.equal(caseStudyById(c.id).id, c.id);
  }
});

test("études de cas: chacune a des questions rattachées", () => {
  for (const c of CASE_STUDIES) {
    const n = EXAM.filter((q) => q.caseStudy === c.id).length;
    assert.ok(n > 0, `${c.id}: aucune question`);
  }
});

test("études de cas: pas de caractère parasite hors alphabet latin", () => {
  for (const c of CASE_STUDIES) {
    const blob = JSON.stringify(c);
    const bad = blob.match(/[\u3000-\u9fff\u0400-\u04ff]/g);
    assert.equal(bad, null, `${c.id}: caractère(s) parasite(s) ${bad}`);
  }
});

// ── Cours, quiz, slides ───────────────────────────────────────────────────

test("cours: identifiants uniques et leçons non vides", () => {
  const ids = COURSES.courses.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const c of COURSES.courses) {
    assert.ok(c.title, `cours ${c.id}: titre manquant`);
    assert.ok(c.folder, `cours ${c.id}: dossier manquant`);
    assert.ok(Array.isArray(c.lessons), `cours ${c.id}: lessons invalide`);
  }
});

test("quiz: chaque jeu cible un dossier de cours existant", () => {
  const folders = new Set(COURSES.courses.map((c) => c.folder));
  for (const z of QUIZZES.quizzes) {
    assert.ok(z.questions.length > 0, `quiz ${z.courseId}: aucune question`);
    // Un jeu peut viser un cours présent uniquement en diapositives.
    const known = folders.has(z.folder) || SLIDES.some((s) => s.title && z.title);
    assert.ok(known, `quiz ${z.courseId}: dossier ${z.folder} inconnu`);
  }
});

test("slides: chaque page référence une image", () => {
  for (const c of SLIDES) {
    for (const d of c.decks) {
      for (const p of d.pages) {
        assert.match(p.img, /^slides\//, `${c.courseId}/${d.id}: chemin d'image inattendu (${p.img})`);
      }
    }
  }
});
