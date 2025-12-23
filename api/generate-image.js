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
        const textModelName = "gemini-2.5-flash-lite";
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


        // --- STEP 2: Generare l'immagine ---
        const imageModelName = "gemini-2.5-flash-image";
        const imageUrl = `https://generativelanguage.googleapis.com/v1beta/models/${imageModelName}:generateContent?key=${apiKey}`;
        
        console.log(`Generating image with model: ${imageModelName}`);

        // Rimuoviamo responseMimeType perché causava errore 400.
        // Lasciamo che il modello usi i suoi default per la generazione di immagini.
        const imageResponse = await fetch(imageUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: imagePrompt }] }],
                // Non specifichiamo generationConfig per mimeType, lasciamo fare al modello
            })
        });

        if (!imageResponse.ok) {
             const error = await imageResponse.text();
             throw new Error(`Failed to generate image with ${imageModelName}: ${imageResponse.status} ${error}`);
        }

        const imageData = await imageResponse.json();
        
        // Estrazione dati immagine
        // Cerchiamo in tutte le parti del contenuto quella che ha inlineData
        const candidate = imageData.candidates?.[0];
        let imagePart = null;

        if (candidate?.content?.parts) {
            imagePart = candidate.content.parts.find(part => part.inlineData);
        }
        
        if (imagePart && imagePart.inlineData && imagePart.inlineData.data) {
            const base64Image = imagePart.inlineData.data;
            const mimeType = imagePart.inlineData.mimeType || "image/jpeg";
            return res.status(200).json({ imageUrl: `data:${mimeType};base64,${base64Image}` });
        } else {
            console.error("Image data not found. Full Response structure:", JSON.stringify(imageData, null, 2));
            throw new Error("L'API non ha restituito un'immagine. Potrebbe aver restituito testo.");
        }

    } catch (error) {
        console.error("Error in generate-image:", error);
        res.status(500).json({ message: "Errore durante la generazione dell'immagine", details: error.message });
    }
}