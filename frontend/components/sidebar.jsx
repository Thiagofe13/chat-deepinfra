"use client";

export default function Sidebar({ conversations, createConversation, selectConversation, currentId }) {
  return (
    <div className="w-64 bg-white border-r h-screen p-4 flex flex-col">
      <button
        onClick={createConversation}
        className="bg-blue-500 text-white py-2 rounded mb-4 w-full"
      >
        ➕ Nova Conversa
      </button>

      <div className="flex flex-col gap-2 overflow-y-auto">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => selectConversation(conv.id)}
            className={`p-2 text-left rounded ${
              conv.id === currentId ? "bg-blue-200" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            📌 {conv.name}
          </button>
        ))}
      </div>
    </div>
  );
}
