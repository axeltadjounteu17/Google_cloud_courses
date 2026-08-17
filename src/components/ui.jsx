import React from "react";
import Icon from "../lib/icons.jsx";

export function Badge({ children, color = "" }) {
  const colors = {
    blue: "bg-blue/15 text-blue",
    green: "bg-green/15 text-green",
    cyan: "bg-cyan/15 text-cyan",
    red: "bg-red/15 text-red",
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
        className="h-full rounded-full bg-gradient-to-r from-blue to-green transition-[width] duration-500 ease-out"
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

export function SectionTitle({ children, link, linkHref }) {
  return (
    <div className="mb-3.5 mt-7 flex items-baseline justify-between gap-2 max-sm:flex-col max-sm:items-start">
      <h2 className="text-[17px] font-semibold">{children}</h2>
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
    <div className={`rounded-[14px] border border-borderline bg-secondary shadow-[0_8px_30px_-10px_rgba(0,0,0,0.5)] ${className}`} style={style}>
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
