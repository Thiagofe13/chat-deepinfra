// layout.js - Layout global
import './globals.css'

export const metadata = {
  title: 'Chat IA',
  description: 'Chat com IA educada e amigável',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-900 text-gray-100">{children}</body>
    </html>
  )
}
