import React, { useEffect, useMemo, useState } from "react";
import Icon from "../lib/icons.jsx";
import { useStore } from "../lib/store.jsx";
import { Link, queryParam } from "../lib/router.jsx";
import { Card, EmptyState, SectionTitle } from "../components/ui.jsx";

export default function Search() {
  const { ALL_COURSES, DATA } = useStore();
  // Amorcée par ?q= : la recherche lancée depuis la barre supérieure arrive
  // ici avec son terme déjà appliqué.
  const [query, setQuery] = useState(() => queryParam("q"));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Une nouvelle recherche depuis la barre supérieure alors que la page est
  // déjà ouverte doit mettre le champ à jour.
  useEffect(() => {
    const sync = () => {
      const q = queryParam("q");
      if (q) setQuery(q);
    };
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  // Le terme reste dans l'URL : la recherche devient partageable et
  // survit à un rechargement.
  useEffect(() => {
    const t = setTimeout(() => {
      const target = query.trim() ? `#/search?q=${encodeURIComponent(query.trim())}` : "#/search";
      if (location.hash !== target) history.replaceState(null, "", target);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const hits = [];
    for (const c of ALL_COURSES) {
      const lessons = c.lessons || [];
      for (let li = 0; li < lessons.length; li++) {
        const l = lessons[li];
        const ls = l.title.toLowerCase();
        const lh = l.segments.filter((s) => !s.h).map((s) => s.text.toLowerCase());
        if (ls.includes(q)) {
          hits.push({ c, li, l, seg: null, kind: "title" });
          continue;
        }
        const segIdx = lh.findIndex((t) => t.includes(q));
        if (segIdx >= 0) {
          const seg = l.segments.filter((s) => !s.h)[segIdx];
          hits.push({ c, li, l, seg, kind: "text" });
        }
      }
    }
    return hits.slice(0, 12);
  }, [query, ALL_COURSES]);

  const highlight = (txt) => {
    const q = query.trim();
    if (!q) return txt;
    const i = txt.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return txt;
    return (
      <>
        {txt.slice(0, i)}
        <mark className="rounded bg-hover px-0.5 text-inherit">{txt.slice(i, i + q.length)}</mark>
        {txt.slice(i + q.length)}
      </>
    );
  };

  return (
    <div className="container mx-auto max-w-[860px]">
      <h1 className="mb-1.5 text-h2 text-textmain">Recherche dans les cours</h1>
      <p className="mb-5 text-sm text-textmuted">Cherchez dans {DATA.courses.length} cours et {DATA.courses.reduce((a, c) => a + (c.lessons?.length || 0), 0)} leçons.</p>

      <div className="mb-6 flex items-center gap-3 rounded-[8px] border border-borderline bg-secondary px-4">
        <Icon name="search" size={18} className="shrink-0 text-textmuted" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex : IAM, bucket, firewall, réseau VPC…"
          className="w-full bg-transparent py-3.5 text-[15px] text-textmain outline-none placeholder:text-textmuted"
        />
        {query && (
          <button onClick={() => setQuery("")} className="shrink-0 text-textmuted hover:text-textmain" aria-label="Effacer">
            <Icon name="x" size={18} />
          </button>
        )}
      </div>

      {!query && (
        <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
          {["IAM", "VPC", "Cloud Storage", "Kubernetes", "BigQuery", "Cloud Run"].map((s) => (
            <button key={s} onClick={() => setQuery(s)} className="rounded-[8px] border border-borderline bg-secondary px-4 py-3.5 text-sm font-semibold text-textmain transition-colors hover:bg-hover">
              {s}
            </button>
          ))}
        </div>
      )}

      {query && (
        items.length ? (
          <div className="flex flex-col gap-2">
            {items.map((h, i) => (
              <Card key={i} className="p-4">
                <Link href={`#/lesson/${h.c.id}/${h.li}`} className="no-underline">
                  <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold tracking-wide text-textmain uppercase">
                    {h.c.title} · Leçon {h.li + 1}
                  </div>
                  <div className="mb-1 text-sm font-bold">{h.l.title}</div>
                  {h.seg && <div className="line-clamp-2 text-[13px] leading-relaxed text-textmuted">{highlight(h.seg.text)}</div>}
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title="Aucun résultat" sub={`Aucune leçon ne correspond à « ${query} ». Essayez un autre mot-clé.`} />
        )
      )}

      {!query && (
        <div className="mt-8">
          <SectionTitle>Suggestions</SectionTitle>
          <div className="rounded-[8px] border border-borderline bg-secondary p-5 text-sm leading-relaxed text-textmuted">
            La recherche parcourt les titres des leçons et le contenu des transcriptions vidéo. Tapez un sujet (ex : « bucket », « service account », « cluster ») pour trouver les leçons concernées.
          </div>
        </div>
      )}
    </div>
  );
}
