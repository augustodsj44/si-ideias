import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { type IdeaType, TYPE_LABELS } from "./types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface ExistingIdea {
  id: string;
  title: string;
  description: string;
}

interface ClassifyResult {
  type: IdeaType;
  typeLabel: string;
  duplicateIds: string[];
}

export async function classifyAndFindDuplicates(
  title: string,
  description: string,
  existingIdeas: ExistingIdea[]
): Promise<ClassifyResult> {
  const existingList =
    existingIdeas.length > 0
      ? existingIdeas
          .map((i) => `ID: ${i.id}\nTítulo: ${i.title}\nDescrição: ${i.description}`)
          .join("\n---\n")
      : "Nenhuma ideia cadastrada ainda.";

  const prompt = `Você é um assistente que analisa ideias de melhoria para um sistema interno de software chamado "SI".

NOVA IDEIA:
Título: ${title}
Descrição: ${description}

IDEIAS JÁ CADASTRADAS:
${existingList}

Responda APENAS com um JSON válido no seguinte formato (sem markdown, sem explicação):
{
  "type": "<tipo>",
  "duplicateIds": ["<id1>", "<id2>"]
}

Regras:
- "type" deve ser um dos valores: visual_ui, nova_feature, processo, integracao, bug, outro
  - visual_ui: mudanças visuais, cores, layout, fontes, ícones, temas
  - nova_feature: novas funcionalidades, telas, módulos
  - processo: melhorias de fluxo, workflow, aprovações, notificações
  - integracao: integração com outros sistemas, APIs, importação/exportação
  - bug: algo que está quebrado ou funcionando errado
  - outro: qualquer coisa que não se encaixe acima

- "duplicateIds": lista de IDs de ideias já cadastradas que são semanticamente similares ou equivalentes à nova ideia (mesmo conceito, mesmo objetivo). Deixe vazio [] se não houver similares.`;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "{}";

    const result = JSON.parse(text.trim());
    const type = (result.type as IdeaType) in TYPE_LABELS ? (result.type as IdeaType) : "outro";

    return {
      type,
      typeLabel: TYPE_LABELS[type],
      duplicateIds: Array.isArray(result.duplicateIds) ? result.duplicateIds : [],
    };
  } catch {
    return { type: "outro", typeLabel: TYPE_LABELS.outro, duplicateIds: [] };
  }
}
