export default function MessageBubble({ text, role }) {
  const styles = {
    user: { backgroundColor: "#0070f3", color: "#fff", alignSelf: "flex-end", padding: "10px 15px", borderRadius: "12px", maxWidth: "70%", marginBottom: "5px" },
    bot: { backgroundColor: "#e0e0e0", color: "#000", alignSelf: "flex-start", padding: "10px 15px", borderRadius: "12px", maxWidth: "70%", marginBottom: "5px" },
  };
  return <div style={role === "user" ? styles.user : styles.bot}>{text}</div>;
}
