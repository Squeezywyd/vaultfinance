# Vault — Personal Finance PWA

A mobile-first budgeting app installable on iPhone home screen, with AI-powered spending insights via Gemini.

## Setup

```bash
npm install
cp .env.example .env.local
# Add your Gemini API key to .env.local
npm run dev
```

Get a free Gemini API key at [Google AI Studio](https://aistudio.google.com/app/apikey).

## Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Then in the Vercel dashboard → **Project Settings → Environment Variables**, add:
```
GEMINI_API_KEY = your_actual_key_here
```

## Add to iPhone Home Screen

1. Open the app URL in **Safari** on your iPhone
2. Tap the **Share** button (square with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **Add** — the app icon appears on your home screen

## Features

- **Dashboard** — Monthly balance, income/expense stats, spending charts
- **Transactions** — Add, search, filter, and delete transactions
- **Budget** — Set monthly limits per category with visual progress bars
- **Goals** — Savings goals with progress rings and fund tracking
- **Insights** — AI-powered spending analysis via Gemini (requires API key)

## Tech Stack

- React 18 + Vite + React Router v6
- Tailwind CSS + Recharts
- vite-plugin-pwa (service worker, offline support)
- Vercel serverless function as Gemini API proxy
- localStorage for data persistence (no database needed)
