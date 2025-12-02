// frontend/components/ChatWindow.jsx
import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({ conversation, appendToConversation, updateConversationMessages }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  function scrollToBottom() {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }

  async function send() {
    if (!input.trim()) return;
    if (!conversation) return alert("Crie ou selecione uma conversa antes.");
    const text = input.trim();
    appendToConversation(conversation.id, { role: "user", text });
    setInput("");
    setLoading(true);

    // prepare history for API: map to {role, content}
    const historyForApi = (conversation.messages || []).map(m => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.text
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: historyForApi })
      });
      const data = await res.json();
      if (data.error) {
        appendToConversation(conversation.id, { role: "bot", text: "Erro: " + (data.error || "sem detalhe") });
      } else {
        // briefly show info about model
        appendToConversation(conversation.id, { role: "bot", text: `Respondendo com: ${data.model}` });
        await typeWriter(conversation.id, data.text || data.response || "");
      }
    } catch (err) {
      appendToConversation(conversation.id, { role: "bot", text: "Erro de conexão." });
      console.error(err);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  async function typeWriter(convId, text) {
    // create empty bot bubble
    appendToConversation(convId, { role: "bot", text: "" });
    for (let i = 0; i < text.length; i++) {
      updateConversationMessages(convId, (msgs) => {
        const copy = [...msgs];
        const lastIndex = copy.length - 1;
        copy[lastIndex] = { ...copy[lastIndex], text: (copy[lastIndex].text || "") + text[i] };
        return copy;
      });
      if (i % 3 === 0) await sleep(18); // adjust speed here
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  if (!conversation) {
    return <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}>Selecione ou crie uma conversa</div>;
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ borderBottom: "1px solid #eee", padding: 12, background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 700 }}>{conversation.name}</div>
        <div style={{ fontSize: 13, color: "#666" }}>{conversation.messages.length} mensagens</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 20, background: "#f7f8fa" }}>
        {conversation.messages.map((m, i) => (
          <MessageBubble key={i} role={m.role === "user" ? "user" : "bot"} text={m.text} />
        ))}
        <div ref={chatEndRef}></div>
      </div>

      <div style={{ padding: 12, display: "flex", gap: 8, borderTop: "1px solid #eee", background: "#fff" }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={2}
          placeholder="Digite sua mensagem..."
          style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #ddd", resize: "none" }}
        />
        <button onClick={send} disabled={loading} style={{ padding: "10px 16px", borderRadius: 10, background: "#007aff", color: "#fff", border: "none", cursor: "pointer" }}>
          {loading ? "..." : "Enviar"}
        </button>
      </div>
    </div>
  );
}
