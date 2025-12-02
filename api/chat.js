export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    try {
        const { message, history } = req.body;
        const apiKey = process.env.DEEPINFRA_API_KEY;
        if (!apiKey) return res.status(500).json({ error: 'Chave API não configurada.' });

        const response = await fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "mistralai/Mistral-7B-Instruct-v0.2",
                messages: [
                    { role: "system", content: "Você é uma assistente virtual séria, profissional e clara. Use emojis de forma natural 😄✨" },
                    ...(history || []),
                    { role: "user", content: message }
                ],
                max_tokens: 400,
                temperature: 0.85
            })
        });

        const data = await response.json();
        if (data.error) return res.status(500).json({ error: data.error.message });
        return res.status(200).json({ text: data.choices[0].message.content });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
