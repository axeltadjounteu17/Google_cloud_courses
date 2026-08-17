import React from "react";
import Icon from "../lib/icons.jsx";
import { useStore } from "../lib/store.jsx";
import { Card, SectionTitle } from "../components/ui.jsx";

const Toggle = ({ on, onClick }) => (
  <button
    onClick={onClick}
    role="switch"
    aria-checked={on}
    className={`relative h-[26px] w-[46px] rounded-full transition-colors ${on ? "bg-textmuted" : "bg-borderline"}`}
  >
    <span className={`absolute top-[3px] left-[3px] h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : ""}`} />
  </button>
);

const Chip = ({ label, active, onClick }) => (
  <button onClick={onClick} className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${active ? "border-borderline bg-textmain text-bg" : "border-borderline bg-transparent text-textmuted hover:bg-hover hover:text-textmain"}`}>
    {label}
  </button>
);

export default function Settings() {
  const { settings, setSettings, resetAll, openOnboarding } = useStore();

  return (
    <div className="container mx-auto max-w-[720px]">
      <h1 className="mb-1.5 text-[26px] text-textmuted">Réglages</h1>
      <p className="mb-6 text-sm text-textmuted">Personnalisez la lecture et gérez vos données.</p>

      <SectionTitle>Lecture</SectionTitle>
      <Card className="mb-5 p-6 max-sm:p-4">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold">Afficher les horodatages</div>
            <div className="text-[12px] text-textmuted">Préfixe chaque segment vidéo par son horodatage dans les leçons.</div>
          </div>
          <Toggle on={settings.timestamps} onClick={() => setSettings((s) => ({ ...s, timestamps: !s.timestamps }))} />
        </div>
        <div>
          <div className="mb-3 text-sm font-bold">Taille du texte dans les leçons</div>
          <div className="flex flex-wrap gap-2">
            {[
              { k: "sm", l: "Petit" },
              { k: "md", l: "Moyen" },
              { k: "lg", l: "Grand" },
            ].map((o) => <Chip key={o.k} label={o.l} active={settings.font === o.k} onClick={() => setSettings((s) => ({ ...s, font: o.k }))} />)}
          </div>
        </div>
      </Card>

      <SectionTitle>Données</SectionTitle>
      <Card className="mb-5 p-6 max-sm:p-4">
        <p className="mb-4 text-[12.5px] leading-relaxed text-textmuted">
          Votre progression et vos réglages sont enregistrés localement dans ce navigateur (localStorage). Rien n'est envoyé sur un serveur.
        </p>
        <button
          onClick={() => { if (confirm("Réinitialiser toute la progression ? Cette action est irréversible.")) resetAll(); }}
          className="inline-flex items-center gap-2 rounded-[10px] border border-red/40 bg-red/10 px-4 py-2.5 text-sm font-bold text-red transition-colors hover:bg-red/20"
        >
          <Icon name="trash" size={14} /> Réinitialiser toute la progression
        </button>
      </Card>

      <Card className="p-6 max-sm:p-4">
        <div className="mb-1.5 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-hover text-textmuted"><Icon name="book" size={18} /></span>
          <div className="text-sm font-bold">À propos</div>
        </div>
        <p className="text-[12.5px] leading-relaxed text-textmuted">
          Plateforme d'étude hors-ligne pour la certification <strong className="text-textmain">Google Cloud Professional Cloud Architect</strong>. Cours compilés depuis des transcripts vidéo officiels et les diapositives des modules, traduits en français.
        </p>
        <button
          onClick={openOnboarding}
          className="mt-4 inline-flex items-center gap-2 rounded-[10px] border border-borderline bg-transparent px-4 py-2.5 text-sm font-bold text-textmain transition-colors hover:bg-hover"
        >
          <Icon name="sparkles" size={15} /> Revoir la présentation d'accueil
        </button>
      </Card>
    </div>
  );
}
