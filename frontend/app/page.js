"use client";

import { useState } from "react";
import MessageBubble from "@/components/MessageBubble";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Olá! Sou sua assistente. Pode falar o que quiser. O que manda? 😄✨" }
  ]);
  const [input, setInput] = useState("");

  async function sendMessage() {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);

    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages })
    });

    const data = await res.json();
    const text = data.choices[0].message.content;

    setMessages([...newMessages, { role: "assistant", content: text }]);
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Cabeçalho */}
      <header className="p-4 bg-white border-b font-semibold text-lg text-gray-800">
        Assistente AI ✨
      </header>

      {/* Chat content */}
      <main className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} />
        ))}
      </main>

      {/* Input */}
      <footer className="p-4 bg-white border-t">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Digite aqui..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-[15px]"
            style={{ letterSpacing: "0.2px" }}
          />
          <button
            onClick={sendMessage}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
          >
            Enviar
          </button>
        </div>
      </footer>
    </div>
  );
}
