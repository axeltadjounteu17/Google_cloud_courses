import React, { useMemo, useState } from "react";
import { useStore } from "../lib/store.jsx";
import { CourseCard } from "../components/cards.jsx";
import { EmptyState } from "../components/ui.jsx";

export default function Courses() {
  const { ALL_COURSES, DATA, totalLessons, courseRead } = useStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const list = useMemo(() => {
    const q = query.toLowerCase();
    return ALL_COURSES.filter((c) => {
      if (c.slideCourse) return !q || c.title.toLowerCase().includes(q);
      if (filter === "progress" && courseRead(c) === 0) return false;
      if (filter === "done" && courseRead(c) !== c.lessons.length) return false;
      if (q && !c.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [ALL_COURSES, query, filter, courseRead]);

  return (
    <div className="ambient container mx-auto max-w-[1080px]">
      <h1 className="mb-1.5 text-h2 text-textmain">Tous les cours</h1>
      <p className="mb-5 text-sm text-textmuted">{DATA.courses.length} cours · {totalLessons()} leçons</p>

      <div className="mb-5 flex flex-wrap gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filtrer les cours…"
          className="w-full max-w-[360px] rounded-[8px] border border-borderline bg-secondary px-4 py-3 pl-10 text-[15px] text-textmain outline-none transition-[border,box-shadow] focus:border-textmain focus:"
          style={{ backgroundImage: "url(data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%237b8aab' stroke-width='2'><circle cx='11' cy='11' r='8'/><line x1='21' y1='21' x2='16.65' y2='16.65'/></svg>)", backgroundRepeat: "no-repeat", backgroundPosition: "14px 50%" }}
        />
        <div className="flex gap-2">
          {[
            { f: "all", l: "Tous" },
            { f: "progress", l: "En cours" },
            { f: "done", l: "Terminés" },
          ].map((x) => (
            <button
              key={x.f}
              onClick={() => setFilter(x.f)}
              className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                filter === x.f ? "border-textmain bg-textmain text-onaccent" : "border-borderline bg-transparent text-textmuted hover:bg-hover hover:text-textmain"
              }`}
            >
              {x.l}
            </button>
          ))}
        </div>
      </div>

      {list.length ? (
        <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          {list.map((c) => <CourseCard key={c.id} c={c} />)}
        </div>
      ) : (
        <EmptyState title="Aucun cours trouvé" sub="Ajustez votre recherche ou votre filtre." />
      )}
    </div>
  );
}
