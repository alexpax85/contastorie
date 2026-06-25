// api/generate-image.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests allowed' });
    }

    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ message: 'Missing text in request body' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ message: 'Server configuration error: Missing API Key' });
    }

    try {
        // --- STEP 1: Genera un prompt visivo dalla storia via Gemini ---
        // Primario: 3.1-flash-lite, fallback: 2.5-flash su 503/429
        const textModels = ['gemini-3.1-flash-lite', 'gemini-2.5-flash'];
        let imagePrompt = null;

        for (const model of textModels) {
            console.log(`Generating image prompt with model: ${model}`);
            const promptResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-goog-api-key': apiKey
                    },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: `Riassumi la seguente storia in una singola frase inglese molto descrittiva e visiva, ottimizzata per generare un'illustrazione stile fiabesco per bambini (digital art style, pastel colors, warm and magical atmosphere). Storia: "${text}"` }] }]
                    })
                }
            );

            if (promptResponse.status === 503 || promptResponse.status === 429) {
                console.warn(`Text model ${model} returned ${promptResponse.status}, trying next...`);
                continue;
            }

            if (!promptResponse.ok) {
                const error = await promptResponse.text();
                throw new Error(`Failed to generate prompt (${model}): ${promptResponse.status} ${error}`);
            }

            const promptData = await promptResponse.json();
            imagePrompt = promptData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (imagePrompt) break;
        }

        if (!imagePrompt) {
            return res.status(503).json({ message: 'Il servizio è temporaneamente sovraccarico. Riprova tra qualche minuto.' });
        }

        console.log("Generated Image Prompt:", imagePrompt);

        // --- STEP 2: Genera l'immagine via Pollinations.ai (gratuito, no API key) ---
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=768&height=768&nologo=true`;

        return res.status(200).json({ imageUrl });

    } catch (error) {
        console.error("Error in generate-image:", error);
        res.status(500).json({ message: error.message || "Errore durante la generazione dell'immagine" });
    }
}
