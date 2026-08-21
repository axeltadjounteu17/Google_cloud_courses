import React from "react";
import Icon from "../lib/icons.jsx";
import { Link } from "../lib/router.jsx";
import { Badge, Card } from "../components/ui.jsx";
import { CASE_STUDIES, QUESTIONS } from "../lib/exam.js";

const TONE = {
  violet: { chip: "bg-hover text-textmain", text: "text-textmain", edge: "hover:border-borderline" },
  orange: { chip: "bg-hover text-textmain", text: "text-textmain", edge: "hover:border-borderline" },
  cyan: { chip: "bg-hover text-textmain", text: "text-textmain", edge: "hover:border-borderline" },
  green: { chip: "bg-hover text-textmain", text: "text-textmain", edge: "hover:border-borderline" },
};

export default function CaseStudies() {
  return (
    <div className="ambient container mx-auto max-w-[900px]">
      <header className="mb-6">
        <h1 className="text-h2 leading-snug text-textmain">Études de cas</h1>
        <p className="mt-1.5 max-w-[680px] text-[13.5px] leading-relaxed text-textmuted">
          Les quatre études de cas officielles du guide d'examen v6.1. Entre 30 et 40 % de
          l'épreuve s'appuie dessus : il faut les connaître avant le jour J, pas les découvrir
          pendant.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {CASE_STUDIES.map((c) => {
          const t = TONE[c.color] || TONE.cyan;
          const nq = QUESTIONS.filter((q) => q.caseStudy === c.id).length;
          return (
            <Card key={c.id} className="p-5 max-sm:p-4">
              <div className="flex items-start gap-4 max-sm:gap-3">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[4px]  ${t.chip}`}>
                  <Icon name={c.icon} size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                    <h2 className={`text-[16px] font-bold ${t.text}`}>{c.name}</h2>
                    <span className="text-[12px] text-textmuted">{c.sector}</span>
                  </div>
                  <p className="mt-1 text-[13.5px] leading-snug text-textmuted">{c.tagline}</p>

                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {c.keywords.slice(0, 5).map((k) => (
                      <span key={k} className="rounded-full bg-hover px-2.5 py-0.5 text-[11px] font-semibold text-textmuted">
                        {k}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3.5 flex flex-wrap items-center gap-2">
                    <Link
                      href={`#/case/${c.id}`}
                      className="inline-flex items-center gap-1.5 rounded-[4px] bg-textmain px-3.5 py-2 text-[12.5px] font-bold text-onaccent no-underline transition-opacity hover:opacity-90"
                    >
                      <Icon name="book-open" size={14} /> Lire la fiche
                    </Link>
                    <Link
                      href={`#/exam/run/case/${c.id}`}
                      className="inline-flex items-center gap-1.5 rounded-[4px] border border-borderline px-3.5 py-2 text-[12.5px] font-bold text-textmain no-underline transition-colors hover:bg-hover"
                    >
                      <Icon name="target" size={14} /> {nq} questions
                    </Link>
                    <a
                      href={c.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-[4px] border border-borderline px-3.5 py-2 text-[12.5px] font-bold text-textmuted no-underline transition-colors hover:bg-hover hover:text-textmain"
                    >
                      <Icon name="link" size={14} /> PDF officiel
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6 p-5 max-sm:p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px]  bg-hover text-textmain">
            <Icon name="help-circle" size={17} />
          </span>
          <div className="min-w-0">
            <h2 className="text-[14px] font-bold">Attention aux anciennes études de cas</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-textmuted">
              Mountkirk Games, Helicopter Racing League et TerramEarth sortent de l'examen au
              30 octobre. Les annales qui les utilisent restent utiles pour le raisonnement, mais
              les quatre fiches ci-dessus sont celles qui comptent désormais.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
