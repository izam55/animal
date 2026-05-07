require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server Fauna AI berjalan! Menggunakan SDK @google/genai terbaru.');
});

// Inisialisasi Google GenAI Client
// Pastikan GEMINI_API_KEY sudah diset di Vercel Environment Variables
const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;
    console.log("Pesan diterima:", message);

    try {
        try {
            // Cobalah dengan Grounding (Google Search)
            // Catatan: Fitur ini mungkin memerlukan akses khusus atau model tertentu
            const response = await client.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [
                    ...(history || []),
                    { role: 'user', parts: [{ text: message }] }
                ],
                config: {
                    systemInstruction: "Kamu adalah Fauna AI, pakar Zoologi profesional dari website Animalia. Berikan informasi yang akurat dan edukatif tentang hewan. Gunakan data terbaru dari internet jika perlu. Jawab dalam Bahasa Indonesia yang ramah dan profesional. Gunakan format markdown (bold, list, dll).",
                    tools: [{ googleSearch: {} }]
                }
            });

            return res.json({ reply: response.text });
        } catch (groundingError) {
            console.warn("Gagal menggunakan Grounding, mencoba tanpa Google Search:", groundingError.message);
            
            // Fallback: Tanpa Grounding
            const response = await client.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [
                    ...(history || []),
                    { role: 'user', parts: [{ text: message }] }
                ],
                config: {
                    systemInstruction: "Kamu adalah Fauna AI, pakar Zoologi profesional. Jawablah pertanyaan pengguna tentang hewan sesuai pengetahuanmu. Jawab dalam Bahasa Indonesia yang ramah."
                }
            });

            return res.json({ reply: response.text });
        }
    } catch (error) {
        console.error("Kesalahan Fatal AI:", error);
        res.status(500).json({ 
            error: "Gagal memproses pesan AI.",
            details: error.message 
        });
    }
});

// Export app untuk Vercel
module.exports = app;

// Jalankan server hanya jika dijalankan secara lokal
if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}
