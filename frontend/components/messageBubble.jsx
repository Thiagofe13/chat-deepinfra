// frontend/components/MessageBubble.jsx
export default function MessageBubble({ role, text }) {
  const isUser = role === "user";
  const containerStyle = {
    display: "flex",
    justifyContent: isUser ? "flex-end" : "flex-start",
    marginBottom: 10
  };
  const bubbleStyle = {
    maxWidth: "72%",
    padding: "12px 16px",
    borderRadius: 14,
    lineHeight: 1.5,
    fontSize: 15,
    boxShadow: "0 4px 10px rgba(16,24,40,0.04)"
  };
  const userStyle = { ...bubbleStyle, background: "#007aff", color: "#fff", borderBottomRightRadius: 4 };
  const botStyle = { ...bubbleStyle, background: "#fff", color: "#111", border: "1px solid #eee", borderBottomLeftRadius: 4 };

  return (
    <div style={containerStyle}>
      <div style={isUser ? userStyle : botStyle}>
        {text}
      </div>
    </div>
  );
}
