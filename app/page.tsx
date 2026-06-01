import { getPrisma } from "@/lib/db";
import IdeaGrid from "@/components/IdeaGrid";

export const dynamic = "force-dynamic";

export default async function Home() {
  const prisma = await getPrisma();
  const ideas = await prisma.idea.findMany({
    orderBy: { createdAt: "desc" },
  });

  const totalVotes = ideas.reduce((sum: number, i) => sum + i.votes, 0);

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              💡 Ideias para o SI
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Sistema Interno · Sugestões de melhoria</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{ideas.length} ideia{ideas.length !== 1 ? "s" : ""}</span>
            <span className="text-gray-300">·</span>
            <span>{totalVotes} voto{totalVotes !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 pb-24">
        <IdeaGrid initialIdeas={ideas.map((i: { id: string; title: string; description: string; type: string; typeLabel: string; status: string; author: string; votes: number; duplicateIds: string; createdAt: Date }) => ({ ...i, createdAt: i.createdAt.toISOString() }))} />
      </main>
    </div>
  );
}
