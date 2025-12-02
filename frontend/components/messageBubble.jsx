export default function MessageBubble({ role, content }) {
  const isUser = role === "user";

  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`
          max-w-[75%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed
          shadow-sm
          ${isUser
            ? "bg-[#0a7cff] text-white" 
            : "bg-white text-[#1a1a1a] border border-gray-200"
          }
        `}
        style={{ letterSpacing: "0.2px" }}
      >
        {content}
      </div>
    </div>
  );
}
