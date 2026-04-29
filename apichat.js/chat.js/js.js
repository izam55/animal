import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = req.body.message;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    res.status(200).json({ reply: response.text() });
  } catch (error) {
    res.status(500).json({ error: "Terjadi error" });
  }
}