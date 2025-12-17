// api/generate-story.js

// Questa è una funzione serverless Node.js
// Vercel/Netlify la eseguiranno in un ambiente sicuro sul server.

export default async function handler(request, response) {
    // 1. Leggi la chiave API segreta dalle variabili d'ambiente del server
    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

    if (!apiKey) {
        return response.status(500).json({ error: 'La chiave API di Gemini non è stata configurata sul server.' });
    }

    // Assicurati che la richiesta sia di tipo POST
    if (request.method !== 'POST') {
        response.setHeader('Allow', 'POST');
        return response.status(405).end('Method Not Allowed');
    }

    try {
        // 2. Prendi i dati inviati dal frontend
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

        // 3. Chiama l'API di Gemini dal server (in modo sicuro)
        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
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
            }),
        });

        if (!geminiResponse.ok) {
            const errorBody = await geminiResponse.json();
            console.error('Errore dalla API di Gemini:', errorBody);
            return response.status(geminiResponse.status).json({ error: `Errore dall'API di Gemini: ${geminiResponse.statusText}` });
        }

        const data = await geminiResponse.json();

        if (data.candidates && data.candidates.length > 0) {
            const content = data.candidates[0].content.parts[0].text;
            // Semplice parsing per separare titolo e testo
            const lines = content.split('\n');
            const title = lines[0];
            const storyText = lines.slice(1).join('\n').trim();
            
            // 4. Invia la storia generata al frontend
            return response.status(200).json({ title, storyText });
        } else {
             if (data.promptFeedback && data.promptFeedback.blockReason) {
                 const reason = data.promptFeedback.blockReason;
                 return response.status(400).json({ error: `Il contenuto è stato bloccato per motivi di sicurezza: ${reason}` });
            }
            return response.status(500).json({ error: 'Nessuna storia generata. Riprova con parametri diversi.' });
        }

    } catch (error) {
        console.error('Errore nella funzione serverless:', error);
        return response.status(500).json({ error: 'Errore interno del server.' });
    }
}
