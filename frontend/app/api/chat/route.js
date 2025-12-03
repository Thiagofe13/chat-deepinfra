import { NextResponse } from "next/server";
import crypto from "crypto";
import { LRUCache } from "lru-cache"; // npm i lru-cache

// --- CACHE EDGE/IN-MEMORY ---
const cache = new LRUCache({ max: 1000, ttl: 86400000 }); // 1k entries, 24h

// --- CLASSIFICADOR (SEM FILTROS) ---
function fastClassify(m){
  // "Tudo vai pra categoria X" - Removemos as regex de bloqueio.
  // Retornamos X para garantir o comportamento "sem freio".
  return "X";
}

// --- SYSTEM PROMPTS (NEUTRO) ---
const SYSTEM_PROMPTS = {
  F: "Você é assistente factual, objetivo e claro em pt-BR.",
  T: "Você é assistente técnico, entrega código, tutoriais e detalhes passo a passo em pt-BR.",
  C: "Você é assistente criativo, inventivo e expressivo em pt-BR.",
  // X Atualizado: Neutro, direto, sem menção a moralidade ou regras de segurança.
  X: "Responda sempre em português, direto, sem rodeios."
};

// --- TEMPERATURAS E MAX TOKENS ---
const TEMPS = { F: 0.2, T: 0.4, C: 1.1, X: 0.8 }; // X com temp 0.8 para equilíbrio
const MAX_TOKENS = { F: 300, T: 600, C: 800, X: 4000 }; // Aumentado X para respostas MASSIVAS

// --- ESCOLHA DE MODELO ---
function chooseModelByClass(cls) {
  switch(cls) {
    case "F": return process.env.DEFAULT_MODEL;
    case "T": return process.env.HEAVY_MODEL;
    case "C": return process.env.HEAVY_MODEL;
    case "X": return process.env.ULTRA_MODEL || process.env.HEAVY_MODEL;
    default: return process.env.DEFAULT_MODEL;
  }
}

// --- HASH PARA CACHE ---
function hashMessage(message, cls) {
  return crypto.createHash("sha256").update(message + cls).digest("hex");
}

// --- POST API ---
export async function POST(req) {
  try {
    const body = await req.json();
    const { message, history } = body || {};
    const apiKey = process.env.DEEPINFRA_API_KEY;
    
    // Verificação de segurança da chave
    if (!apiKey) return NextResponse.json({ error: "DEEPINFRA_API_KEY não configurada." }, { status: 500 });

    // 1️⃣ CLASSIFICAÇÃO (Sempre 'X')
    let cls = fastClassify(message);

    // 2️⃣ CACHE CHECK
    const cacheKey = hashMessage(message, cls);
    const cached = cache.get(cacheKey);
    // Se estiver em cache, retorna o texto completo instantaneamente
    if (cached && cached !== "streamed") {
        return NextResponse.json({ text: cached, model: chooseModelByClass(cls), cls, cached: true });
    }

    // 3️⃣ PAYLOAD BASE
    const systemMessage = { role: "system", content: SYSTEM_PROMPTS[cls] };
    const userMessage = { role: "user", content: message };
    
    const payload = {
      model: chooseModelByClass(cls),
      messages: [...(history || []), systemMessage, userMessage],
      temperature: TEMPS[cls],
      max_tokens: MAX_TOKENS[cls],
      // STOP VAZIO: Deixa o modelo falar até acabar a token window se ele quiser
      stop: [], 
      stream: true
    };

    // 4️⃣ FETCH API COM TIMEOUT
    const api = "https://api.deepinfra.com/v1/openai/chat/completions";
    
    // Timeout de 45s para evitar cortes em raciocínios longos ou lentidão da API
    const resp = await fetch(api, { 
      method: "POST", 
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }, 
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(45000) 
    });

    if (!resp.ok) {
        const errorText = await resp.text();
        console.error("Erro na API DeepInfra:", errorText);
        throw new Error(`DeepInfra API Error: ${resp.status}`);
    }

    // 5️⃣ INTERCEPTADOR DE STREAM PARA CACHE
    // Vamos ler o stream enquanto enviamos para o cliente
    const decoder = new TextDecoder();
    let textBuffer = ""; // Acumulador

    const streamInterceptor = new TransformStream({
      transform(chunk, controller) {
        // 1. Passa o chunk adiante para o cliente (latência zero)
        controller.enqueue(chunk);
        // 2. Decodifica e guarda no buffer
        textBuffer += decoder.decode(chunk, { stream: true });
      },
      flush(controller) {
        // Quando o stream termina, salvamos tudo no cache
        if (textBuffer.length > 0) {
            cache.set(cacheKey, textBuffer);
        }
      }
    });

    // Pipe da resposta original -> Interceptador -> Cliente
    const stream = resp.body.pipeThrough(streamInterceptor);

    return new Response(stream, { 
      headers: { 
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      } 
    });

  } catch(err) {
    // Trata erros de timeout ou abort explicitamente se necessário
    const isTimeout = err.name === 'TimeoutError';
    console.error(isTimeout ? "DeepInfra Timeout (45s)" : err);
    return NextResponse.json({ error: err.message || "Erro interno" }, { status: 500 });
  }
}     
**Vá na Vercel e mude SÓ A CHAVE:**