import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "../lib/icons.jsx";

const STEPS = [
  {
    icon: "sparkles",
    color: "cyan",
    title: "Bienvenue sur GCP Étude",
    text: "Votre espace personnel pour préparer la certification Google Cloud Professional Cloud Architect, entièrement en français et utilisable sans connexion internet.",
  },
  {
    icon: "shield",
    color: "blue",
    title: "La certification PCA",
    text: "Le Professional Cloud Architect valide votre capacité à concevoir et sécuriser des solutions cloud à grande échelle sur Google Cloud. C'est l'une des certifications cloud les plus reconnues et recherchées sur le marché.",
  },
  {
    icon: "book",
    color: "green",
    title: "Ce que contient la plateforme",
    text: "Neuf cours couvrant les fondamentaux, les réseaux, la sécurité, les conteneurs GKE, l'IA et l'observabilité : transcripts horodatés des vidéos, diapositives détaillées des modules et quiz de révision.",
  },
  {
    icon: "target",
    color: "orange",
    title: "Comment l'utiliser",
    text: "Lisez les leçons, marquez-les comme lues, consultez les slides de chaque module puis entraînez-vous avec les quiz. Votre progression est sauvegardée automatiquement, pas besoin de vous en préoccuper.",
  },
  {
    icon: "chart",
    color: "red",
    title: "Votre montée en compétence",
    text: "Répétez les quiz, relisez les leçons difficiles, consultez les slides : chaque session vous rapproche du niveau de l'examen. Suivez votre progression globale d'un coup d'œil et abordez l'examen sereinement.",
  },
];

const COLORS = {
  cyan: "bg-cyan/15 text-cyan border-cyan/30",
  blue: "bg-blue/15 text-blue border-blue/30",
  green: "bg-green/15 text-green border-green/30",
  orange: "bg-orange/15 text-orange border-orange/30",
  red: "bg-red/15 text-red border-red/30",
};

export default function Onboarding({ onClose }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const last = step === STEPS.length - 1;
  const s = STEPS[step];

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const next = () => (last ? onClose() : setStep((i) => i + 1));
  const back = () => setStep((i) => Math.max(0, i - 1));

  return (
    <div className="fixed inset-0 z-[9995] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />

      <div className="relative w-full max-w-[560px] overflow-hidden rounded-[22px] border border-borderline bg-bgsoft/90 shadow-2xl backdrop-blur-2xl">
        <div className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-blue/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-cyan/15 blur-3xl" />

        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-10 rounded-[9px] border border-borderline bg-transparent px-3 py-1.5 text-[12px] font-bold text-textmuted transition-colors hover:bg-hover hover:text-textmain"
        >
          Passer
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 60, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -60, scale: 0.98 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            className="px-8 pt-12 pb-8 max-sm:px-5"
          >
            <motion.div
              initial={{ scale: 0.4, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.08 }}
              className={`flex h-[72px] w-[72px] items-center justify-center rounded-[20px] border ${COLORS[s.color]}`}
            >
              <Icon name={s.icon} size={34} />
            </motion.div>

            <h2 className="mt-5 text-[22px] leading-tight font-bold">{s.title}</h2>
            <p className="mt-2.5 text-[14px] leading-relaxed text-textmuted">{s.text}</p>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between gap-3 border-t border-borderline px-8 py-4 max-sm:px-5">
          <button
            onClick={back}
            disabled={step === 0}
            className="inline-flex h-10 items-center gap-1.5 rounded-[10px] border border-borderline bg-transparent px-3.5 text-[13px] font-bold text-textmain transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Icon name="chevron-left" size={15} /> Précédent
          </button>

          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-6 bg-cyan" : "w-1.5 bg-borderline"}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-blue px-4 text-[13px] font-bold text-white shadow-[0_6px_18px_-8px_rgba(37,99,235,0.7)] transition-opacity hover:opacity-90"
          >
            {last ? "Commencer" : "Suivant"} <Icon name="chevron-right" size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
