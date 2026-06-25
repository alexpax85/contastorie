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
        // --- STEP 1: Generare il prompt per l'immagine ---
        // Primario: 3.1-flash-lite, fallback: 2.5-flash su 503/429
        const textModels = ['gemini-3.1-flash-lite', 'gemini-2.5-flash'];
        let imagePrompt = null;

        for (const model of textModels) {
            console.log(`Generating image prompt with model: ${model}`);
            const promptResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: `Riassumi la seguente storia in una singola frase inglese molto descrittiva e visiva, ottimizzata per generare un'illustrazione stile fiabesco per bambini (digital art style). Storia: "${text}"` }] }]
                    })
                }
            );

            if (promptResponse.status === 503 || promptResponse.status === 429) {
                console.warn(`Model ${model} returned ${promptResponse.status}, trying next...`);
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

        // --- STEP 2: Generare l'immagine con Interactions API ---
        // generateContent non supporta output immagini; usare /v1beta/interactions
        // Primario: 3.1-flash-image, fallback: 2.5-flash-image su 503/429
        const imageModels = ['gemini-3.1-flash-image', 'gemini-2.5-flash-image'];
        const interactionsUrl = 'https://generativelanguage.googleapis.com/v1beta/interactions';

        for (const imageModel of imageModels) {
            console.log(`Generating image with model: ${imageModel}`);

            const imageResponse = await fetch(interactionsUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey
                },
                body: JSON.stringify({
                    model: imageModel,
                    input: [{ type: 'text', text: imagePrompt }]
                })
            });

            const imageData = await imageResponse.json();

            if (imageResponse.status === 503 || imageResponse.status === 429) {
                console.warn(`Image model ${imageModel} returned ${imageResponse.status}, trying next...`);
                continue;
            }

            if (!imageResponse.ok) {
                const apiErrorMsg = imageData?.error?.message || imageData?.message || imageResponse.statusText;
                console.error(`API Error (${imageModel}):`, JSON.stringify(imageData, null, 2));
                return res.status(imageResponse.status).json({
                    message: `Errore API Immagine (${imageModel}): ${apiErrorMsg}`,
                    details: imageData?.error
                });
            }

            const base64Image = imageData?.output_image?.data
                ?? imageData?.steps?.flatMap(s => s.content ?? []).find(c => c.type === 'image')?.data;

            if (base64Image) {
                return res.status(200).json({ imageUrl: `data:image/jpeg;base64,${base64Image}` });
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
