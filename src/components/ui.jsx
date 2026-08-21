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
/**
 * Rôle visuel commun. `accent` est fixé par `data-section` dans App.jsx :
 * chaque page reprend donc la couleur de son entrée de menu, alors que les
 * surfaces restent monochromes.
 */
const ROLE = {
  title: "text-accent",
  chip: "bg-tintaccent text-accent",
  active: "bg-tintaccent text-accent",
  btn: "bg-accent text-onaccent",
  badge: "",
};

export const SECTION = {
  home: ROLE, courses: ROLE, quiz: ROLE, exam: ROLE,
  cases: ROLE, progress: ROLE, search: ROLE, settings: ROLE, about: ROLE,
};

/**
 * Puce de statut. Seule forme en pilule autorisée par la spécification.
 * Achromatique : `red` est la seule teinte, réservée à l'erreur.
 */
/**
 * Puce de statut. Seule forme en pilule du système.
 * Sans couleur précisée, elle prend l'accent de la section courante.
 */
export function Badge({ children, color = "" }) {
  const TONES = {
    blue: "bg-tintblue text-blue border-edgeblue",
    cyan: "bg-tintcyan text-cyan border-edgecyan",
    green: "bg-tintgreen text-green border-edgegreen",
    violet: "bg-tintviolet text-violet border-edgeviolet",
    orange: "bg-tintorange text-orange border-edgeorange",
    yellow: "bg-tintyellow text-yellow border-edgeyellow",
    red: "bg-tintred text-red border-edgered",
    neutral: "bg-hover text-textmuted border-borderline",
  };
  const tone = TONES[color] || "bg-tintaccent text-accent border-edgeaccent";
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
