// api/generate-audio.js

export default async function handler(request, response) {
    const apiKey = process.env.GEMINI_API_KEY; // Usiamo la stessa chiave (assicurati che Cloud TTS API sia abilitata)
    const apiUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

    if (!apiKey) {
        return response.status(500).json({ error: 'Chiave API non configurata.' });
    }

    if (request.method !== 'POST') {
        response.setHeader('Allow', 'POST');
        return response.status(405).end('Method Not Allowed');
    }

    try {
        const { text } = request.body;

        if (!text) {
            return response.status(400).json({ error: 'Testo mancante.' });
        }

        // Tronca il testo se troppo lungo (limite API ~5000 byte, ma stiamo sicuri)
        // 4000 caratteri sono circa 500-600 parole.
        const safeText = text.substring(0, 4800); 

        const requestBody = {
            input: { text: safeText },
            // Scegliamo una voce "Chirp3" per alta qualità
            voice: { languageCode: 'it-IT', name: 'IT-Chirp3-HD-Leda' },
            audioConfig: { audioEncoding: 'MP3' }
        };

        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            console.error('Errore Google TTS:', errorData);
            return response.status(apiResponse.status).json({ 
                error: `Errore TTS: ${errorData.error?.message || apiResponse.statusText}. Assicurati di aver abilitato 'Cloud Text-to-Speech API' nella Google Cloud Console.` 
            });
        }

        const data = await apiResponse.json();
        
        // data.audioContent è una stringa base64
        return response.status(200).json({ audioContent: data.audioContent });

    } catch (error) {
        console.error('Errore server:', error);
        return response.status(500).json({ error: 'Errore interno del server durante la generazione audio.' });
    }
}
