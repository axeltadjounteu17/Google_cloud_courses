import React from "react";
import Icon from "../lib/icons.jsx";
import { useStore } from "../lib/store.jsx";
import { DeckGrid } from "../components/cards.jsx";
import { Card, Badge, Breadcrumb, EmptyState } from "../components/ui.jsx";

export default function Slides({ cid }) {
  const { findCourse, slideForCourse, slidesTotal } = useStore();
  const c = findCourse(cid);
  const s = slideForCourse(cid);

  if (!c || !s || !s.decks.length) return <div className="container mx-auto max-w-[1080px]"><EmptyState title="Aucune diapositive" sub="" /></div>;

  const total = slidesTotal(cid);
  return (
    <div className="container mx-auto max-w-[1080px]">
      <Card className="mb-5 p-6 max-sm:p-4">
        <Breadcrumb items={[{ label: c.title, href: `#/course/${cid}` }, { label: "Diapositives" }]} />
        <div className="mb-2 flex items-center gap-3">
          <span className="flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-violet/15 text-violet"><Icon name="layers" size={22} /></span>
          <h1 className="text-[22px]">Diapositives du cours</h1>
        </div>
        <div className="mb-3 flex flex-wrap gap-2.5">
          <Badge color="violet">{s.decks.length} modules</Badge>
          <Badge>{total} diapositives</Badge>
        </div>
        <p className="text-sm text-textmuted">Les schémas d'architecture et les points clés des modules, en français.</p>
      </Card>
      <DeckGrid cid={cid} />
    </div>
  );
}
