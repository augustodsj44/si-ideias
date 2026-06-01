"use client";

import { useEffect, useRef, useState } from "react";

interface Member { id: string; name: string; }

const COLORS = [
  "#6366f1","#ec4899","#f59e0b","#10b981",
  "#3b82f6","#ef4444","#8b5cf6","#14b8a6",
  "#f97316","#06b6d4","#84cc16","#e11d48",
];

export default function Roulette() {
  const [members, setMembers] = useState<Member[]>([]);
  const [newName, setNewName] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Member | null>(null);
  const [rotation, setRotation] = useState(0);
  const [showWinner, setShowWinner] = useState(false);
  const rotationRef = useRef(0);

  useEffect(() => { loadMembers(); }, []);

  async function loadMembers() {
    const res = await fetch("/api/team");
    setMembers(await res.json());
  }

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    setNewName("");
    loadMembers();
  }

  async function removeMember(id: string) {
    await fetch(`/api/team/${id}`, { method: "DELETE" });
    setMembers((m) => m.filter((x) => x.id !== id));
  }

  function spin() {
    if (spinning || members.length < 2) return;
    setWinner(null);
    setShowWinner(false);
    setSpinning(true);

    const segAngle = 360 / members.length;
    // Garante pelo menos 8 voltas + parada em segmento aleatório
    const winnerIdx = Math.floor(Math.random() * members.length);
    const extraSpins = (8 + Math.floor(Math.random() * 5)) * 360;
    // A agulha fica no topo (0°). Precisamos que o centro do segmento vencedor fique em 0°.
    const targetAngle = 360 - (winnerIdx * segAngle + segAngle / 2);
    const newRotation = rotationRef.current + extraSpins + targetAngle - (rotationRef.current % 360);

    rotationRef.current = newRotation;
    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      setWinner(members[winnerIdx]);
      setShowWinner(true);
    }, 5000);
  }

  // Gera o conic-gradient da roleta
  function buildGradient() {
    if (members.length === 0) return "conic-gradient(#6366f1 0deg 360deg)";
    const seg = 360 / members.length;
    const parts = members.map((m, i) => {
      const color = COLORS[i % COLORS.length];
      const start = i * seg;
      const end = (i + 1) * seg;
      return `${color} ${start}deg ${end}deg`;
    });
    return `conic-gradient(${parts.join(", ")})`;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-10 items-start">

      {/* Roda */}
      <div className="flex flex-col items-center gap-6 flex-1">
        <div className="relative">
          {/* Agulha */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 text-2xl drop-shadow-md">
            ▼
          </div>

          {/* Roda */}
          <div
            className="rounded-full shadow-2xl border-4 border-white dark:border-slate-700"
            style={{
              width: 300,
              height: 300,
              background: members.length > 0 ? buildGradient() : "#e2e8f0",
              transform: `rotate(${rotation}deg)`,
              transition: spinning
                ? "transform 5s cubic-bezier(0.17, 0.67, 0.08, 0.99)"
                : "none",
            }}
          >
            {/* Labels dentro dos segmentos */}
            {members.map((m, i) => {
              const seg = 360 / members.length;
              const angle = i * seg + seg / 2;
              const rad = ((angle - 90) * Math.PI) / 180;
              const r = 105;
              const x = 150 + r * Math.cos(rad);
              const y = 150 + r * Math.sin(rad);
              return (
                <div
                  key={m.id}
                  className="absolute text-white font-semibold text-xs pointer-events-none select-none drop-shadow"
                  style={{
                    left: x,
                    top: y,
                    transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                    maxWidth: 72,
                    textAlign: "center",
                    lineHeight: 1.2,
                  }}
                >
                  {m.name}
                </div>
              );
            })}
          </div>

          {/* Centro */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-full border-4 border-gray-200 dark:border-slate-600 shadow-lg z-10" />
        </div>

        <button
          onClick={spin}
          disabled={spinning || members.length < 2}
          className="px-10 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold text-lg rounded-2xl transition-all shadow-lg active:scale-95"
        >
          {spinning ? "Girando..." : "🎲 Girar!"}
        </button>

        {members.length < 2 && (
          <p className="text-sm text-gray-400 dark:text-slate-500">
            Adicione pelo menos 2 pessoas para girar.
          </p>
        )}

        {/* Winner overlay */}
        {showWinner && winner && (
          <div className="text-center animate-bounce">
            <div className="text-5xl mb-2">🎉</div>
            <p className="text-gray-500 dark:text-slate-400 text-sm mb-1">Próximo a apresentar:</p>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {winner.name}
            </p>
          </div>
        )}
      </div>

      {/* Painel de membros */}
      <div className="w-full lg:w-72 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">Time</h2>

        <form onSubmit={addMember} className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome da pessoa..."
            className="flex-1 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
          >
            +
          </button>
        </form>

        <ul className="space-y-2">
          {members.map((m, i) => (
            <li
              key={m.id}
              className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl px-3 py-2"
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="flex-1 text-sm text-gray-800 dark:text-slate-200 truncate">{m.name}</span>
              <button
                onClick={() => removeMember(m.id)}
                className="text-gray-300 dark:text-slate-600 hover:text-red-400 transition-colors text-sm"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        {members.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-4">
            Nenhum membro ainda.
          </p>
        )}
      </div>
    </div>
  );
}
