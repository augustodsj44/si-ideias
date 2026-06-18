export type IdeaType =
  | "visual_ui"
  | "nova_feature"
  | "processo"
  | "integracao"
  | "bug"
  | "outro";

export const TYPE_LABELS: Record<IdeaType, string> = {
  visual_ui: "Visual / UI",
  nova_feature: "Nova Feature",
  processo: "Processo",
  integracao: "Integração",
  bug: "Bug Report",
  outro: "Outro",
};

export const TYPE_COLORS: Record<IdeaType, string> = {
  visual_ui: "bg-purple-100 text-purple-700 border-purple-200",
  nova_feature: "bg-blue-100 text-blue-700 border-blue-200",
  processo: "bg-orange-100 text-orange-700 border-orange-200",
  integracao: "bg-cyan-100 text-cyan-700 border-cyan-200",
  bug: "bg-red-100 text-red-700 border-red-200",
  outro: "bg-gray-100 text-gray-700 border-gray-200",
};

export const TYPE_ICONS: Record<IdeaType, string> = {
  visual_ui: "🎨",
  nova_feature: "✨",
  processo: "⚙️",
  integracao: "🔗",
  bug: "🐛",
  outro: "💡",
};

export type IdeaStatus =
  | "aberta"
  | "em_analise"
  | "em_andamento"
  | "concluida"
  | "cancelada";

export const STATUS_LABELS: Record<IdeaStatus, string> = {
  aberta: "Aberta",
  em_analise: "Em análise",
  em_andamento: "Em andamento",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

export const STATUS_STYLES: Record<IdeaStatus, string> = {
  aberta: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  em_analise: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  em_andamento: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  concluida: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  cancelada: "bg-red-100 text-red-500 dark:bg-red-900/40 dark:text-red-400",
};

export const STATUS_ICONS: Record<IdeaStatus, string> = {
  aberta: "🟢",
  em_analise: "🔍",
  em_andamento: "🚧",
  concluida: "✅",
  cancelada: "🚫",
};
