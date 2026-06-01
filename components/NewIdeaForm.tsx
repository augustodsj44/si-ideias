"use client";

import { useState } from "react";

interface Props {
  onCreated: () => void;
}

export default function NewIdeaForm({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, author }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao criar ideia.");
        return;
      }
      setTitle(""); setDescription(""); setAuthor("");
      setOpen(false);
      onCreated();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
      >
        + Nova Ideia
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-slate-700">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">Nova Ideia</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                  A IA vai classificar e detectar duplicatas automaticamente.
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 text-xl leading-none">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {[
                { label: "Título", value: title, set: setTitle, placeholder: "Ex: Mudar a cor do sistema para azul", required: true },
                { label: "Seu nome", value: author, set: setAuthor, placeholder: "Ex: João Silva", required: false, optional: true },
              ].map(({ label, value, set, placeholder, required, optional }) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    {label} {required ? <span className="text-red-500">*</span> : <span className="text-gray-400 dark:text-slate-500 font-normal">(opcional)</span>}
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    placeholder={placeholder}
                    required={required}
                    className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Descrição <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva a ideia com mais detalhes..."
                  rows={4}
                  required
                  className="w-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 px-4 py-2.5 rounded-xl">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 font-medium py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                  {loading ? (
                    <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Analisando com IA...</>
                  ) : "Enviar Ideia"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
