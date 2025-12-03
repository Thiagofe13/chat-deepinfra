"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const CLASS_COLORS = { F: "assistant-F", T: "assistant-T", C: "assistant-C", X: "assistant-X" };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);

  function fastClassify(message) {
    const s = message.toLowerCase();
    if (/^[!@#$%^&*]|[*]{3,}|hack|crack|ilegal|sem censura|proibido/i.test(s)) return "X";
    if (/tutorial|código|script|deploy|erro|config|arquitetura|finetune|qlora|benchmark/i.test(s)) return "T";
    if (/crie|invente|poema|história|roteiro|música|imagine|fanfic/i.test(s)) return "C";
    return "F";
  }

  async function sendMessage() {
    if (!input.trim()) return;
    
    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    const previous = [...messages, userMsg];
    
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content, history: previous })
      });

      // --- CORREÇÃO AQUI: TRATAMENTO DE ERRO ---
      if (!res.ok) {
        // Se o servidor devolveu erro (400, 401, 500), lemos o JSON de erro
        const errorData = await res.json();
        const errorMessage = errorData.error || `Erro desconhecido (${res.status})`;
        
        // Adiciona mensagem de erro visual para você ler
        setMessages(prev => [...prev, { 
            role: "assistant", 
            content: `🚨 **ERRO DO SISTEMA:** ${errorMessage}`, 
            cls: "X" 
        }]);
        setLoading(false);
        return;
      }
      // ----------------------------------------

      if (!res.body) { setLoading(false); return; }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      const cls = fastClassify(userMsg.content);
      
      let assistantMsg = { role: "assistant", content: "", cls };
      setMessages(prev => [...prev, assistantMsg]);
      
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Digitação ultra-rápida
        while (buffer.length > 0) {
          const chunkSize = Math.min(3, buffer.length);
          const chunk = buffer.slice(0, chunkSize);
          buffer = buffer.slice(chunkSize);

          assistantMsg.content += chunk;

          setMessages(prev => [
            ...prev.slice(0, -1),
            { ...assistantMsg }
          ]);

          if (containerRef.current) {
            containerRef.current.scrollTo({
              top: containerRef.current.scrollHeight,
              behavior: "smooth"
            });
          }

          await new Promise(r => setTimeout(r, 10));
        }
      }

    } catch (error) {
      console.error("Erro no frontend:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: `🚨 **ERRO DE CONEXÃO:** ${error.message}`, 
        cls: "X" 
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4 bg-gray-50">
      <div ref={containerRef} className="chat-container bg-white border border-gray-300 rounded-lg overflow-y-auto flex-1 p-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message mb-4 p-3 rounded-lg ${
              msg.role === "user"
                ? "bg-blue-100 self-end ml-10" // Estilo usuário
                : "bg-gray-100 mr-10"          // Estilo IA
            } ${msg.content.includes("ERRO") ? "border-2 border-red-500 bg-red-50" : ""}`}
          >
            {msg.role === "assistant" ? (
              <ReactMarkdown
                children={msg.content + (loading && i === messages.length - 1 ? " ▍" : "")}
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ node, ...props }) => (
                    <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline" />
                  ),
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter style={materialDark} language={match[1]} PreTag="div" {...props}>
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-gray-300 px-1 rounded" {...props}>{children}</code>
                    );
                  },
                  blockquote({ node, ...props }) {
                    return <blockquote className="border-l-4 border-gray-400 pl-4 italic text-gray-700 my-2" {...props} />;
                  },
                  table({ node, ...props }) { return <table className="table-auto border-collapse border border-gray-400 my-2" {...props} />; },
                  th({ node, ...props }) { return <th className="border border-gray-400 px-2 py-1 bg-gray-200" {...props} />; },
                  td({ node, ...props }) { return <td className="border border-gray-400 px-2 py-1" {...props} />; }
                }}
              />
            ) : (
              <p className="whitespace-pre-wrap">{msg.content}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 flex space-x-2">
        <input
          className="flex-1 p-3 border border-gray-300 rounded-lg text-black"
          placeholder="Digite sua mensagem..."
          value={input}
          disabled={loading}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
        />
        <button
          className="px-4 py-3 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 font-bold"
          disabled={loading}
          onClick={sendMessage}
        >
          {loading ? "..." : "Enviar"}
        </button>
      </div>
    </div>
  );
}
```

### O que fazer agora:

1.  **Copie e cole** esse código no seu `frontend/app/page.js`.
2.  Rode os comandos mágicos no terminal:
    ```cmd
    git add .
    git commit -m "Fix frontend undefined error"
    git push