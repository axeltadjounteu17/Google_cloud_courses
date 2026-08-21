import React, { useEffect, useRef, useState } from "react";
import Icon from "../lib/icons.jsx";
import { useStore } from "../lib/store.jsx";
import Notifications from "./Notifications.jsx";
import { LogoMark } from "./Logo.jsx";
import { queryParam } from "../lib/router.jsx";

/**
 * Barre supérieure, disposée comme celle des maquettes :
 * champ de recherche au centre, puis notifications, réglages et thème à
 * droite. Sur mobile, elle porte aussi le bouton d'ouverture du menu.
 */
export default function TopBar({ onOpenMenu }) {
  const { theme, toggleTheme } = useStore();
  const dark = theme === "dark";
  // Le champ reflète le terme courant, y compris après un rechargement.
  const [q, setQ] = useState(() => queryParam("q"));
  const inputRef = useRef(null);

  useEffect(() => {
    const sync = () => setQ(queryParam("q"));
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  // Ctrl/Cmd + K place le curseur dans la recherche, comme dans un outil de dev.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    const term = q.trim();
    // `location.hash` seul ne rejoue pas la navigation si le hash est
    // identique : on force alors un événement pour que la page se resynchronise.
    const target = term ? `#/search?q=${encodeURIComponent(term)}` : "#/search";
    if (location.hash === target) window.dispatchEvent(new HashChangeEvent("hashchange"));
    else location.hash = target;
    inputRef.current?.blur();
  };

  return (
    <header className="sticky top-0 z-30 flex h-[64px] shrink-0 items-center gap-3 border-b border-borderline bg-bg px-6 max-lg:px-4">
      <button
        className="icon-btn lg:hidden"
        onClick={onOpenMenu}
        aria-label="Ouvrir le menu"
      >
        <Icon name="menu" size={20} />
      </button>

      <a href="#/home" className="flex items-center gap-2 no-underline lg:hidden" aria-label="GCP Étude, accueil">
        <LogoMark size={22} />
      </a>

      <form onSubmit={submit} className="mx-auto flex w-full max-w-[420px] items-center max-lg:max-w-none" role="search">
        <label className="relative flex w-full items-center">
          <Icon name="search" size={16} className="pointer-events-none absolute left-3 text-textmuted" />
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher dans les cours…"
            aria-label="Rechercher dans les cours"
            className="h-9 w-full rounded-[4px] border border-borderline bg-secondary pr-14 pl-9 text-[13.5px] text-textmain outline-none transition-colors placeholder:text-textmuted focus:border-textmain"
          />
          <kbd className="label-mono-sm pointer-events-none absolute right-2.5 hidden rounded-[2px] border border-borderline px-1.5 py-0.5 text-textmuted lg:block">
            &#8984;K
          </kbd>
        </label>
      </form>

      <div className="ml-auto flex items-center gap-1">
        <Notifications />
        <a
          href="#/settings"
          aria-label="Paramètres"
          className="flex h-9 w-9 items-center justify-center rounded-[4px] border border-transparent text-textmuted no-underline transition-colors hover:bg-hover hover:text-textmain"
        >
          <Icon name="settings" size={18} />
        </a>
        <button
          onClick={toggleTheme}
          aria-label={dark ? "Passer en thème clair" : "Passer en thème sombre"}
          className="flex h-9 w-9 items-center justify-center rounded-[4px] border border-transparent text-textmuted transition-colors hover:bg-hover hover:text-textmain"
        >
          <Icon name={dark ? "sun" : "moon"} size={18} />
        </button>
      </div>
    </header>
  );
}
