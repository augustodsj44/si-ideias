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
