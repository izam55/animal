require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require("@google/genai");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server Fauna AI berjalan! Menggunakan SDK @google/genai terbaru.');
});

// Inisialisasi Google GenAI Client
const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;

    // Convert history format if necessary (SDK @google/genai expects specific format)
    // History dari frontend: [{ role: "user", parts: [{ text: "..." }] }]
    // SDK ini juga mengharapkan format yang mirip.
    
    try {
        try {
            // Cobalah dengan Grounding (Google Search)
            const response = await client.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [
                    ...history,
                    { role: 'user', parts: [{ text: message }] }
                ],
                config: {
                    systemInstruction: "Kamu adalah Fauna AI, pakar Zoologi profesional dari website Animalia. Berikan informasi yang akurat dan edukatif tentang hewan. Gunakan data terbaru dari internet jika perlu. Jawab dalam Bahasa Indonesia yang ramah dan profesional. Gunakan format markdown (bold, list, dll).",
                    tools: [{ googleSearch: {} }]
                }
            });

            return res.json({ reply: response.text });
        } catch (groundingError) {
            console.error("Grounding Error with @google/genai, falling back:", groundingError);
            
            // Fallback: Tanpa Grounding
            const response = await client.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [
                    ...history,
                    { role: 'user', parts: [{ text: message }] }
                ],
                config: {
                    systemInstruction: "Kamu adalah Fauna AI, pakar Zoologi profesional. Jawablah pertanyaan pengguna tentang hewan sesuai pengetahuanmu. Jawab dalam Bahasa Indonesia yang ramah."
                }
            });

            return res.json({ reply: response.text });
        }
    } catch (error) {
        console.error("Critical AI Error with @google/genai:", error);
        res.status(500).json({ error: "Terjadi kesalahan pada server AI baru." });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
