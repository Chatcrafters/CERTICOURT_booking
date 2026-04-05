# CERTICOURT — Quick Setup

## 1. In diesen Ordner wechseln
```bash
cd certicourt-app
```

## 2. Dependencies installieren
```bash
npm install
```

## 3. Supabase Schema einrichten
- Supabase Dashboard → SQL Editor
- certicourt_schema.sql ausführen
- certicourt_seed.sql ausführen

## 4. App starten
```bash
npm run dev
```
→ http://localhost:3000

## 5. Auf Vercel deployen
```bash
npx vercel
```
Oder: github.com → Vercel Dashboard → "Import Repository"

## Umgebungsvariablen für Vercel
```
NEXT_PUBLIC_SUPABASE_URL=https://tclujxducbodiwupenvq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```
