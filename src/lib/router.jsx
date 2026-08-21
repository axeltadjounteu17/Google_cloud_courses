import React, { useEffect, useState } from "react";

const ROUTES = {
  course: /^course\/(\d+)$/,
  lesson: /^lesson\/(\d+)\/(\d+)$/,
  slides: /^slides\/(\d+)$/,
  slide: /^slide\/(\d+)\/([^/]+)\/(\d+)$/,
  courses: /^courses$/,
  search: /^search$/,
  progress: /^progress$/,
  settings: /^settings$/,
  quiz: /^quiz$/,
  quizc: /^quiz\/(\d+)$/,
  exam: /^exam$/,
  examrun: /^exam\/run\/(full|review)$/,
  examrunt: /^exam\/run\/(section|case)\/([^/]+)$/,
  cases: /^cases$/,
  case: /^case\/([^/]+)$/,
  about: /^about$/,
};

function parse(hash) {
  const raw = hash.replace(/^#\/?/, "");
  const qIdx = raw.indexOf("?");
  const path = (qIdx >= 0 ? raw.slice(0, qIdx) : raw) || "home";
  // La query était supprimée sans être conservée : la recherche lancée depuis
  // la barre supérieure arrivait donc sur une page vide.
  const query = Object.fromEntries(new URLSearchParams(qIdx >= 0 ? raw.slice(qIdx + 1) : ""));

  for (const [page, re] of Object.entries(ROUTES)) {
    const m = path.match(re);
    if (m) return { page, params: m.slice(1), query };
  }
  return { page: "home", params: [], query };
}

/** Lit un paramètre de query depuis le hash courant, hors composant React. */
export function queryParam(name) {
  const raw = (location.hash || "").replace(/^#\/?/, "");
  const qIdx = raw.indexOf("?");
  if (qIdx < 0) return "";
  return new URLSearchParams(raw.slice(qIdx + 1)).get(name) || "";
}

export function useRoute() {
  const [hash, setHash] = useState(() => location.hash || "#/home");

  useEffect(() => {
    const onChange = () => {
      setHash(location.hash || "#/home");
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return { ...parse(hash), hash };
}

export function Link({ href, className = "", children, onClick, ...rest }) {
  return (
    <a href={href} className={className} onClick={onClick} {...rest}>
      {children}
    </a>
  );
}
