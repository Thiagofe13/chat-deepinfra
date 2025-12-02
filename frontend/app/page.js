// frontend/app/page.js
"use client";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

export default function Page() {
  const [conversations, setConversations] = useState([]);
  const [currentId, setCurrentId] = useState(null);

  const createConversation = (name) => {
    const id = Date.now();
    const newConv = { id, name, messages: [] };
    setConversations(prev => [newConv, ...prev]);
    setCurrentId(id);
  };

  const selectConversation = (id) => setCurrentId(id);

  const appendToConversation = (convId, message) => {
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, messages: [...c.messages, message] } : c));
  };

  const updateConversationMessages = (convId, updater) => {
    setConversations(prev => prev.map(c => {
      if (c.id !== convId) return c;
      const newMessages = updater([...c.messages]);
      return { ...c, messages: newMessages };
    }));
  };

  const currentConv = conversations.find(c => c.id === currentId) ?? null;

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f3f4f6" }}>
      <Sidebar
        conversations={conversations}
        createConversation={createConversation}
        selectConversation={selectConversation}
        currentId={currentId}
      />
      <ChatWindow
        conversation={currentConv}
        appendToConversation={appendToConversation}
        updateConversationMessages={updateConversationMessages}
      />
    </div>
  );
}
