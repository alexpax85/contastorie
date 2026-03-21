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


        // --- STEP 2: Generare l'immagine ---
        const imageModelName = "gemini-2.5-flash-image";
        const imageUrl = `https://generativelanguage.googleapis.com/v1beta/models/${imageModelName}:generateContent?key=${apiKey}`;
        
        console.log(`Generating image with model: ${imageModelName}`);

        const imageResponse = await fetch(imageUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: imagePrompt }] }],
                safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
                ]
            })
        });

        const imageData = await imageResponse.json();
        
        if (!imageResponse.ok) {
             console.error(`API Error on Step 2 (${imageModelName}):`, JSON.stringify(imageData, null, 2));
             throw new Error(`Errore API Immagine (${imageModelName}): ${imageResponse.status} ${imageData.error?.message || 'Unknown error'}`);
        }

        console.log("Image API Response received successfully.");
        
        // Estrazione dati immagine
        const candidate = imageData.candidates?.[0];
        
        // Verifica se il contenuto è stato bloccato dai filtri di sicurezza
        if (candidate?.finishReason === 'SAFETY') {
            throw new Error("L'immagine non può essere generata per motivi di sicurezza (filtri Google).");
        }

        let imagePart = null;
        if (candidate?.content?.parts) {
            imagePart = candidate.content.parts.find(part => part.inlineData);
        }
        
        if (imagePart && imagePart.inlineData && imagePart.inlineData.data) {
            const base64Image = imagePart.inlineData.data;
            const mimeType = imagePart.inlineData.mimeType || "image/png";
            return res.status(200).json({ imageUrl: `data:${mimeType};base64,${base64Image}` });
        } else {
            console.error("Image data structure unexpected:", JSON.stringify(imageData, null, 2));
            throw new Error("L'API non ha restituito dati immagine validi. Controlla i log.");
        }

    } catch (error) {
        console.error("Error in generate-image:", error);
        res.status(500).json({ message: "Errore durante la generazione dell'immagine", details: error.message });
    }
}