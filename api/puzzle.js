import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  const { defenseLevel } = request.body;
  
  const diffVal = Number(defenseLevel) || 0;
  const difficulty = diffVal > 1000 ? 'Hard' : diffVal > 500 ? 'Medium' : 'Easy';
  
  if (!process.env.GEMINI_API_KEY) {
     return response.status(200).json({
        question: "Gemini Key Missing: What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        answer: "4"
     });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
    const prompt = `Generate a unique single ${difficulty} math/logic multiple-choice question (like number prediction or sequence).
    Return ONLY valid JSON with no markdown formatting. Structure:
    { "question": "The question text", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "The exact string of the correct option" }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let puzzle;
    try {
        puzzle = JSON.parse(jsonStr);
    } catch (e) {
        console.error("JSON Parse Error", text);
        // Retry or fallback
        throw new Error("Failed to parse puzzle");
    }

    return response.status(200).json(puzzle);
  } catch(error) {
     console.error("Gemini Error:", error);
     return response.status(200).json({
        question: `(Fallback ${difficulty}) Pick the odd one out: 2, 4, 5, 8`,
        options: ["2", "4", "5", "8"],
        answer: "5"
     });
  }
}
