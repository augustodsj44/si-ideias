"use client";

import { useEffect, useState } from "react";
import IdeaCard from "./IdeaCard";
import NewIdeaForm from "./NewIdeaForm";
import ThemeToggle from "./ThemeToggle";
import { TYPE_LABELS } from "@/lib/types";

interface Idea {
  id: string;
  title: string;
  description: string;
  type: string;
  typeLabel: string;
  status: string;
  author: string;
  votes: number;
  duplicateIds: string;
  createdAt: string;
}

interface Props {
  initialIdeas: Idea[];
}

export default function IdeaGrid({ initialIdeas }: Props) {
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [filter, setFilter] = useState("todos");
  const [search, setSearch] = useState("");

  async function refresh() {
    const res = await fetch("/api/ideas");
    const data = await res.json();
    setIdeas(data);
  }

  async function handleVote(id: string) {
    await fetch(`/api/ideas/${id}/vote`, { method: "POST" });
  }

  function handleDelete(id: string) {
    setIdeas((prev) => prev.filter((i) => i.id !== id));
  }

  useEffect(() => {
    setIdeas(initialIdeas);
  }, [initialIdeas]);

  const filtered = ideas.filter((idea) => {
    const matchType = filter === "todos" || idea.type === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      idea.title.toLowerCase().includes(q) ||
      idea.description.toLowerCase().includes(q) ||
      idea.author.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  const typeOptions = [
    { value: "todos", label: "Todas" },
    ...Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${
                filter === opt.value
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar ideias..."
            className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 flex-1 sm:w-56"
          />
          <ThemeToggle />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-slate-500">
          <div className="text-5xl mb-3">💡</div>
          <p className="text-lg font-medium">Nenhuma ideia encontrada</p>
          <p className="text-sm mt-1">Seja o primeiro a sugerir uma melhoria!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              allIdeas={ideas}
              onVote={handleVote}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <div className="fixed bottom-6 right-6">
        <NewIdeaForm onCreated={refresh} />
      </div>
    </div>
  );
}
