import { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({ conversation, addMessage }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const scrollToBottom = () => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!input.trim() || !conversation) return;
    const userText = input.trim();
    addMessage(userText, "user");
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, history: conversation.messages })
      });
      const data = await res.json();
      if (data.error) {
        addMessage("Erro: " + data.error, "bot");
      } else {
        typeWriter(data.text);
      }
    } catch (err) {
      addMessage("Erro de conexão.", "bot");
    } finally {
      setLoading(false);
    }
  };

  const typeWriter = (text) => {
    let i = 0;
    const interval = setInterval(() => {
      if (i === 0) addMessage("", "bot"); // cria o balão
      if (i < text.length) {
        const messages = conversation.messages;
        messages[messages.length - 1].text += text[i];
        addMessage(messages[messages.length - 1].text, "bot");
        i++;
      } else {
        clearInterval(interval);
      }
    }, 20);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", backgroundColor: "#fefefe" }}>
        {conversation && conversation.messages.map((msg, idx) => (
          <MessageBubble key={idx} text={msg.text} role={msg.role} />
        ))}
        <div ref={chatEndRef}></div>
      </div>
      <div style={{ display: "flex", padding: "10px", borderTop: "1px solid #ccc", backgroundColor: "#fff" }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc", resize: "none" }}
          rows={2}
          placeholder="Digite sua mensagem..."
        />
        <button onClick={sendMessage} disabled={loading} style={{ marginLeft: "10px", padding: "10px 20px", cursor: "pointer" }}>
          {loading ? "..." : "Enviar"}
        </button>
      </div>
    </div>
  );
}
