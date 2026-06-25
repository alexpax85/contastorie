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
        const textModelName = "gemini-2.5-flash";
        let promptUrl = `https://generativelanguage.googleapis.com/v1beta/models/${textModelName}:generateContent?key=${apiKey}`;
        
        console.log(`Generating prompt with model: ${textModelName}`);

        let promptResponse = await fetch(promptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Riassumi la seguente storia in una singola frase inglese molto descrittiva e visiva, ottimizzata per generare un'illustrazione stile fiabesco per bambini (digital art style). Storia: "${text}"` }] }]
            })
        });

        if (!promptResponse.ok) {
            const error = await promptResponse.text();
            throw new Error(`Failed to generate prompt with ${textModelName}: ${promptResponse.status} ${error}`);
        }

        const promptData = await promptResponse.json();
        const imagePrompt = promptData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!imagePrompt) {
            throw new Error("Failed to extract prompt text from API response");
        }

        console.log("Generated Image Prompt:", imagePrompt);


        // --- STEP 2: Generare l'immagine con Interactions API ---
        // generateContent non supporta output immagini; usare il nuovo endpoint /v1beta/interactions
        const imageModelName = "gemini-2.5-flash-image";
        const interactionsUrl = `https://generativelanguage.googleapis.com/v1beta/interactions`;

        console.log(`Generating image with model: ${imageModelName} via Interactions API`);

        const imageResponse = await fetch(interactionsUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey
            },
            body: JSON.stringify({
                model: imageModelName,
                input: [
                    { type: "text", text: imagePrompt }
                ]
            })
        });

        const imageData = await imageResponse.json();

        if (!imageResponse.ok) {
            const apiErrorMsg = imageData?.error?.message || imageData?.message || imageResponse.statusText;
            console.error(`API Error on Step 2 (${imageModelName}):`, JSON.stringify(imageData, null, 2));
            return res.status(imageResponse.status).json({
                message: `Errore API Immagine (${imageModelName}): ${apiErrorMsg}`,
                details: imageData?.error
            });
        }

        console.log("Image API Response received successfully.");

        // Estrazione immagine dalla risposta Interactions API
        const base64Image = imageData?.output_image?.data
            ?? imageData?.steps?.flatMap(s => s.content ?? []).find(c => c.type === 'image')?.data;

        if (base64Image) {
            return res.status(200).json({ imageUrl: `data:image/jpeg;base64,${base64Image}` });
        } else {
            console.error("Image data structure unexpected:", JSON.stringify(imageData, null, 2));
            throw new Error("L'API non ha restituito dati immagine validi. Controlla i log.");
        }

    } catch (error) {
        console.error("Error in generate-image:", error);
        res.status(500).json({ message: error.message || "Errore durante la generazione dell'immagine" });
    }
}