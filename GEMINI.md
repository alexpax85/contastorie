# GEMINI.md - Il Magico Creatore di Fiabe

## 📖 Panoramica del Progetto
Webapp per la generazione di fiabe personalizzate per bambini (5-7 anni). Utilizza l'AI di Gemini per testi e illustrazioni magiche.

## 🎯 Stato Attuale (Giugno 2026)
- **Generazione Storie**: Funzionante con `gemini-2.5-flash`.
- **Generazione Illustrazioni**: Funzionante con `gemini-2.5-flash` + `responseModalities: ["IMAGE", "TEXT"]`.
- **Audio (TTS)**: Rimosso dall'interfaccia (API non inclusa nel tier gratuito).

## ⚙️ Configurazione API (v1beta)

- **Storia & Prompt immagine**: `gemini-2.5-flash` via `generateContent`
- **Illustrazioni**: stesso modello `gemini-2.5-flash` con `generationConfig.responseModalities: ["IMAGE", "TEXT"]`
    - *Nota*: `gemini-2.5-flash-image` deprecato. L'output immagine si ottiene ora tramite `responseModalities` sul modello base.

## 📱 Struttura
- **Backend**: Vercel Functions (`api/generate-story.js`, `api/generate-image.js`).
- **Frontend**: Vanilla JS (`js/app.js`), CSS pastello, Three.js per lo sfondo.

---
**Ultimo aggiornamento**: 25 Giugno 2026
**Versione**: 1.4 (Fix generazione immagini - responseModalities)
