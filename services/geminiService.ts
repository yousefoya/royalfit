
import { GoogleGenAI } from "@google/genai";

export async function getAIInsights(data: any) {
  try {
    // Initialize GoogleGenAI right before the API call to ensure use of the most up-to-date API key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      بصفتك محلل بيانات لنادي رياضي (Royal Fitness)، قم بتحليل البيانات التالية وتقديم 3 نقاط مختصرة (Insights) للمدير:
      البيانات: ${JSON.stringify(data)}
      
      المطلوب:
      1. تحليل معدل الحضور والنشاط.
      2. تحليل أداء المدربين.
      3. نصيحة لزيادة الإيرادات أو تحسين الاحتفاظ بالأعضاء.
      
      اجعل الرد باللغة العربية بلهجة احترافية ومشجعة، وبتنسيق نقاط بسيطة.
    `;

    // Use generateContent with the recommended Gemini 3 Flash model for text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are an expert gym management consultant for Royal Fitness.",
        temperature: 0.7,
      },
    });

    // Directly access the text property of the response
    return response.text;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "لا يمكن الحصول على التحليلات الذكية حالياً. يرجى المحاولة لاحقاً.";
  }
}
