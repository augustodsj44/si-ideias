"use client";

import { useEffect, useRef, useState } from "react";
import {
  TYPE_COLORS, TYPE_ICONS, TYPE_LABELS, type IdeaType,
  STATUS_STYLES, STATUS_ICONS, STATUS_LABELS, type IdeaStatus,
} from "@/lib/types";

interface Idea {
  id: string; title: string; description: string; type: string;
  typeLabel: string; status: string; author: string; votes: number;
  duplicateIds: string; createdAt: string;
}
interface Comment { id: string; author: string; text: string; createdAt: string; }

export default function IdeaCard({ idea, allIdeas, onVote, onDelete }: {
  idea: Idea; allIdeas: Idea[]; onVote: (id: string) => void; onDelete: (id: string) => void;
}) {
  const [voted, setVoted] = useState(false);
  const [votes, setVotes] = useState(idea.votes);
  const [expanded, setExpanded] = useState(false);
  // Edição de título/descrição
  const [currentTitle, setCurrentTitle] = useState(idea.title);
  const [currentDescription, setCurrentDescription] = useState(idea.description);
  const [editingIdea, setEditingIdea] = useState(false);
  const [editTitle, setEditTitle] = useState(idea.title);
  const [editDescription, setEditDescription] = useState(idea.description);
  const [savingEdit, setSavingEdit] = useState(false);
  // Edição de comentário
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [savingComment, setSavingComment] = useState(false);
  const [currentType, setCurrentType] = useState(idea.type);
  const [currentTypeLabel, setCurrentTypeLabel] = useState(idea.typeLabel);
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const [savingType, setSavingType] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(idea.status);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
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
  const statusMenuRef = useRef<HTMLDivElement>(null);

  const duplicateIds: string[] = JSON.parse(idea.duplicateIds || "[]");
  const duplicates = allIdeas.filter((i) => duplicateIds.includes(i.id));
  const typeKey = currentType as IdeaType;
  const typeColor = TYPE_COLORS[typeKey] ?? TYPE_COLORS.outro;
  const typeIcon = TYPE_ICONS[typeKey] ?? "💡";
  const statusKey = currentStatus as IdeaStatus;
  const statusStyle = STATUS_STYLES[statusKey] ?? STATUS_STYLES.aberta;
  const statusLabel = STATUS_LABELS[statusKey] ?? currentStatus;
  const statusIcon = STATUS_ICONS[statusKey] ?? "🟢";
  const date = new Date(idea.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

  // Sincroniza com novos dados vindos do servidor (polling / refresh)
  useEffect(() => { setCurrentType(idea.type); setCurrentTypeLabel(idea.typeLabel); }, [idea.type, idea.typeLabel]);
  useEffect(() => { setCurrentStatus(idea.status); }, [idea.status]);
  useEffect(() => { if (!editingIdea) { setCurrentTitle(idea.title); setCurrentDescription(idea.description); } }, [idea.title, idea.description, editingIdea]);
  useEffect(() => { if (!voted) setVotes(idea.votes); }, [idea.votes, voted]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setTypeMenuOpen(false);
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target as Node)) setStatusMenuOpen(false);
    }
    if (typeMenuOpen || statusMenuOpen) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [typeMenuOpen, statusMenuOpen]);

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

  async function handleStatusChange(newStatus: IdeaStatus) {
    if (newStatus === currentStatus) { setStatusMenuOpen(false); return; }
    setSavingStatus(true); setStatusMenuOpen(false);
    try {
      const res = await fetch(`/api/ideas/${idea.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) setCurrentStatus(newStatus);
    } finally { setSavingStatus(false); }
  }

  function startEditIdea() {
    setEditTitle(currentTitle);
    setEditDescription(currentDescription);
    setEditingIdea(true);
  }

  async function saveEditIdea(e: React.FormEvent) {
    e.preventDefault();
    if (!editTitle.trim() || !editDescription.trim()) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/ideas/${idea.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, description: editDescription }),
      });
      if (res.ok) {
        setCurrentTitle(editTitle.trim());
        setCurrentDescription(editDescription.trim());
        setEditingIdea(false);
      }
    } finally { setSavingEdit(false); }
  }

  function startEditComment(c: Comment) {
    setEditingCommentId(c.id);
    setEditCommentText(c.text);
  }

  async function saveEditComment(commentId: string) {
    if (!editCommentText.trim()) return;
    setSavingComment(true);
    try {
      const res = await fetch(`/api/ideas/${idea.id}/comments/${commentId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editCommentText }),
      });
      if (res.ok) {
        const updated = await res.json();
        setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
        setEditingCommentId(null);
      }
    } finally { setSavingComment(false); }
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
          {editingIdea ? (
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="flex-1 font-semibold text-gray-900 dark:text-slate-100 text-base leading-snug border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          ) : (
            <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-base leading-snug flex-1">{currentTitle}</h3>
          )}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => (editingIdea ? setEditingIdea(false) : startEditIdea())}
              className="text-gray-300 dark:text-slate-600 hover:text-indigo-400 transition-colors text-base p-0.5"
              title={editingIdea ? "Cancelar edição" : "Editar ideia"}
            >
              {editingIdea ? "✕" : "✎"}
            </button>
            <div className="relative" ref={statusMenuRef}>
              <button
                onClick={() => setStatusMenuOpen((o) => !o)} disabled={savingStatus}
                className={`text-xs px-2 py-0.5 rounded-full font-medium transition-all ${statusStyle} ${savingStatus ? "opacity-50 cursor-wait" : "hover:opacity-80 cursor-pointer"}`}
              >
                {savingStatus ? "⏳" : statusIcon} {statusLabel} ✎
              </button>
              {statusMenuOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden z-20 min-w-40">
                  {(Object.entries(STATUS_LABELS) as [IdeaStatus, string][]).map(([key, label]) => (
                    <button key={key} onClick={() => handleStatusChange(key)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 ${key === currentStatus ? "font-semibold bg-gray-50 dark:bg-slate-700" : ""}`}
                    >
                      <span>{STATUS_ICONS[key]}</span><span>{label}</span>
                      {key === currentStatus && <span className="ml-auto text-indigo-500">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
        {editingIdea ? (
          <form onSubmit={saveEditIdea} className="space-y-2">
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={4}
              className="w-full text-sm text-gray-600 dark:text-slate-300 leading-relaxed border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-y"
            />
            <div className="flex gap-2">
              <button type="submit" disabled={savingEdit || !editTitle.trim() || !editDescription.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors">
                {savingEdit ? "Salvando..." : "Salvar"}
              </button>
              <button type="button" onClick={() => setEditingIdea(false)}
                className="text-xs px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <>
            <p className={`text-sm text-gray-600 dark:text-slate-300 leading-relaxed ${expanded ? "" : "line-clamp-3"}`}>
              {currentDescription}
            </p>
            {currentDescription.length > 150 && (
              <button onClick={() => setExpanded((e) => !e)} className="text-xs text-indigo-500 hover:text-indigo-700 self-start -mt-1">
                {expanded ? "Ver menos" : "Ver mais"}
              </button>
            )}
          </>
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
                        {editingCommentId !== c.id && (
                          <button onClick={() => startEditComment(c)} className="text-gray-300 dark:text-slate-600 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all text-xs">✎</button>
                        )}
                        <button onClick={() => deleteComment(c.id)} className="text-gray-300 dark:text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-xs">✕</button>
                      </div>
                    </div>
                    {editingCommentId === c.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          rows={2}
                          className="w-full text-sm text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-y"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => saveEditComment(c.id)} disabled={savingComment || !editCommentText.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors">
                            {savingComment ? "..." : "Salvar"}
                          </button>
                          <button onClick={() => setEditingCommentId(null)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600 dark:text-slate-300">{c.text}</p>
                    )}
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
