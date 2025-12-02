import { useState } from "react";

export default function Sidebar({ conversations, createConversation, selectConversation }) {
  const [newName, setNewName] = useState("");

  const handleCreate = () => {
    if (newName.trim() === "") return;
    createConversation(newName.trim());
    setNewName("");
  };

  return (
    <div style={{ width: "250px", borderRight: "1px solid #ccc", backgroundColor: "#fff", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
        <input
          type="text"
          placeholder="Nome da conversa"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          style={{ width: "100%", padding: "5px" }}
        />
        <button onClick={handleCreate} style={{ marginTop: "5px", width: "100%", padding: "5px", cursor: "pointer" }}>
          Nova Conversa
        </button>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {conversations.map(conv => (
          <div
            key={conv.id}
            onClick={() => selectConversation(conv)}
            style={{ padding: "10px", borderBottom: "1px solid #eee", cursor: "pointer", backgroundColor: conv === conversations[0] ? "#f0f0f0" : "white" }}
          >
            {conv.name}
          </div>
        ))}
      </div>
    </div>
  );
}
