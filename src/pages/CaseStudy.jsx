import React from "react";
import Icon from "../lib/icons.jsx";
import { Link } from "../lib/router.jsx";
import { Badge, Breadcrumb, Card, EmptyState } from "../components/ui.jsx";
import { CASE_STUDIES, QUESTIONS, caseStudyById } from "../lib/exam.js";

const TONE = {
  violet: { chip: "bg-tintviolet text-violet", text: "text-violet", border: "border-edgeviolet", soft: "bg-tintviolet" },
  orange: { chip: "bg-tintorange text-orange", text: "text-orange", border: "border-edgeorange", soft: "bg-tintorange" },
  cyan: { chip: "bg-tintcyan text-cyan", text: "text-cyan", border: "border-edgecyan", soft: "bg-tintcyan" },
  green: { chip: "bg-tintgreen text-green", text: "text-green", border: "border-edgegreen", soft: "bg-tintgreen" },
};

// Rend les **passages en gras** des fiches sans injecter de HTML.
function RichText({ children }) {
  const parts = String(children).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <b key={i} className="font-semibold text-textmain">{p.slice(2, -2)}</b>
      : <React.Fragment key={i}>{p}</React.Fragment>
  );
}

function Block({ icon, title, children }) {
  return (
    <Card className="p-5 max-sm:p-4">
      <div className="mb-2.5 flex items-center gap-2">
        <Icon name={icon} size={16} className="text-textmuted" />
        <h2 className="text-[14px] font-bold tracking-wide uppercase">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

function Bullets({ items }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((t, i) => (
        <li key={i} className="flex gap-2.5 text-[13.5px] leading-relaxed text-textmuted">
          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-borderline" />
          <span><RichText>{t}</RichText></span>
        </li>
      ))}
    </ul>
  );
}

export default function CaseStudy({ id }) {
  const c = caseStudyById(id);

  if (!c) {
    return (
      <div className="container mx-auto max-w-[820px]">
        <Breadcrumb items={[{ label: "Examen", href: "#/exam" }, { label: "Étude de cas" }]} />
        <EmptyState title="Étude de cas introuvable" sub="Choisissez une étude de cas depuis le mode Examen." />
        <div className="mt-4 flex flex-wrap gap-2">
          {CASE_STUDIES.map((x) => (
            <Link key={x.id} href={`#/case/${x.id}`} className="rounded-[9px] border border-borderline px-3 py-1.5 text-[12.5px] font-bold no-underline">
              {x.name}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const tone = TONE[c.color] || TONE.cyan;
  const nq = QUESTIONS.filter((q) => q.caseStudy === c.id).length;

  return (
    <div className="container mx-auto max-w-[860px]">
      <Breadcrumb items={[{ label: "Examen", href: "#/exam" }, { label: c.name }]} />

      <div className="mb-5 flex items-start gap-4">
        <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[12px] ${tone.chip}`}>
          <Icon name={c.icon} size={26} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className={`text-h2 leading-snug ${tone.text}`}>{c.name}</h1>
          <p className="mt-1 text-[13.5px] text-textmuted">{c.sector} · {c.tagline}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {c.keywords.slice(0, 6).map((k) => (
              <span key={k} className="rounded-full bg-hover px-2.5 py-0.5 text-[11px] font-semibold text-textmuted">{k}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2.5">
        <Link
          href={`#/exam/run/case/${c.id}`}
          className="inline-flex items-center gap-2 rounded-[10px] bg-blue px-4 py-2.5 text-sm font-bold text-onaccent no-underline transition-opacity hover:opacity-90"
        >
          <Icon name="target" size={15} /> S'entraîner — {nq} questions
        </Link>
        <a
          href={c.source}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-[10px] border border-borderline px-4 py-2.5 text-sm font-bold text-textmain no-underline transition-colors hover:bg-hover"
        >
          <Icon name="link" size={15} /> PDF officiel
        </a>
      </div>

      <div className="flex flex-col gap-3">
        <Block icon="globe" title="Présentation de l'entreprise">
          <p className="text-[13.5px] leading-relaxed text-textmuted"><RichText>{c.overview}</RichText></p>
        </Block>

        <Block icon="sparkles" title="Concept de la solution">
          <p className="text-[13.5px] leading-relaxed text-textmuted"><RichText>{c.concept}</RichText></p>
        </Block>

        <Block icon="server" title="Environnement technique existant">
          <Bullets items={c.environment} />
        </Block>

        <Block icon="chart" title="Exigences métier">
          <Bullets items={c.business} />
        </Block>

        <Block icon="gauge" title="Exigences techniques">
          <Bullets items={c.technical} />
        </Block>

        <div className={`rounded-[12px] border ${tone.border} ${tone.soft} p-5 max-sm:p-4`}>
          <div className="mb-2.5 flex items-center gap-2">
            <Icon name="award" size={16} className={tone.text} />
            <h2 className={`text-[14px] font-bold tracking-wide uppercase ${tone.text}`}>Déclaration de la direction</h2>
          </div>
          <p className="text-[13.5px] leading-relaxed text-textmain italic"><RichText>{c.executive}</RichText></p>
        </div>
      </div>

      <div className="mt-8 mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-[17px] font-semibold">Autres études de cas</h2>
        <Link href="#/exam" className="text-[13px] font-semibold text-cyan no-underline">Mode Examen ›</Link>
      </div>
      <div className="grid grid-cols-3 gap-2.5 max-sm:grid-cols-1">
        {CASE_STUDIES.filter((x) => x.id !== c.id).map((x) => {
          const t = TONE[x.color] || TONE.cyan;
          return (
            <Link
              key={x.id}
              href={`#/case/${x.id}`}
              className="flex items-center gap-2.5 rounded-[12px] border border-borderline bg-secondary p-3 no-underline transition-colors hover:bg-hover"
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] ${t.chip}`}>
                <Icon name={x.icon} size={15} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-bold">{x.name}</span>
                <span className="block truncate text-[11px] text-textmuted">{x.sector}</span>
              </span>
            </Link>
          );
        })}
      </div>

      <p className="mt-8 text-[11.5px] leading-relaxed text-textmuted">
        Fiche résumée et traduite depuis le document officiel Google Cloud, à des fins de révision.
        Le PDF original reste la source de référence pour l'examen.
      </p>
    </div>
  );
}
