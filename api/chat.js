// api/chat.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { message, history } = req.body;
    const apiKey = process.env.DEEPINFRA_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Chave API não configurada.' });
    }

    // 🚫 Prompt corrigido para IA séria
    const systemMessage = {
      role: "system",
      content: "Você é uma IA educada, séria e profissional. Não deve usar conteúdo sexual, provocativo ou romântico. Responda de forma neutra e informativa."
    };

    const response = await fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: [
          systemMessage,
          ...(history || []),
          { role: "user", content: message }
        ],
        max_tokens: 400,
        temperature: 0.7
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    return res.status(200).json({ text: data.choices[0].message.content });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
