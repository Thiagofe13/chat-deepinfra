import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

export default function Home() {
  const [conversations, setConversations] = useState([]);
  const [currentConv, setCurrentConv] = useState(null);

  const createConversation = (name) => {
    const newConv = { id: Date.now(), name, messages: [] };
    setConversations([newConv, ...conversations]);
    setCurrentConv(newConv);
  };

  const addMessage = (text, role) => {
    if (!currentConv) return;
    const updatedConv = {
      ...currentConv,
      messages: [...currentConv.messages, { text, role }]
    };
    setCurrentConv(updatedConv);
    setConversations(conversations.map(c => c.id === currentConv.id ? updatedConv : c));
  };

  const selectConversation = (conv) => setCurrentConv(conv);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar
        conversations={conversations}
        createConversation={createConversation}
        selectConversation={selectConversation}
      />
      <ChatWindow
        conversation={currentConv}
        addMessage={addMessage}
      />
    </div>
  );
}
