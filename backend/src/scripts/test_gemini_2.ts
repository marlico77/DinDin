import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function testGemini2() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    
    console.log("Testing gemini-1.5-flash...");
    const prompt = `Return a JSON with hello: "world"`;
    const result = await model.generateContent(prompt);
    console.log("Response:", result.response.text());
  } catch (e) {
    console.error("Failed:", e);
  }
}

testGemini2();
