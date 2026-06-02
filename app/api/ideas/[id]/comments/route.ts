import { NextRequest } from "next/server";
import { getPrisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prisma = await getPrisma();
  const comments = await prisma.comment.findMany({
    where: { ideaId: id },
    orderBy: { createdAt: "asc" },
  });
  return Response.json(comments);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { text, author } = await request.json();
  if (!text?.trim()) return Response.json({ error: "Comentário vazio." }, { status: 400 });
  const prisma = await getPrisma();
  const comment = await prisma.comment.create({
    data: { ideaId: id, text: text.trim(), author: author?.trim() || "Anônimo" },
  });
  return Response.json(comment, { status: 201 });
}
