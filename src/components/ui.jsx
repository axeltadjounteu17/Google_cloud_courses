import React from "react";
import Icon from "../lib/icons.jsx";

/**
 * Rôles de section.
 *
 * Le système est achromatique : les sept teintes d'origine pointent toutes
 * vers le neutre dans index.css. Ce tableau conserve donc la même forme, mais
 * l'entrée active se distingue par l'inversion — surface claire, encre sombre —
 * plutôt que par une couleur, comme dans les maquettes.
 */
const ROLE = {
  title: "text-textmain",
  chip: "bg-hover text-textmain",
  // Entrée de menu active : inversion, comme « Home » dans la maquette.
  active: "bg-textmain text-onaccent",
  // Bouton primaire : surface claire, encre sombre en thème sombre, et
  // l'inverse en thème clair. C'est le contraste maximal de la spécification.
  btn: "bg-textmain text-onaccent",
  badge: "",
};

export const SECTION = {
  home: ROLE, courses: ROLE, quiz: ROLE, exam: ROLE,
  cases: ROLE, progress: ROLE, search: ROLE, settings: ROLE,
};

/**
 * Puce de statut. Seule forme en pilule autorisée par la spécification.
 * Achromatique : `red` est la seule teinte, réservée à l'erreur.
 */
export function Badge({ children, color = "" }) {
  const tone = color === "red" ? "bg-tintred text-red border-edgered" : "bg-hover text-textmuted border-borderline";
  return (
    <span className={`label-mono-sm inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${tone}`}>
      {children}
    </span>
  );
}

/** Barre de progression à bouts carrés : aspect architectural, pas de capuchons. */
export function ProgressBar({ pct = 0, h = "h-1" }) {
  return (
    <div className={`bar-track w-full ${h}`}>
      <div className="bar-fill" style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  );
}

export function EmptyState({ title, sub }) {
  return (
    <div className="py-16 px-5 text-center text-textmuted">
      <div className="mb-4 flex justify-center opacity-50"><Icon name="search" size={42} /></div>
      <h3 className="mb-1.5 text-base font-semibold text-textmain">{title}</h3>
      <p className="text-sm">{sub}</p>
    </div>
  );
}

export function SectionTitle({ children, link, linkHref, className = "" }) {
  return (
    <div className={`mb-3.5 mt-7 flex items-baseline justify-between gap-2 max-sm:flex-col max-sm:items-start ${className}`}>
      <h2 className="text-h3">{children}</h2>
      {link && (
        <a className="text-[13px] font-semibold text-textmain no-underline" href={linkHref}>
          {link}
        </a>
      )}
    </div>
  );
}

export function Card({ children, className = "", style }) {
  return (
    <div className={`rounded-[8px] border border-borderline bg-secondary ${className}`} style={style}>
      {children}
    </div>
  );
}

export function Breadcrumb({ items }) {
  return (
    <div className="mb-2.5 text-xs text-textmuted">
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {it.href ? (
            <a className="text-textmain no-underline" href={it.href}>{it.label}</a>
          ) : (
            <span>{it.label}</span>
          )}
          {i < items.length - 1 && <span className="mx-1">›</span>}
        </React.Fragment>
      ))}
    </div>
  );
}
