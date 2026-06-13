import { useMemo, useState } from 'react';

type TaskKey = 'translation' | 'grammar' | 'codeComment';

const API_URL =
  import.meta.env.VITE_API_URL ?? 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
const MODEL = import.meta.env.VITE_MODEL ?? 'gemini-3.5-flash';
const API_KEY = import.meta.env.VITE_API_KEY ?? '';
const MAX_OUTPUT_TOKENS = Number(import.meta.env.VITE_MAX_OUTPUT_TOKENS ?? '32768');

const taskOptions: { key: TaskKey; label: string; description: string }[] = [
  {
    key: 'translation',
    label: 'Übersetzung',
    description: 'Text zwischen Sprachen übersetzen und idiomatisch formulieren.',
  },
  {
    key: 'grammar',
    label: 'Rechtschreib- & Grammatikprüfung',
    description: 'Rechtschreibung, Grammatik und Stil eines deutschen Textes korrigieren.',
  },
  {
    key: 'codeComment',
    label: 'Code-Kommentierung',
    description: 'Automatische Generierung von Kommentaren für Programmcode (z. B. JSDoc).',
  },
];

const systemPrompts: Record<TaskKey, string> = {
  translation:
    'Du bist ein professioneller Übersetzer. Übersetze den folgenden Text in die angegebene Zielsprache und achte auf korrekte Terminologie, Stil und Lesbarkeit. Antworte nur mit der übersetzten Version ohne zusätzliche Erklärungen.',
  grammar:
    'Du bist ein deutscher Rechtschreib- und Grammatikprüfer. Korrigiere den folgenden Text und gib nur die korrigierte Version zurück. Behalte den ursprünglichen Stil bei.',
  codeComment:
    'Du bist ein Entwicklerassistent, der Quellcode analysiert und passende Kommentare erstellt. Generiere für den folgenden Programmcode sinnvolle JSDoc-ähnliche Kommentare sowie zusätzliche Inline-Erklärungen, ohne den Code zu verändern.',
};

function App() {
  const [task, setTask] = useState<TaskKey>('translation');
  const [inputText, setInputText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('Deutsch');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const promptPreview = useMemo(() => systemPrompts[task], [task]);

  const buildUserMessage = () => {
    if (task === 'translation') {
      return `Übersetze diesen Text in ${targetLanguage}:

${inputText}`;
    }

    if (task === 'grammar') {
      return `Korrigiere diesen Text:

${inputText}`;
    }

    return `Kommentiere diesen Code mit passenden JSDoc-ähnlichen Kommentaren und kurzen Erklärungen:

${inputText}`;
  };

  const handleSubmit = async () => {
    setError('');
    setOutput('');

    if (!inputText.trim()) {
      setError('Bitte zuerst einen Eingabetext oder Code einfügen.');
      return;
    }

    if (!API_KEY.trim()) {
      setError('Bitte VITE_API_KEY in einer .env.local-Datei setzen, damit Gemini-Anfragen gesendet werden können.');
      return;
    }

    setLoading(true);

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: MODEL,
          max_tokens: MAX_OUTPUT_TOKENS,
          messages: [
            { role: 'system', content: promptPreview },
            { role: 'user', content: buildUserMessage() },
          ],
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Fehler vom Server: ${response.status} ${body}`);
      }

      const data = await response.json();
      const message = data.choices?.[0]?.message?.content ?? data.choices?.[0]?.text;

      if (!message) {
        throw new Error('Unerwartete Antwortstruktur vom LLM-Endpunkt.');
      }

      setOutput(message.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Google Gemini OpenAI-kompatibler Frontend-Client</p>
          <h1>LLM Utility Portal</h1>
          <p>Einfacher SPA-Frontend-Client für Google Gemini 3.5 Flash mit drei Single-Shot-Anwendungsfällen.</p>
        </div>
      </header>

      <main className="panel">
        <section className="card task-picker">
          <h2>Anwendungsfälle</h2>
          <div className="task-grid">
            {taskOptions.map((option) => (
              <button
                key={option.key}
                className={task === option.key ? 'task-button active' : 'task-button'}
                onClick={() => setTask(option.key)}
                type="button"
              >
                <strong>{option.label}</strong>
                <span>{option.description}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="card form-card">
          <div className="field-group">
            <label htmlFor="inputText">Eingabe</label>
            <textarea
              id="inputText"
              rows={10}
              value={inputText}
              onChange={(event) => setInputText(event.target.value)}
              placeholder={
                task === 'codeComment'
                  ? 'Füge hier deinen Programmcode ein...'
                  : 'Füge hier den zu bearbeitenden Text ein...'
              }
            />
          </div>

          {task === 'translation' && (
            <div className="field-group small">
              <label htmlFor="targetLanguage">Zielsprache</label>
              <input
                id="targetLanguage"
                value={targetLanguage}
                onChange={(event) => setTargetLanguage(event.target.value)}
              />
            </div>
          )}

          <div className="field-group">
            <label>System-Prompt</label>
            <div className="system-prompt">{promptPreview}</div>
          </div>

          <button className="submit-button" type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Sende Anfrage …' : 'Anfrage an LLM senden'}
          </button>

          {error && <div className="alert error">{error}</div>}
        </section>

        <section className="card output-card">
          <h2>Antwort</h2>
          <pre className="output-box">{output || 'Hier erscheint die Antwort des Modells.'}</pre>
        </section>
      </main>

      <footer className="footer-note">
        <p>
          Nutzt den Endpunkt <code>{API_URL}</code> und das Modell <code>{MODEL}</code>. Passe bei Bedarf die Variablen in einer <code>.env.local</code>-Datei an.
        </p>
        <p className="copyright">© Boris Chusainov 2026. Ideen mithilfe von KI-Tools umgesetzt.</p>
      </footer>
    </div>
  );
}

export default App;
