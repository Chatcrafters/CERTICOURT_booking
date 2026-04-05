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
        <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
        <script dangerouslySetInnerHTML={{ __html: `
          window.OneSignalDeferred = window.OneSignalDeferred || [];
          OneSignalDeferred.push(async function(OneSignal) {
            await OneSignal.init({ appId: "435c277a-d4cc-489b-86a9-92c95c8e6353" });
          });
        ` }} />
      </head>
      <body className="bg-gray-50 font-sans antialiased">{children}</body>
    </html>
  )
}
