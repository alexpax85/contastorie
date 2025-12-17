// js/gemini-api.js

// Questa funzione ora chiama il nostro backend sicuro invece dell'API di Gemini direttamente.
async function generateStory(characters, setting, moral) {
    const apiEndpoint = '/api/generate-story'; // L'URL della nostra funzione serverless

    try {
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Invia i dati scelti dall'utente al nostro backend
            body: JSON.stringify({
                characters,
                setting,
                moral
            }),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error('Errore dal nostro backend:', errorBody);
            // Mostra un messaggio più specifico se disponibile
            throw new Error(errorBody.error || `Errore: ${response.statusText}`);
        }

        const data = await response.json();
        return data; // Il nostro backend ora restituisce già { title, storyText }

    } catch (error) {
        console.error('Errore durante la chiamata al backend:', error);
        throw error; // Rilancia l'errore per gestirlo nell'UI
    }
}
