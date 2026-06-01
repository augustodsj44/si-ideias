import { NextRequest } from "next/server";
import { getPrisma } from "@/lib/db";
import { classifyAndFindDuplicates } from "@/lib/ai";

export async function GET() {
  const prisma = await getPrisma();
  const ideas = await prisma.idea.findMany({
    orderBy: { createdAt: "desc" },
  });
  return Response.json(ideas);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, description, author } = body;

  if (!title?.trim() || !description?.trim()) {
    return Response.json({ error: "Título e descrição são obrigatórios." }, { status: 400 });
  }

  const prisma = await getPrisma();

  const existing = await prisma.idea.findMany({
    select: { id: true, title: true, description: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  let type = "outro";
  let typeLabel = "Outro";
  let duplicateIds: string[] = [];

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const result = await classifyAndFindDuplicates(title, description, existing);
      type = result.type;
      typeLabel = result.typeLabel;
      duplicateIds = result.duplicateIds;
    } catch {
      // fall through with defaults
    }
  }

  const idea = await prisma.idea.create({
    data: {
      title: title.trim(),
      description: description.trim(),
      author: author?.trim() || "Anônimo",
      type,
      typeLabel,
      duplicateIds: JSON.stringify(duplicateIds),
    },
  });

  return Response.json(idea, { status: 201 });
}
