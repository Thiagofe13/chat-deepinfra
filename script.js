let conversations = [];
let currentHistory = [];

function addBubble(text, type) {
    const chat = document.getElementById('chat');
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.innerText = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

async function sendMessage() {
    const input = document.getElementById('input');
    const text = input.value.trim();
    if (!text) return;

    addBubble(text, 'user');
    currentHistory.push({ role: 'user', content: text });
    input.value = '';

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, history: currentHistory })
        });

        const data = await res.json();
        addBubble(data.text, 'bot');
        currentHistory.push({ role: 'assistant', content: data.text });
    } catch (err) {
        addBubble("Erro de conexão 😓", 'bot');
        console.error(err);
    }
}

function newConversation() {
    if (currentHistory.length) {
        conversations.push(currentHistory);
        updateHistoryList();
    }
    currentHistory = [];
    document.getElementById('chat').innerHTML = '<div class="message bot">Nova conversa iniciada 😄</div>';
}

function updateHistoryList() {
    const histDiv = document.getElementById('history');
    histDiv.innerHTML = '<h3>Conversas</h3>';
    conversations.forEach((conv, i) => {
        const btn = document.createElement('button');
        btn.innerText = `Conversa ${i+1}`;
        btn.onclick = () => loadConversation(i);
        histDiv.appendChild(btn);
    });
}

function loadConversation(index) {
    currentHistory = [...conversations[index]];
    const chatDiv = document.getElementById('chat');
    chatDiv.innerHTML = '';
    currentHistory.forEach(msg => addBubble(msg.content, msg.role === 'user' ? 'user' : 'bot'));
}

document.getElementById('input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
