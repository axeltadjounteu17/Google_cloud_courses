import React from "react";

/**
 * Identité de GCP Étude.
 *
 * Le motif est un hexagone : c'est la forme des icônes de produits Google
 * Cloud, donc elle situe immédiatement le domaine. À l'intérieur, trois barres
 * ascendantes disent à la fois l'architecture qu'on empile et la progression
 * de la révision — les deux sujets de l'application.
 *
 * Le tracé n'utilise que `currentColor` et une couleur d'accent, sans dégradé
 * ni ombre : lisible dès 16 px, et compatible avec les deux thèmes.
 */

// Hexagone à sommet plat, centré dans une boîte 32×32.
const HEX = "M16 2.6 27.6 9.3v13.4L16 29.4 4.4 22.7V9.3z";

export function LogoMark({ size = 34, className = "", title = "GCP Étude" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label={title}
      className={className}
      fill="none"
    >
      <path d={HEX} className="fill-blue" />
      {/* Trois barres ascendantes : architecture empilée, progression. */}
      <g className="fill-onaccent">
        <rect x="10" y="18.4" width="3.4" height="5.2" rx="1.1" />
        <rect x="14.3" y="14.6" width="3.4" height="9" rx="1.1" />
        <rect x="18.6" y="10.4" width="3.4" height="13.2" rx="1.1" />
      </g>
    </svg>
  );
}

/** Marque + nom + sous-titre en petites capitales espacées. */
export default function Logo({ size = 34, compact = false, className = "" }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      {!compact && (
        <span className="min-w-0 leading-none">
          <span className="block text-[15px] font-bold tracking-[-0.01em] text-textmain">
            GCP Étude
          </span>
          <span className="mt-[3px] block text-[9px] font-bold tracking-[0.14em] text-textmuted uppercase">
            Cloud Architect
          </span>
        </span>
      )}
    </span>
  );
}
