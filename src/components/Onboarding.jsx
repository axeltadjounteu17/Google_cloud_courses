import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Icon from "../lib/icons.jsx";
import Button from "./Button.jsx";
import { LogoMark } from "./Logo.jsx";
import DATA from "../data/courses.js";
import SLIDES from "../data/slides.js";
import QUIZZES from "../data/quizzes.js";
import EXAM from "../data/exam.js";
import CASE_STUDIES from "../data/caseStudies.js";

/**
 * Présentation d'accueil, en plein écran.
 *
 * Elle occupe tout l'écran au premier lancement plutôt qu'une boîte centrée :
 * c'est le premier contact avec l'outil, il mérite la surface entière.
 *
 * L'animation est reconstruite autour de trois idées :
 *   · une entrée en fondu-montée décalée, élément par élément, plutôt qu'un
 *     glissement latéral du bloc entier ;
 *   · un compteur qui s'incrémente réellement jusqu'au chiffre annoncé, ce qui
 *     donne du corps aux données ;
 *   · une trame de fond qui se décale lentement, pour éviter l'écran figé.
 *
 * `useReducedMotion` neutralise l'ensemble si le système le demande.
 */

// Les chiffres viennent des données embarquées : la présentation ne peut pas
// annoncer un contenu qui n'existe plus.
const FACTS = (() => {
  const lessons = DATA.courses.reduce((a, c) => a + c.lessons.length, 0);
  const pages = SLIDES.reduce(
    (a, c) => a + c.decks.reduce((b, d) => b + (d.pages?.length || 0), 0),
    0
  );
  const quizQ = QUIZZES.quizzes.reduce((a, z) => a + z.questions.length, 0);
  const ids = new Set(DATA.courses.map((c) => c.id));
  const courses = DATA.courses.length + SLIDES.filter((s) => !ids.has(s.courseId)).length;
  return { courses, lessons, pages, quizQ, examQ: EXAM.length, cases: CASE_STUDIES.length };
})();

const STEPS = [
  {
    icon: "sparkles",
    kicker: "Bienvenue",
    title: "Votre espace de révision",
    text: "Un outil personnel et gratuit pour préparer la certification Google Cloud Professional Cloud Architect, entièrement en français.",
    stats: [
      { v: FACTS.courses, l: "cours" },
      { v: FACTS.lessons, l: "leçons" },
      { v: FACTS.pages, l: "diapositives" },
    ],
  },
  {
    icon: "award",
    kicker: "L'objectif",
    title: "La certification Cloud Architect",
    text: "Elle valide votre capacité à concevoir, sécuriser et exploiter des architectures cloud à grande échelle. L'épreuve couvre six domaines, et de 30 à 40 % des questions reposent sur des études de cas.",
    stats: [
      { v: 6, l: "domaines" },
      { v: FACTS.cases, l: "études de cas" },
      { v: 120, l: "minutes" },
    ],
  },
  {
    icon: "book",
    kicker: "Le contenu",
    title: "Cours, diapositives et transcriptions",
    text: "Fondamentaux, réseaux, sécurité, conteneurs GKE, IA et observabilité. Les transcriptions sont horodatées et les diapositives de chaque module sont consultables page par page.",
    stats: [
      { v: FACTS.lessons, l: "leçons" },
      { v: FACTS.pages, l: "diapositives" },
      { v: FACTS.courses, l: "cours" },
    ],
  },
  {
    icon: "target",
    kicker: "L'entraînement",
    title: "Quiz et examens blancs corrigés",
    text: "Les quiz de révision reprennent le contenu des cours. Le mode Examen propose des questions de type épreuve, chronométrées et corrigées, avec la justification de chaque option.",
    stats: [
      { v: FACTS.quizQ, l: "questions de quiz" },
      { v: FACTS.examQ, l: "questions d'examen" },
      { v: 70, l: "% visés" },
    ],
  },
  {
    icon: "chart",
    kicker: "Le suivi",
    title: "Votre progression, gardée en local",
    text: "Leçons lues, marque-pages, série de jours d'étude et historique d'examen restent dans ce navigateur. Aucun compte, aucun envoi de données.",
    stats: [
      { v: 0, l: "compte requis" },
      { v: 0, l: "donnée envoyée" },
      { v: 0, l: "traçage" },
    ],
  },
];

/** Compteur qui monte jusqu'à sa valeur, pour donner du poids aux chiffres. */
function Counter({ to, duration = 900, disabled }) {
  const [v, setV] = useState(disabled ? to : 0);

  useEffect(() => {
    if (disabled || to === 0) { setV(to); return; }
    let raf;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      // Sortie amortie : rapide au début, se pose à la fin.
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration, disabled]);

  return <>{v}</>;
}

