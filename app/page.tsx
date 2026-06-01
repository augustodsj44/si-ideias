import { getPrisma } from "@/lib/db";
import IdeaGrid from "@/components/IdeaGrid";
import Roulette from "@/components/Roulette";

export const dynamic = "force-dynamic";

type Tab = "ideias" | "roleta";

interface Props {
  searchParams: Promise<{ tab?: string }>;
}

export default async function Home({ searchParams }: Props) {
  const { tab } = await searchParams;
  const activeTab: Tab = tab === "roleta" ? "roleta" : "ideias";

  const prisma = await getPrisma();
  const ideas = await prisma.idea.findMany({ orderBy: { createdAt: "desc" } });
  const totalVotes = ideas.reduce((sum: number, i) => sum + i.votes, 0);

  return (
    <div className="min-h-screen">
      <header className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">
              💡 Ideias para o SI
            </h1>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Sistema Interno · Sugestões de melhoria</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-slate-400">
            {activeTab === "ideias" && (
              <>
                <span>{ideas.length} ideia{ideas.length !== 1 ? "s" : ""}</span>
                <span className="text-gray-300 dark:text-slate-600">·</span>
                <span>{totalVotes} voto{totalVotes !== 1 ? "s" : ""}</span>
              </>
            )}
          </div>
        </div>

        {/* Abas */}
        <div className="max-w-6xl mx-auto px-6 flex gap-1">
          <a
            href="/?tab=ideias"
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "ideias"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
            }`}
          >
            💡 Ideias
          </a>
          <a
            href="/?tab=roleta"
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "roleta"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
            }`}
          >
            🎲 Roleta do Time
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto pb-24">
        {activeTab === "ideias" ? (
          <div className="px-6 py-8">
            <IdeaGrid
              initialIdeas={ideas.map((i) => ({
                ...i,
                createdAt: i.createdAt.toISOString(),
              }))}
            />
          </div>
        ) : (
          <Roulette />
        )}
      </main>
    </div>
  );
}
