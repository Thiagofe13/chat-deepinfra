let history = []; // Memória da conversa no navegador

async function sendMessage() {
    const input = document.getElementById('input');
    const chat = document.getElementById('chat');
    const btn = document.getElementById('send');
    const text = input.value.trim();

    if (!text) return;

    // 1. Mostra mensagem do usuário
    addBubble(text, 'user');
    input.value = '';
    btn.disabled = true;
    btn.innerText = '...';

    try {
        // 2. Envia para a API serverless da Vercel
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: text,
                history: history
            })
        });

        const data = await response.json();

        if (data.error) {
            addBubble("Erro: " + data.error, 'error');
        } else {
            addBubble(data.text, 'bot');

            // 3. Atualiza histórico
            history.push({ role: "user", content: text });
            history.push({ role: "assistant", content: data.text });
        }

    } catch (e) {
        console.error(e);
        addBubble("Erro de conexão com o servidor.", 'error');
    }

    btn.disabled = false;
    btn.innerText = 'ENVIAR';
    input.focus();
}

// Cria bolhas de chat
function addBubble(text, type) {
    const chat = document.getElementById('chat');
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.innerText = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

// Limpar chat
function resetChat() {
    history = [];
    document.getElementById('chat').innerHTML =
        '<div class="message bot">Memória apagada. Vamos começar de novo?</div>';
}

// Enviar com ENTER
document.getElementById('input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
