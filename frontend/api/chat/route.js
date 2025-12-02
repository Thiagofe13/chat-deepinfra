// frontend/api/chat/route.js
export async function POST(req) {
  const body = await req.json()
  const { message, history } = body

  const apiKey = process.env.DEEPINFRA_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Chave API não configurada.' }), { status: 500 })
  }

  try {
    const res = await fetch('https://api.deepinfra.com/v1/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        messages: [
          {
            role: 'system',
            content:
              'Você é uma IA educada, amigável e profissional. Responda com clareza, com emojis leves, mas nunca de forma sexual ou provocante.'
          },
          ...(history || []),
          { role: 'user', content: message },
        ],
        max_tokens: 400,
        temperature: 0.7,
      }),
    })

    const data = await res.json()
    if (data.error) return new Response(JSON.stringify({ error: data.error.message }), { status: 500 })

    return new Response(JSON.stringify({ text: data.choices[0].message.content }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
