"use client";

import { useEffect, useState } from "react";
import IdeaCard from "./IdeaCard";
import NewIdeaForm from "./NewIdeaForm";
import ThemeToggle from "./ThemeToggle";
import { TYPE_LABELS } from "@/lib/types";

interface Idea {
  id: string; title: string; description: string; type: string;
  typeLabel: string; status: string; author: string; votes: number;
  duplicateIds: string; createdAt: string;
}

type SortKey = "recentes" | "antigas" | "mais_votadas";

const SORT_LABELS: Record<SortKey, string> = {
  recentes: "Recentes",
  antigas: "Antigas",
  mais_votadas: "Mais votadas",
};

export default function IdeaGrid({ initialIdeas }: { initialIdeas: Idea[] }) {
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [filter, setFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("recentes");

  async function refresh() {
    const res = await fetch("/api/ideas");
    setIdeas(await res.json());
  }

  async function handleVote(id: string) {
    await fetch(`/api/ideas/${id}/vote`, { method: "POST" });
  }

  function handleDelete(id: string) {
    setIdeas((prev) => prev.filter((i) => i.id !== id));
  }

  useEffect(() => { setIdeas(initialIdeas); }, [initialIdeas]);

  const filtered = ideas
    .filter((idea) => {
      const matchType = filter === "todos" || idea.type === filter;
      const q = search.toLowerCase();
      return matchType && (!q || idea.title.toLowerCase().includes(q) ||
        idea.description.toLowerCase().includes(q) || idea.author.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      if (sort === "mais_votadas") return b.votes - a.votes;
      if (sort === "antigas") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const typeOptions = [
    { value: "todos", label: "Todas" },
    ...Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label })),
  ];

  return (
    <div className="space-y-5">
      {/* Filtros de tipo */}
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

      {/* Linha de busca + ordenação + toggle */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">Ordenar:</span>
          {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${
                sort === key
                  ? "bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 border-gray-900 dark:border-slate-100"
                  : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-gray-400"
              }`}
            >
              {key === "mais_votadas" ? "▲ " : ""}{SORT_LABELS[key]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar ideias..."
            className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 flex-1 sm:w-52"
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
            <IdeaCard key={idea.id} idea={idea} allIdeas={ideas} onVote={handleVote} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <div className="fixed bottom-6 right-6">
        <NewIdeaForm onCreated={refresh} />
      </div>
    </div>
  );
}
