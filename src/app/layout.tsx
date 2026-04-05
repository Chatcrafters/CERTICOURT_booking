import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CERTICOURT — Pickleball Booking',
  description: 'Book certified pickleball courts worldwide',
  manifest: '/manifest.json',
  themeColor: '#1E54D0',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-gray-50 font-sans antialiased">{children}</body>
    </html>
  )
}