export default function Onboarding({ onClose }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const reduce = useReducedMotion();
  const last = step === STEPS.length - 1;
  const s = STEPS[step];

  const go = (nextStep) => {
    setDir(nextStep > step ? 1 : -1);
    setStep(Math.max(0, Math.min(STEPS.length - 1, nextStep)));
  };
  const next = () => (last ? onClose() : go(step + 1));

  // Navigation au clavier : flèches, Entrée pour avancer, Échap pour passer.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "Enter") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(step - 1); }
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [step, last]);

  // Décalage en entrée, dans le sens de la navigation.
  const shift = reduce ? 0 : 18 * dir;

  const item = useMemo(
    () => (i) => ({
      initial: { opacity: 0, y: reduce ? 0 : 14 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.42, delay: 0.06 + i * 0.07, ease: [0.22, 1, 0.36, 1] },
    }),
    [reduce]
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Présentation de GCP Étude"
      className="fixed inset-0 z-[9995] flex flex-col bg-bg"
    >
      {/* Trame de fond animée : elle évite l'écran mort sans attirer l'œil.
          Arrêts pleins, donc aucune transparence introduite. */}
      {!reduce && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.28]"
          style={{
            backgroundImage:
              "linear-gradient(var(--borderline) 1px, transparent 1px), linear-gradient(90deg, var(--borderline) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
          animate={{ backgroundPosition: ["0px 0px", "56px 56px"] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* En-tête : marque à gauche, sortie à droite. */}
      <header className="relative flex shrink-0 items-center justify-between gap-3 border-b border-borderline px-8 py-5 max-sm:px-4">
        <span className="flex items-center gap-2.5">
          <LogoMark size={26} />
          <span className="label-mono-sm text-textmuted">GCP Étude</span>
        </span>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Passer
        </Button>
      </header>

      {/* Corps centré, sur toute la hauteur restante. */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-8 py-10 max-sm:px-4 max-sm:py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: shift }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -shift }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[760px]"
          >
            <motion.div {...item(0)}>
              <span className="flex h-14 w-14 items-center justify-center rounded-[8px] border border-edgeaccent bg-tintaccent text-accent">
                <Icon name={s.icon} size={26} />
              </span>
            </motion.div>

            <motion.p {...item(1)} className="label-mono mt-6 text-accent">
              {s.kicker}
            </motion.p>

            <motion.h1 {...item(2)} className="text-hero mt-3 max-w-[24ch]">
              {s.title}
            </motion.h1>

            <motion.p
              {...item(3)}
              className="mt-5 max-w-[62ch] text-[16px] leading-relaxed text-textmuted"
            >
              {s.text}
            </motion.p>

            {/* Chiffres : ils s'incrémentent à chaque étape. */}
            <motion.div
              {...item(4)}
              className="mt-9 grid grid-cols-3 gap-3 max-sm:grid-cols-1"
            >
              {s.stats.map((x, i) => (
                <div key={i} className="rounded-[8px] border border-borderline bg-secondary p-4">
                  <div className="text-stat text-[30px] text-accent">
                    <Counter to={x.v} disabled={reduce} duration={800 + i * 120} />
                  </div>
                  <div className="label-mono-sm mt-1.5 text-textmuted">{x.l}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pied : progression segmentée cliquable, puis navigation. */}
      <footer className="relative flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-borderline px-8 py-5 max-sm:px-4">
        <div className="flex items-center gap-2" role="tablist" aria-label="Étapes">
          {STEPS.map((st, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              role="tab"
              aria-selected={i === step}
              aria-label={`Étape ${i + 1} : ${st.title}`}
              className="group py-2"
            >
              <span
                className={`block h-[3px] transition-all duration-300 ${
                  i === step
                    ? "w-10 bg-accent"
                    : i < step
                      ? "w-5 bg-textmuted group-hover:bg-accent"
                      : "w-5 bg-borderline group-hover:bg-textmuted"
                }`}
              />
            </button>
          ))}
          <span className="label-mono-sm ml-2 text-textmuted">
            {step + 1} / {STEPS.length}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            icon="chevron-left"
            onClick={() => go(step - 1)}
            disabled={step === 0}
          >
            Précédent
          </Button>
          <Button variant="primary" iconEnd={last ? "check" : "arrow-right"} onClick={next}>
            {last ? "Commencer" : "Suivant"}
          </Button>
        </div>
      </footer>
    </div>
  );
}
