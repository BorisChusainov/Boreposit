# LLM Utility Portal

Eine Single Page Application (SPA) für einen OpenAI-kompatiblen LLM-Endpunkt. Sie unterstützt:

- Übersetzungstool
- Rechtschreib- und Grammatikprüfung
- Code-Kommentierung

## Installation

1. Öffne ein Terminal im Projektverzeichnis.
2. Installiere die Abhängigkeiten:

```bash
npm install
```

3. Starte das Frontend:

```bash
npm run dev
```

## Konfiguration

Standardmäßig nutzt die App direkt Google Gemini 3.5 Flash:

- `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`
- Modell: `gemini-3.5-flash`
- `max_tokens`: `32768`
- API-Key über `VITE_API_KEY`

Falls du andere Werte verwenden möchtest, erstelle eine `.env.local` im Projektordner mit:

```env
VITE_API_URL=https://generativelanguage.googleapis.com/v1beta/openai/chat/completions
VITE_MODEL=gemini-3.5-flash
VITE_API_KEY=DEIN_GEMINI_API_KEY_HIER
VITE_MAX_OUTPUT_TOKENS=32768
```

## Funktionsweise

Die App sendet für jeden Task eine einzelne Anfrage an den LLM-Endpunkt. Dabei wird ein passender System-Prompt zusammen mit der Nutzereingabe übertragen.

- `system`: steuert das Verhalten (Übersetzen, Korrigieren, Kommentieren)
- `user`: enthält den gesamten zu verarbeitenden Text oder Code

Das ist ein Single-Shot-Ansatz mit einem einzigen Chat-Request pro Aufgabe.
