import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testGemini() {
  console.log("Key:", process.env.GEMINI_API_KEY ? "EXISTS" : "MISSING");
  if (!process.env.GEMINI_API_KEY) return;
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash-latest",
    generationConfig: { responseMimeType: "application/json" }
  });
  
  const descriptions = [
    "Compra no debito: \"No estabelecimento SPT PMB*1T260715-HO51 SAO PAULO BRA\"",
    "Compra no debito: \"No estabelecimento AUTOPASS S.A*ATM TMOB SAO PAULO BRA\""
  ];
  
  const prompt = `
    You are an expert financial categorization assistant for a Brazilian personal finance app. 
    Given the following list of transaction descriptions (many in Portuguese, like 'Pix', 'Compra no debito', 'Uber', 'Mcdonalds', 'SPT', 'AUTOPASS', etc), 
    return a valid JSON object where the keys are the exact descriptions and the values are the most appropriate category from the exact allowed list.
    If you cannot determine a good category, use null. 
    Allowed categories EXACTLY AS WRITTEN:
    [
      "SALARY", "FREELANCE", "INVESTMENTS", "SALES", "RENTAL_INCOME", "OTHER_INCOME", "YIELD",
      "FOOD", "TRANSPORTATION", "HOUSING", "HEALTHCARE", "EDUCATION", "ENTERTAINMENT", "CLOTHING",
      "UTILITIES", "SUBSCRIPTIONS", "ONLINE_SHOPPING", "GROCERIES", "RESTAURANT", "FUEL", "PHARMACY", "OTHER_EXPENSES",
      "TRANSFER"
    ]
    Descriptions: ${JSON.stringify(descriptions)}
  `;
  
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log("Raw output:");
    console.log(text);
    console.log("Parsed JSON:");
    console.log(JSON.parse(text));
  } catch (e) {
    console.error("Failed:", e);
  }
}

testGemini();
