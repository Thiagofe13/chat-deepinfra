// frontend/app/api/chat/route.js
import { NextResponse } from "next/server";

/**
 * Roteador simples:
 * - DEFAULT_MODEL (economia) => ex: mistralai/Mistral-7B-Instruct-v0.2
 * - HEAVY_MODEL (melhor) => ex: meta-llama/Meta-Llama-3.1-13B-Instruct
 * - ULTRA_MODEL (opcional) => ex: meta-llama/Meta-Llama-3.1-70B-Instruct
 *
 * ENV na Vercel:
 * DEEPINFRA_API_KEY
 * DEFAULT_MODEL
 * HEAVY_MODEL
 * ULTRA_MODEL (opcional)
 */

const KEYWORDS_HEAVY = [
  "explicar", "detalhe", "tutorial", "como faço", "código", "script",
  "deploy", "configurar", "erro", "otimizar", "arquitetura", "treinar",
  "finetune", "qlora", "modelo", "benchmark", "analisar", "profundo"
];

function chooseModel(message, history) {
  if (!message) return process.env.DEFAULT_MODEL || "mistralai/Mistral-7B-Instruct-v0.2";
  const m = message.toLowerCase();

  // 1) very long input => use heavy
  if (m.length > 400) return process.env.HEAVY_MODEL || "meta-llama/Meta-Llama-3.1-13B-Instruct";

  // 2) keywords => heavy
  for (const kw of KEYWORDS_HEAVY) if (m.includes(kw)) return process.env.HEAVY_MODEL || "meta-llama/Meta-Llama-3.1-13B-Instruct";

  // 3) if history big => heavy
  const histLen = (history || []).reduce((s, it) => s + (it.content?.length || 0), 0);
  if (histLen > 2000) return process.env.HEAVY_MODEL || "meta-llama/Meta-Llama-3.1-13B-Instruct";

  // 4) fallback lightweight
  return process.env.DEFAULT_MODEL || "mistralai/Mistral-7B-Instruct-v0.2";
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { message, history } = body || {};

    const apiKey = process.env.DEEPINFRA_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "DEEPINFRA_API_KEY não configurada." }, { status: 500 });

    const model = chooseModel(message, history);
    const systemMessage = {
      role: "system",
      content: "Você é uma assistente virtual em Português (pt-BR), educada, objetiva e profissional. Use emojis de forma natural quando apropriado. Não gere conteúdo ilegal. Para perguntas técnicas, entregue passos claros e exemplos de código quando possível."
    };

    const payload = {
      model,
      messages: [
        systemMessage,
        ...(history || []),
        { role: "user", content: message }
      ],
      temperature: 0.8,
      max_tokens: 800,
      stream: false
    };

    const resp = await fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await resp.json();
    if (data.error) {
      console.error("DeepInfra error:", data);
      return NextResponse.json({ error: data.error?.message || "Erro na DeepInfra" }, { status: 500 });
    }

    const text = data.choices?.[0]?.message?.content ?? data.choices?.[0]?.text ?? "Sem resposta.";
    return NextResponse.json({ text, model });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Erro interno" }, { status: 500 });
  }
}
