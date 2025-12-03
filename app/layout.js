// frontend/app/layout.js
import "./globals.css";

export const metadata = {
  title: "Chat IA - Seu Produto",
  description: "Chat IA com histórico, tipo ChatGPT, roteamento de modelos."
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" }}>
        {children}
      </body>
    </html>
  );
}
