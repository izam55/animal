const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

async function test() {
    const client = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });

    try {
        console.log("Testing generateContent with gemini-2.0-flash...");
        const response = await client.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{ role: 'user', parts: [{ text: 'Halo' }] }],
        });
        console.log("Response:", response.text);
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
