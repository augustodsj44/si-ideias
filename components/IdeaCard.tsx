"use client";

import { useEffect, useRef, useState } from "react";
import { TYPE_COLORS, TYPE_ICONS, TYPE_LABELS, type IdeaType } from "@/lib/types";

interface Idea {
  id: string; title: string; description: string; type: string;
  typeLabel: string; status: string; author: string; votes: number;
  duplicateIds: string; createdAt: string;
}
interface Comment { id: string; author: string; text: string; createdAt: string; }

const STATUS_STYLES: Record<string, string> = {
  aberta: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  em_analise: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  aprovada: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  concluida: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  rejeitada: "bg-red-100 text-red-500 dark:bg-red-900/40 dark:text-red-400",
};
const STATUS_LABELS: Record<string, string> = {
  aberta: "Aberta", em_analise: "Em análise", aprovada: "Aprovada",
  concluida: "Concluída", rejeitada: "Rejeitada",
};

export default function IdeaCard({ idea, allIdeas, onVote, onDelete }: {
  idea: Idea; allIdeas: Idea[]; onVote: (id: string) => void; onDelete: (id: string) => void;
}) {
  const [voted, setVoted] = useState(false);
  const [votes, setVotes] = useState(idea.votes);
  const [expanded, setExpanded] = useState(false);
  const [currentType, setCurrentType] = useState(idea.type);
  const [currentTypeLabel, setCurrentTypeLabel] = useState(idea.typeLabel);
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const [savingType, setSavingType] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // Comentários
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const duplicateIds: string[] = JSON.parse(idea.duplicateIds || "[]");
  const duplicates = allIdeas.filter((i) => duplicateIds.includes(i.id));
  const typeKey = currentType as IdeaType;
  const typeColor = TYPE_COLORS[typeKey] ?? TYPE_COLORS.outro;
  const typeIcon = TYPE_ICONS[typeKey] ?? "💡";
  const statusStyle = STATUS_STYLES[idea.status] ?? STATUS_STYLES.aberta;
  const statusLabel = STATUS_LABELS[idea.status] ?? idea.status;
  const date = new Date(idea.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setTypeMenuOpen(false);
    }
    if (typeMenuOpen) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [typeMenuOpen]);

  async function loadComments() {
    setLoadingComments(true);
    const res = await fetch(`/api/ideas/${idea.id}/comments`);
    setComments(await res.json());
    setLoadingComments(false);
  }

  function toggleComments() {
    if (!showComments && comments.length === 0) loadComments();
    setShowComments((s) => !s);
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setPostingComment(true);
    const res = await fetch(`/api/ideas/${idea.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: commentText, author: commentAuthor }),
    });
    if (res.ok) {
      const c = await res.json();
      setComments((prev) => [...prev, c]);
      setCommentText("");
    }
    setPostingComment(false);
  }

  async function deleteComment(commentId: string) {
    await fetch(`/api/ideas/${idea.id}/comments/${commentId}`, { method: "DELETE" });
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  async function handleVote() {
    if (voted) return;
    setVoted(true); setVotes((v) => v + 1);
    onVote(idea.id);
  }

  async function handleTypeChange(newType: IdeaType) {
    if (newType === currentType) { setTypeMenuOpen(false); return; }
    setSavingType(true); setTypeMenuOpen(false);
    try {
      const res = await fetch(`/api/ideas/${idea.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: newType }),
      });
      if (res.ok) { setCurrentType(newType); setCurrentTypeLabel(TYPE_LABELS[newType]); }
    } finally { setSavingType(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    try { await fetch(`/api/ideas/${idea.id}`, { method: "DELETE" }); onDelete(idea.id); }
    finally { setDeleting(false); setConfirmDelete(false); }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-base leading-snug flex-1">{idea.title}</h3>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle}`}>{statusLabel}</span>
            {confirmDelete ? (
              <div className="flex items-center gap-1">
                <button onClick={handleDelete} disabled={deleting} className="text-xs px-2 py-0.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-50">
                  {deleting ? "..." : "Confirmar"}
                </button>
                <button onClick={() => setConfirmDelete(false)} className="text-xs px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
                  Cancelar
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="text-gray-300 dark:text-slate-600 hover:text-red-400 transition-colors text-base p-0.5">🗑</button>
            )}
          </div>
        </div>

        {/* Descrição */}
        <p className={`text-sm text-gray-600 dark:text-slate-300 leading-relaxed ${expanded ? "" : "line-clamp-3"}`}>
          {idea.description}
        </p>
        {idea.description.length > 150 && (
          <button onClick={() => setExpanded((e) => !e)} className="text-xs text-indigo-500 hover:text-indigo-700 self-start -mt-1">
            {expanded ? "Ver menos" : "Ver mais"}
          </button>
        )}

        {/* Duplicata */}
        {duplicates.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-300">
            <span className="font-semibold">⚠️ Ideia similar já existe:</span>
            <ul className="mt-1">{duplicates.map((d) => <li key={d.id} className="truncate">• {d.title}</li>)}</ul>
          </div>
        )}

        {/* Footer: tipo + meta + votos */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50 dark:border-slate-700">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setTypeMenuOpen((o) => !o)} disabled={savingType}
              className={`text-xs px-2 py-0.5 rounded-full border font-medium transition-all ${typeColor} ${savingType ? "opacity-50 cursor-wait" : "hover:opacity-80 cursor-pointer"}`}
            >
              {savingType ? "⏳" : typeIcon} {currentTypeLabel} ✎
            </button>
            {typeMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden z-20 min-w-[160px]">
                {(Object.entries(TYPE_LABELS) as [IdeaType, string][]).map(([key, label]) => (
                  <button key={key} onClick={() => handleTypeChange(key)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 ${key === currentType ? "font-semibold bg-gray-50 dark:bg-slate-700" : ""}`}
                  >
                    <span>{TYPE_ICONS[key]}</span><span>{label}</span>
                    {key === currentType && <span className="ml-auto text-indigo-500">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 dark:text-slate-500">{idea.author}</span>
            <span className="text-xs text-gray-300 dark:text-slate-600">·</span>
            <span className="text-xs text-gray-400 dark:text-slate-500">{date}</span>
            <button onClick={handleVote} disabled={voted}
              className={`flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-lg transition-all ${voted ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-400 cursor-default" : "bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:text-indigo-600"}`}
            >▲ {votes}</button>
          </div>
        </div>
      </div>

      {/* Comentários */}
      <div className="border-t border-gray-50 dark:border-slate-700">
        <button onClick={toggleComments}
          className="w-full px-5 py-2.5 flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
        >
          <span>💬</span>
          <span>{showComments ? "Ocultar" : "Comentários"}</span>
          {comments.length > 0 && <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full font-medium">{comments.length}</span>}
          <span className="ml-auto">{showComments ? "▲" : "▼"}</span>
        </button>

        {showComments && (
          <div className="px-5 pb-4 space-y-3">
            {loadingComments ? (
              <p className="text-xs text-gray-400 dark:text-slate-500 text-center py-2">Carregando...</p>
            ) : comments.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-slate-500 text-center py-2">Nenhum comentário ainda.</p>
            ) : (
              <ul className="space-y-2">
                {comments.map((c) => (
                  <li key={c.id} className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3 text-sm group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-700 dark:text-slate-300 text-xs">{c.author}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 dark:text-slate-500 text-xs">
                          {new Date(c.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                        </span>
                        <button onClick={() => deleteComment(c.id)} className="text-gray-300 dark:text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-xs">✕</button>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-slate-300">{c.text}</p>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={submitComment} className="space-y-2 pt-1">
              <input
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                placeholder="Seu nome (opcional)"
                className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <div className="flex gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Escrever comentário..."
                  className="flex-1 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button type="submit" disabled={postingComment || !commentText.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
                >
                  {postingComment ? "..." : "Enviar"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
