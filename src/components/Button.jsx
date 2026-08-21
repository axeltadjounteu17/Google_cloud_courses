import React from "react";
import Icon from "../lib/icons.jsx";

/**
 * Boutons du système Monochrome Logic.
 *
 * Trois niveaux, repris de la spécification des maquettes :
 *   · primary   — surface pleine inversée, encre opposée. Contraste maximal,
 *                 sans ombre. C'est l'affordance principale.
 *   · secondary — fond transparent, bordure de 1 px, même encre que le texte.
 *   · ghost     — ni fond ni bordure, encre secondaire qui s'éclaircit au
 *                 survol. Pour les actions peu critiques.
 *   · danger    — réservé aux actions destructrices ; `red` est la seule
 *                 teinte que le système autorise.
 *
 * Les libellés sont en mono capitales : c'est la signature « outil technique »
 * du système. `plain` permet de revenir à la casse normale quand le libellé
 * est une phrase.
 */

const VARIANTS = {
  primary: "bg-accent text-onaccent border border-textmain hover:opacity-90",
  secondary: "bg-transparent text-textmain border border-textmain hover:bg-hover",
  outline: "bg-transparent text-textmain border border-borderline hover:bg-hover hover:border-edgered",
  ghost: "bg-transparent text-textmuted border border-transparent hover:text-textmain hover:bg-hover",
  danger: "bg-transparent text-red border border-edgered hover:bg-tintred",
};

const SIZES = {
  sm: "h-8 px-3 gap-1.5",
  md: "h-10 px-4 gap-2",
  lg: "h-12 px-6 gap-2.5",
};

const LABEL = {
  sm: "label-mono-sm",
  md: "label-mono",
  lg: "label-mono",
};

export default function Button({
  as = "button",
  variant = "secondary",
  size = "md",
  icon,
  iconEnd,
  plain = false,
  full = false,
  className = "",
  children,
  ...rest
}) {
  const Tag = as;
  const iconSize = size === "sm" ? 14 : size === "lg" ? 18 : 16;
  const label = plain
    ? size === "sm" ? "text-[12.5px] font-semibold" : "text-[13.5px] font-semibold"
    : LABEL[size];

  return (
    <Tag
      className={`inline-flex shrink-0 items-center justify-center rounded-[4px] no-underline transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        VARIANTS[variant]
      } ${SIZES[size]} ${label} ${full ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {icon && <Icon name={icon} size={iconSize} className="shrink-0" />}
      {children && <span className="truncate">{children}</span>}
      {iconEnd && <Icon name={iconEnd} size={iconSize} className="shrink-0" />}
    </Tag>
  );
}

/**
 * Pied d'action, disposé comme celui de la maquette d'évaluation :
 * un filet horizontal, l'action secondaire à gauche, et le groupe
 * retour / avancer aligné à droite.
 */
export function ActionBar({ left, children, className = "" }) {
  return (
    <div className={`mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-borderline pt-5 ${className}`}>
      <div className="flex min-w-0 items-center gap-2">{left}</div>
      <div className="flex items-center gap-2.5">{children}</div>
    </div>
  );
}
