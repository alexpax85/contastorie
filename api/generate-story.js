// api/generate-story.js

export default async function handler(request, response) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return response.status(500).json({ error: 'La chiave API di Gemini non è stata configurata sul server.' });
    }

    if (request.method !== 'POST') {
        response.setHeader('Allow', 'POST');
        return response.status(405).end('Method Not Allowed');
    }

    try {
        const { characters, setting, moral } = request.body;

        if (!characters || !setting || !moral) {
            return response.status(400).json({ error: 'Dati mancanti per generare la storia.' });
        }

        const prompt = `
Crea una fiaba per bambini di 5-7 anni con le seguenti caratteristiche:

PERSONAGGI: ${characters.join(', ')}
AMBIENTAZIONE: ${setting}
MORALE: ${moral}

REQUISITI:
- Lunghezza: 400-800 parole (lettura 5-10 minuti)
- Linguaggio: Semplice, comprensibile per età 5-7 anni
- Tono: Positivo, rassicurante, magico
- Struttura: Inizio, sviluppo, climax, conclusione con insegnamento chiaro
- Stile: Narrativo, coinvolgente, con dialoghi semplici
- Vocabolario: Evocativo ma accessibile, che stimoli l'immaginazione
- NO contenuti spaventosi o inappropriati
- L'insegnamento deve emergere naturalmente dalla storia

FORMATO OUTPUT:
- Titolo accattivante in una riga separata.
- Storia divisa in paragrafi brevi.
- Finale che evidenzi chiaramente la morale.
`;

        const requestBody = JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 4096,
            },
            safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            ],
        });

        // Try primary model, fall back on 503/429 (free tier overload)
        const models = ['gemini-3.1-flash-lite', 'gemini-2.5-flash'];
        let lastError = null;

        for (const model of models) {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            console.log(`Trying model: ${model}`);

            const geminiResponse = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: requestBody,
            });

            if (geminiResponse.status === 503 || geminiResponse.status === 429) {
                const errorBody = await geminiResponse.json();
                console.warn(`Model ${model} returned ${geminiResponse.status}, trying next...`, errorBody);
                lastError = { status: geminiResponse.status, body: errorBody };
                continue;
            }

            if (!geminiResponse.ok) {
                const errorBody = await geminiResponse.json();
                console.error(`Errore dalla API di Gemini (${model}):`, errorBody);
                return response.status(geminiResponse.status).json({
                    error: errorBody?.error?.message || `Errore dall'API di Gemini: ${geminiResponse.statusText}`
                });
            }

            const data = await geminiResponse.json();

            if (data.candidates && data.candidates.length > 0) {
                const content = data.candidates[0].content.parts[0].text;
                const lines = content.split('\n');
                const title = lines[0];
                const storyText = lines.slice(1).join('\n').trim();
                return response.status(200).json({ title, storyText });
            }

            if (data.promptFeedback?.blockReason) {
                return response.status(400).json({
                    error: `Il contenuto è stato bloccato per motivi di sicurezza: ${data.promptFeedback.blockReason}`
                });
            }

            return response.status(500).json({ error: 'Nessuna storia generata. Riprova con parametri diversi.' });
        }

        // All models failed with 503/429
        return response.status(503).json({
            error: 'Il servizio è temporaneamente sovraccarico (piano gratuito). Riprova tra qualche minuto.'
        });

    } catch (error) {
        console.error('Errore nella funzione serverless:', error);
        return response.status(500).json({ error: 'Errore interno del server.' });
    }
}
