"use client";

import { useEffect, useRef, useState } from "react";
import { TYPE_COLORS, TYPE_ICONS, TYPE_LABELS, type IdeaType } from "@/lib/types";

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
  idea: Idea;
  allIdeas: Idea[];
  onVote: (id: string) => void;
}

const STATUS_STYLES: Record<string, string> = {
  aberta: "bg-green-100 text-green-700",
  em_analise: "bg-yellow-100 text-yellow-700",
  aprovada: "bg-blue-100 text-blue-700",
  concluida: "bg-gray-100 text-gray-500",
  rejeitada: "bg-red-100 text-red-500",
};

const STATUS_LABELS: Record<string, string> = {
  aberta: "Aberta",
  em_analise: "Em análise",
  aprovada: "Aprovada",
  concluida: "Concluída",
  rejeitada: "Rejeitada",
};

export default function IdeaCard({ idea, allIdeas, onVote }: Props) {
  const [voted, setVoted] = useState(false);
  const [votes, setVotes] = useState(idea.votes);
  const [expanded, setExpanded] = useState(false);
  const [currentType, setCurrentType] = useState(idea.type);
  const [currentTypeLabel, setCurrentTypeLabel] = useState(idea.typeLabel);
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const [savingType, setSavingType] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const duplicateIds: string[] = JSON.parse(idea.duplicateIds || "[]");
  const duplicates = allIdeas.filter((i) => duplicateIds.includes(i.id));

  const typeKey = currentType as IdeaType;
  const typeColor = TYPE_COLORS[typeKey] ?? TYPE_COLORS.outro;
  const typeIcon = TYPE_ICONS[typeKey] ?? "💡";

  const statusStyle = STATUS_STYLES[idea.status] ?? STATUS_STYLES.aberta;
  const statusLabel = STATUS_LABELS[idea.status] ?? idea.status;

  const date = new Date(idea.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setTypeMenuOpen(false);
      }
    }
    if (typeMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [typeMenuOpen]);

  async function handleVote() {
    if (voted) return;
    setVoted(true);
    setVotes((v) => v + 1);
    onVote(idea.id);
  }

  async function handleTypeChange(newType: IdeaType) {
    if (newType === currentType) { setTypeMenuOpen(false); return; }
    setSavingType(true);
    setTypeMenuOpen(false);
    try {
      const res = await fetch(`/api/ideas/${idea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: newType }),
      });
      if (res.ok) {
        setCurrentType(newType);
        setCurrentTypeLabel(TYPE_LABELS[newType]);
      }
    } finally {
      setSavingType(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 text-base leading-snug flex-1">
          {idea.title}
        </h3>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusStyle}`}>
          {statusLabel}
        </span>
      </div>

      <p className={`text-sm text-gray-600 leading-relaxed ${expanded ? "" : "line-clamp-3"}`}>
        {idea.description}
      </p>

      {idea.description.length > 150 && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-xs text-indigo-500 hover:text-indigo-700 self-start -mt-1"
        >
          {expanded ? "Ver menos" : "Ver mais"}
        </button>
      )}

      {duplicates.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
          <span className="font-semibold">⚠️ Ideia similar já existe:</span>
          <ul className="mt-1 space-y-0.5">
            {duplicates.map((d) => (
              <li key={d.id} className="truncate">• {d.title}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
        {/* Tipo — clicável */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setTypeMenuOpen((o) => !o)}
            disabled={savingType}
            title="Clique para mudar o tipo"
            className={`text-xs px-2 py-0.5 rounded-full border font-medium transition-all ${typeColor} ${
              savingType ? "opacity-50 cursor-wait" : "hover:opacity-80 cursor-pointer"
            }`}
          >
            {savingType ? "⏳" : typeIcon} {currentTypeLabel} ✎
          </button>

          {typeMenuOpen && (
            <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-20 min-w-[160px]">
              {(Object.entries(TYPE_LABELS) as [IdeaType, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => handleTypeChange(key)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-gray-50 transition-colors ${
                    key === currentType ? "font-semibold bg-gray-50" : ""
                  }`}
                >
                  <span>{TYPE_ICONS[key]}</span>
                  <span>{label}</span>
                  {key === currentType && <span className="ml-auto text-indigo-500">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{idea.author}</span>
          <span className="text-xs text-gray-300">·</span>
          <span className="text-xs text-gray-400">{date}</span>
          <button
            onClick={handleVote}
            disabled={voted}
            className={`flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-lg transition-all ${
              voted
                ? "bg-indigo-50 text-indigo-400 cursor-default"
                : "bg-gray-50 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
            }`}
          >
            <span>▲</span>
            <span>{votes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
