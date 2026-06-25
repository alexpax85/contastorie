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

    const headers = {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
    };

    try {
        // --- STEP 1: Generare il prompt per l'immagine ---
        // Primario: 3.1-flash-lite, fallback: 2.5-flash su 503/429
        const textModels = ['gemini-3.1-flash-lite', 'gemini-2.5-flash'];
        let imagePrompt = null;

        for (const model of textModels) {
            console.log(`Generating image prompt with model: ${model}`);
            const promptResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`,
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: `Riassumi la seguente storia in una singola frase inglese molto descrittiva e visiva, ottimizzata per generare un'illustrazione stile fiabesco per bambini (digital art style). Storia: "${text}"` }] }]
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
            imagePrompt = promptData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (imagePrompt) break;
        }

        if (!imagePrompt) {
            return res.status(503).json({ message: 'Il servizio è temporaneamente sovraccarico. Riprova tra qualche minuto.' });
        }

        console.log("Generated Image Prompt:", imagePrompt);

        // --- STEP 2: Generare l'immagine con generateContent + responseModalities ---
        // Primario: 3.1-flash-image, fallback: 2.5-flash-image su 503/429
        const imageModels = ['gemini-3.1-flash-image', 'gemini-2.5-flash-image'];

        for (const imageModel of imageModels) {
            console.log(`Generating image with model: ${imageModel}`);

            const imageResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1/models/${imageModel}:generateContent`,
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: imagePrompt }] }],
                        generationConfig: {
                            responseModalities: ['TEXT', 'IMAGE']
                        }
                    })
                }
            );

            const imageData = await imageResponse.json();

            if (imageResponse.status === 503 || imageResponse.status === 429) {
                console.warn(`Image model ${imageModel} returned ${imageResponse.status}, trying next...`);
                continue;
            }

            if (!imageResponse.ok) {
                const apiErrorMsg = imageData?.error?.message || imageResponse.statusText;
                console.error(`API Error (${imageModel}):`, JSON.stringify(imageData, null, 2));
                return res.status(imageResponse.status).json({
                    message: `Errore API Immagine (${imageModel}): ${apiErrorMsg}`,
                    details: imageData?.error
                });
            }

            const parts = imageData?.candidates?.[0]?.content?.parts ?? [];
            const imagePart = parts.find(p => p.inlineData);

            if (imagePart?.inlineData?.data) {
                const { data, mimeType } = imagePart.inlineData;
                return res.status(200).json({ imageUrl: `data:${mimeType || 'image/png'};base64,${data}` });
            }

            console.error("Image data structure unexpected:", JSON.stringify(imageData, null, 2));
            throw new Error("L'API non ha restituito dati immagine validi. Controlla i log.");
        }

        return res.status(503).json({ message: 'Il servizio di generazione immagini è temporaneamente sovraccarico. Riprova tra qualche minuto.' });

    } catch (error) {
        console.error("Error in generate-image:", error);
        res.status(500).json({ message: error.message || "Errore durante la generazione dell'immagine" });
    }
}
