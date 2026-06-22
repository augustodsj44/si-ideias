import { NextRequest } from "next/server";
import { getPrisma } from "@/lib/db";
import { TYPE_LABELS, STATUS_LABELS, type IdeaType } from "@/lib/types";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prisma = await getPrisma();
  await prisma.idea.delete({ where: { id } });
  return new Response(null, { status: 204 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { type, status, title, description } = body;

  const data: {
    type?: string;
    typeLabel?: string;
    status?: string;
    title?: string;
    description?: string;
  } = {};

  if (type !== undefined) {
    if (!(type in TYPE_LABELS)) {
      return Response.json({ error: "Tipo inválido." }, { status: 400 });
    }
    data.type = type;
    data.typeLabel = TYPE_LABELS[type as IdeaType];
  }

  if (status !== undefined) {
    if (!(status in STATUS_LABELS)) {
      return Response.json({ error: "Status inválido." }, { status: 400 });
    }
    data.status = status;
  }

  if (title !== undefined) {
    if (!title?.trim()) {
      return Response.json({ error: "Título vazio." }, { status: 400 });
    }
    data.title = title.trim();
  }

  if (description !== undefined) {
    if (!description?.trim()) {
      return Response.json({ error: "Descrição vazia." }, { status: 400 });
    }
    data.description = description.trim();
  }

  if (Object.keys(data).length === 0) {
    return Response.json({ error: "Nada para atualizar." }, { status: 400 });
  }

  const prisma = await getPrisma();
  const idea = await prisma.idea.update({ where: { id }, data });

  return Response.json(idea);
}
