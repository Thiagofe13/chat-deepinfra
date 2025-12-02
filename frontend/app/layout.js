export const metadata = {
  title: "Chat IA",
  description: "Chat IA com histórico e emojis",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif", backgroundColor: "#f5f5f5" }}>
        {children}
      </body>
    </html>
  );
}
