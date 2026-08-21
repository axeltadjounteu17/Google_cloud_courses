import React, { useMemo } from "react";
import Icon from "../lib/icons.jsx";
import { Link } from "../lib/router.jsx";
import { useStore } from "../lib/store.jsx";
import { Card } from "../components/ui.jsx";
import Button from "../components/Button.jsx";
import QUIZZES from "../data/quizzes.js";
import EXAM, { SECTIONS } from "../data/exam.js";
import CASE_STUDIES from "../data/caseStudies.js";

/**
 * À propos.
 *
 * Tous les chiffres sont calculés depuis les données embarquées, jamais écrits
 * en dur : la page ne peut donc pas se désynchroniser du contenu réel après une
 * réextraction.
 */

function Row({ label, value, mono = true }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-borderline py-2.5 last:border-b-0">
      <span className="text-[13.5px] text-textmuted">{label}</span>
      <span className={`shrink-0 text-[13.5px] font-semibold text-textmain ${mono ? "font-mono-ui" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function Block({ icon, title, children, className = "" }) {
  return (
    <Card className={`p-6 max-sm:p-4 ${className}`}>
      <div className="mb-3.5 flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] bg-tintaccent text-accent">
          <Icon name={icon} size={16} />
        </span>
        <h2 className="label-mono text-textmain">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

export default function About() {
  const { DATA, SLIDES, ALL_COURSES } = useStore();

  const n = useMemo(() => {
    const lessons = DATA.courses.reduce((a, c) => a + c.lessons.length, 0);
    const segments = DATA.courses.reduce(
      (a, c) => a + c.lessons.reduce((b, l) => b + (l.segments || []).length, 0),
      0
    );
    const decks = SLIDES.reduce((a, c) => a + c.decks.length, 0);
    const pages = SLIDES.reduce(
      (a, c) => a + c.decks.reduce((b, d) => b + (d.pages?.length || 0), 0),
      0
    );
    const quizQ = QUIZZES.quizzes.reduce((a, z) => a + z.questions.length, 0);
    const flash = QUIZZES.quizzes.reduce(
      (a, z) => a + z.questions.filter((q) => q.type === "flash").length,
      0
    );
    return {
      courses: ALL_COURSES.length,
      lessons,
      segments,
      decks,
      pages,
      slideCourses: SLIDES.length,
      quizSets: QUIZZES.quizzes.length,
      quizQ,
      flash,
      mcq: quizQ - flash,
      examQ: EXAM.length,
      examOfficial: EXAM.filter((q) => q.official).length,
      examMulti: EXAM.filter((q) => q.multi).length,
      cases: CASE_STUDIES.length,
    };
  }, [DATA, SLIDES, ALL_COURSES]);

  return (
    <div className="container mx-auto max-w-[900px]">
      <header className="pb-8">
        <span className="label-mono-sm text-textmuted">À propos</span>
        <h1 className="text-h1 mt-2 text-accent">GCP Étude</h1>
        <p className="mt-3 max-w-[64ch] text-[15px] leading-relaxed text-textmuted">
          Plate-forme de révision gratuite pour la certification{" "}
          <strong className="font-semibold text-textmain">
            Google Cloud Professional Cloud Architect
          </strong>
          . Elle réunit les transcriptions des cours en français, les diapositives des modules,
          des quiz de révision et des questions de type examen ancrées sur les études de cas
          officielles.
        </p>
      </header>

      {/* ── Contenu réel ─────────────────────────────────────────────────── */}
      <section className="grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-2">
        {[
          { v: n.courses, l: "cours" },
          { v: n.lessons, l: "leçons" },
          { v: n.pages, l: "diapositives" },
          { v: n.examQ + n.quizQ, l: "questions" },
        ].map((s, i) => (
          <Card key={i} className="p-4">
            <div className="text-stat text-[30px] text-accent">{s.v}</div>
            <div className="label-mono-sm mt-1.5 text-textmuted">{s.l}</div>
          </Card>
        ))}
      </section>

      <div className="mt-4 grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <Block icon="book" title="Cours et leçons">
          <Row label="Cours au catalogue" value={n.courses} />
          <Row label="Leçons" value={n.lessons} />
          <Row label="Segments de transcription" value={n.segments.toLocaleString("fr-FR")} />
          <Row label="Modules de diapositives" value={`${n.decks} sur ${n.slideCourses} cours`} />
          <Row label="Diapositives extraites" value={n.pages.toLocaleString("fr-FR")} />
        </Block>

        <Block icon="target" title="Entraînement">
          <Row label="Quiz de révision" value={`${n.quizQ} sur ${n.quizSets} cours`} />
          <Row label="Dont flashcards" value={n.flash} />
          <Row label="Dont questions à choix" value={n.mcq} />
          <Row label="Questions type examen" value={n.examQ} />
          <Row label="Dont officielles reformulées" value={n.examOfficial} />
          <Row label="Dont à réponses multiples" value={n.examMulti} />
        </Block>
      </div>

      {/* ── Structure de l'examen ────────────────────────────────────────── */}
      <Block icon="award" title="Structure de l'épreuve" className="mt-4">
        <p className="mb-4 text-[13.5px] leading-relaxed text-textmuted">
          Les questions du mode Examen suivent les six domaines du guide officiel v6.1 et leur
          pondération. La colonne de droite indique combien de questions couvrent chaque domaine.
        </p>
        <div className="flex flex-col gap-2.5">
          {SECTIONS.map((s) => {
            const count = EXAM.filter((q) => q.section === s.id).length;
            return (
              <div key={s.id} className="flex items-center gap-3">
                <span className="label-mono-sm w-[22px] shrink-0 text-textmuted">S{s.id}</span>
                <span className="min-w-0 flex-1 truncate text-[13px] text-textmain">{s.label}</span>
                <span className="bar-track hidden w-[110px] shrink-0 sm:block">
                  <span className="bar-fill block" style={{ width: `${(s.weight / 25) * 100}%` }} />
                </span>
                <span className="label-mono-sm w-[42px] shrink-0 text-right text-textmuted">
                  {s.weight}%
                </span>
                <span className="label-mono-sm w-[34px] shrink-0 text-right text-accent">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </Block>

      {/* ── Études de cas ───────────────────────────────────────────────── */}
      <Block icon="book-open" title={`Études de cas officielles (${n.cases})`} className="mt-4">
        <p className="mb-4 text-[13.5px] leading-relaxed text-textmuted">
          Entre 30 et 40 % de l'épreuve s'appuie sur ces quatre entreprises fictives. Les fiches de
          l'application sont des résumés traduits ; les PDF publiés par Google restent la source de
          référence.
        </p>
        <div className="flex flex-col gap-2">
          {CASE_STUDIES.map((c) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[4px] border border-borderline px-3.5 py-2.5"
            >
              <span className="min-w-0">
                <span className="block text-[13.5px] font-semibold text-textmain">{c.name}</span>
                <span className="block text-[12px] text-textmuted">{c.sector}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="label-mono-sm text-textmuted">
                  {EXAM.filter((q) => q.caseStudy === c.id).length} questions
                </span>
                <Button as="a" href={`#/case/${c.id}`} variant="outline" size="sm">
                  Fiche
                </Button>
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-[4px] border border-borderline bg-softaccent p-3.5 text-[12.5px] leading-relaxed text-textmuted">
          <strong className="font-semibold text-textmain">Attention aux annales.</strong>{" "}
          Mountkirk Games, Helicopter Racing League et TerramEarth quittent l'examen au 30 octobre.
          Les sujets qui les utilisent restent utiles pour le raisonnement, mais les quatre fiches
          ci-dessus sont celles qui comptent.
        </p>
      </Block>

      {/* ── Fabrication ─────────────────────────────────────────────────── */}
      <div className="mt-4 grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <Block icon="server" title="Comment c'est fabriqué">
          <p className="text-[13.5px] leading-relaxed text-textmuted">
            Les transcriptions sont extraites des documents de cours (Word et OpenDocument), les
            diapositives des PDF de modules, et les quiz des questions rhétoriques et des
            questionnaires présents dans les transcriptions. Des scripts Python produisent des
            fichiers de données que l'interface consomme directement.
          </p>
          <div className="mt-3.5">
            <Row label="Interface" value="React + Vite" />
            <Row label="Styles" value="Tailwind CSS" />
            <Row label="Typographie" value="Inter · JetBrains Mono" />
            <Row label="Hébergement" value="Vercel" />
            <Row label="Stockage" value="localStorage du navigateur" />
          </div>
        </Block>

        <Block icon="shield" title="Vos données">
          <p className="text-[13.5px] leading-relaxed text-textmuted">
            Rien n'est envoyé nulle part. Il n'y a ni compte, ni serveur applicatif, ni traçage.
            Votre progression, vos marque-pages, votre série de jours et votre historique d'examen
            restent dans le stockage local de ce navigateur.
          </p>
          <div className="mt-3.5">
            <Row label="Compte requis" value="non" />
            <Row label="Envoi de données" value="aucun" />
            <Row label="Traçage" value="aucun" />
            <Row label="Indexation" value="désactivée" />
          </div>
          <p className="mt-3.5 text-[12.5px] leading-relaxed text-textmuted">
            Conséquence directe : vider les données du navigateur efface votre progression. La page
            Paramètres permet de la réinitialiser volontairement.
          </p>
        </Block>
      </div>

      {/* ── Protection du contenu, limites assumées ─────────────────────── */}
      <Block icon="shield" title="Protection du contenu" className="mt-4">
        <p className="text-[13.5px] leading-relaxed text-textmuted">
          Le contenu de formation est protégé par plusieurs mesures : filigrane de session,
          désactivation de la copie et du menu contextuel, blocage de l'impression et des
          raccourcis d'outils de développement, masquage lorsque l'onglet passe à l'arrière-plan, et
          exclusion des robots d'indexation.
        </p>
        <p className="mt-3 rounded-[4px] border border-borderline bg-hover p-3.5 text-[12.5px] leading-relaxed text-textmuted">
          <strong className="font-semibold text-textmain">Limites assumées.</strong> Une capture
          d'écran au niveau du système d'exploitation reste possible : aucune application web ne peut
          l'empêcher. Le fichier robots.txt et les en-têtes d'exclusion sont respectés par les
          moteurs de recherche, pas par un aspirateur de site déterminé. Ces mesures dissuadent,
          elles ne verrouillent pas.
        </p>
      </Block>

      {/* ── Sources et attribution ──────────────────────────────────────── */}
      <Block icon="link" title="Sources et attribution" className="mt-4">
        <p className="text-[13.5px] leading-relaxed text-textmuted">
          Les cours, les diapositives et les études de cas proviennent des supports de formation
          Google Cloud, dont le contenu reste la propriété de Google. Cette application est un
          outil de révision personnel : elle n'est ni affiliée à Google, ni approuvée par Google.
        </p>
        <div className="mt-3.5 flex flex-col gap-2">
          {[
            {
              t: "Guide d'examen Professional Cloud Architect",
              u: "https://cloud.google.com/learn/certification/guides/professional-cloud-architect",
            },
            {
              t: "Études de cas officielles v6.1",
              u: "https://services.google.com/fh/files/misc/v6.1_pca_professional_cloud_architect_exam_guide_english.pdf",
            },
            { t: "Documentation Google Cloud", u: "https://cloud.google.com/docs" },
            { t: "Parcours de formation Google Cloud", u: "https://www.cloudskillsboost.google/" },
          ].map((s) => (
            <a
              key={s.u}
              href={s.u}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 rounded-[4px] border border-borderline px-3.5 py-2.5 text-[13px] font-semibold text-textmain no-underline transition-colors hover:bg-hover"
            >
              <span className="min-w-0 truncate">{s.t}</span>
              <Icon name="link" size={14} className="shrink-0 text-textmuted" />
            </a>
          ))}
        </div>
        <p className="mt-3.5 text-[12.5px] leading-relaxed text-textmuted">
          Les polices Inter et JetBrains Mono sont distribuées sous licence SIL Open Font License
          1.1. Le seuil de réussite de 70 % affiché dans le mode Examen est une cible
          d'entraînement : Google ne publie pas le score de passage réel.
        </p>
      </Block>

      {/* ── Raccourcis ──────────────────────────────────────────────────── */}
      <Block icon="help-circle" title="Raccourcis clavier" className="mt-4">
        <div className="grid grid-cols-2 gap-x-6 max-sm:grid-cols-1">
          {[
            ["Ctrl / Cmd + K", "Placer le curseur dans la recherche"],
            ["← →", "Leçon précédente ou suivante"],
            ["← →", "Question précédente ou suivante en examen"],
            ["Échap", "Fermer le zoom d'une diapositive"],
          ].map(([k, d], i) => (
            <div key={i} className="flex items-baseline justify-between gap-4 border-b border-borderline py-2.5">
              <kbd className="label-mono-sm shrink-0 rounded-[2px] border border-borderline px-1.5 py-0.5 text-textmain">
                {k}
              </kbd>
              <span className="min-w-0 text-right text-[13px] text-textmuted">{d}</span>
            </div>
          ))}
        </div>
      </Block>

      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        <Button as="a" href="#/courses" variant="primary" icon="book">
          Voir les cours
        </Button>
        <Button as="a" href="#/exam" variant="outline" icon="award">
          Mode Examen
        </Button>
        <Button as="a" href="#/settings" variant="ghost" icon="settings">
          Paramètres
        </Button>
      </div>

      <p className="mt-8 text-[12px] leading-relaxed text-textmuted">
        Outil de révision personnel, sans lien avec Google. Google Cloud, Google Kubernetes Engine
        et les noms de produits cités sont des marques de Google LLC.
      </p>
    </div>
  );
}
