import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Meu Assistente",
  description: "Chat estilo ChatGPT",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br" className={inter.variable}>
      <body className="font-inter bg-[#f5f5f5]">{children}</body>
    </html>
  );
}
