import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const systemPrompt = {
      role: "system",
      content:
        "Você é uma IA educada, séria e profissional. Não responde com conteúdo sexual, romântico, provocativo ou inadequado. Mantenha sempre um tom neutro e respeitoso.",
    };

    const updatedMessages = [systemPrompt, ...messages];

    const response = await fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPINFRA_API_KEY}`,
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.1-70B-Instruct",
        messages: updatedMessages,
        stream: false,
      }),
    });

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || "Erro ao gerar resposta.";

    return NextResponse.json({ response: aiMessage });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
