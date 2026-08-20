import React from "react";
import Icon from "../lib/icons.jsx";

export const SECTION = {
  home:     { title: "text-cyan",       chip: "bg-tintcyan text-cyan",         active: "bg-tintcyan text-cyan",         btn: "bg-cyan text-onaccent",   badge: "cyan" },
  courses:  { title: "text-violet",     chip: "bg-tintviolet text-violet",     active: "bg-tintviolet text-violet",     btn: "bg-violet text-onaccent",  badge: "violet" },
  quiz:     { title: "text-orange",     chip: "bg-tintorange text-orange",     active: "bg-tintorange text-orange",     btn: "bg-orange text-onaccent",  badge: "orange" },
  exam:     { title: "text-blue",       chip: "bg-tintblue text-blue",         active: "bg-tintblue text-blue",         btn: "bg-blue text-onaccent",  badge: "blue" },
  cases:    { title: "text-violet",   chip: "bg-tintviolet text-violet", active: "bg-tintviolet text-violet", btn: "bg-violet text-onaccent",  badge: "violet" },
  progress: { title: "text-green",      chip: "bg-tintgreen text-green",       active: "bg-tintgreen text-green",       btn: "bg-green text-onaccent",  badge: "green" },
  search:   { title: "text-cyan",       chip: "bg-tintcyan text-cyan",         active: "bg-tintcyan text-cyan",         btn: "bg-cyan text-onaccent",   badge: "cyan" },
  settings: { title: "text-textmain",   chip: "bg-hover text-textmuted",      active: "bg-hover text-textmain",       btn: "bg-textmain text-bg", badge: "" },
};

export function Badge({ children, color = "" }) {
  const colors = {
    blue: "bg-tintblue text-blue",
    green: "bg-tintgreen text-green",
    cyan: "bg-tintcyan text-cyan",
    red: "bg-tintred text-red",
    violet: "bg-tintviolet text-violet",
    orange: "bg-tintorange text-orange",
    yellow: "bg-tintyellow text-yellow",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${colors[color] || "bg-hover text-textmuted"}`}>
      {children}
    </span>
  );
}

export function ProgressBar({ pct = 0, h = "h-1.5" }) {
  return (
    <div className={`w-full overflow-hidden rounded-full bg-hover ${h}`}>
      <div
        className="h-full rounded-full bg-blue transition-[width] duration-500 ease-out"
        style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
      />
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
        <a className="text-[13px] font-semibold text-cyan no-underline" href={linkHref}>
          {link}
        </a>
      )}
    </div>
  );
}

export function Card({ children, className = "", style }) {
  return (
    <div className={`rounded-[12px] border border-borderline bg-secondary ${className}`} style={style}>
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
            <a className="text-cyan no-underline" href={it.href}>{it.label}</a>
          ) : (
            <span>{it.label}</span>
          )}
          {i < items.length - 1 && <span className="mx-1">›</span>}
        </React.Fragment>
      ))}
    </div>
  );
}
