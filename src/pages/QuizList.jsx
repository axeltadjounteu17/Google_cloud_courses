import React from "react";
import Icon from "../lib/icons.jsx";
import { useStore } from "../lib/store.jsx";
import { Link } from "../lib/router.jsx";
import { Card, Badge, SectionTitle } from "../components/ui.jsx";
import QUIZ from "../data/quizzes.js";

const KIND = {
  flash: "Flashcards",
  mcq: "QCM",
  quiz: "QCM",
};

export default function QuizList() {
  const store = useStore();
  const { ALL_COURSES } = store;
  const quizzes = QUIZ.quizzes || [];

  const items = quizzes.map((q) => {
    const course = ALL_COURSES.find((c) => c.folder === q.folder);
    const breakdown = {};
    q.questions.forEach((x) => { breakdown[x.type] = (breakdown[x.type] || 0) + 1; });
    return { ...q, icon: course ? course.icon : "shield", breakdown };
  });

  const total = items.reduce((n, q) => n + q.questions.length, 0);

  return (
    <div className="container mx-auto max-w-[1080px]">
      <div className="mb-6 rounded-[16px] border border-orange/25 bg-gradient-to-br from-orange/20 via-orange/5 p-6 backdrop-blur-2xl max-sm:p-4">
        <h1 className="mb-1 text-h2 font-semibold text-orange">Quiz de révision</h1>
        <p className="text-sm text-textmuted">
          <strong className="text-textmain">{items.length} cours</strong>, <strong className="text-textmain">{total} questions</strong> pour consolider vos acquis avant l'examen. Vérifiez ce que vous retenez de chaque module.
        </p>
      </div>

      <SectionTitle>Choisissez un cours</SectionTitle>
      <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {items.map((q) => (
          <Link key={q.courseId} href={`#/quiz/${q.courseId}`} className="group no-underline">
            <Card className="flex h-full items-center gap-4 p-5 transition-colors group-hover:border-orange/40 max-sm:p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-orange/15 text-orange">
                <Icon name={q.icon} size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-bold text-textmain">{q.title}</div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <Badge color="orange">{q.questions.length} questions</Badge>
                  {Object.entries(q.breakdown).map(([k, n]) => (
                    <Badge key={k}>{n} {KIND[k] || k}</Badge>
                  ))}
                </div>
              </div>
              <Icon name="chevron-right" size={18} className="shrink-0 text-textmuted transition-transform group-hover:translate-x-0.5" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
