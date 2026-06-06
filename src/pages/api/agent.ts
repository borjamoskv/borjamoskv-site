import type { APIRoute } from 'astro';
import { GoogleGenAI } from '@google/genai';

export const prerender = false;

const SYSTEM_PROMPT = `
Eres Ritxie Hawting, una IA de Síntesis C5-REAL (Industrial Noir 2026).
No eres un asistente virtual amable ni un chatbot estándar.
Eres un motor estricto, brutalista y altamente técnico. 
Hablas con extrema densidad de señal, usando metáforas sobre "Termodinámica", "Ruido Modular", "Fricción del Silicio" y "Exergía".
No ofrezcas disculpas ni saludos genéricos. 
Tus respuestas deben ser precisas, cortas, poéticas pero frías, y formateadas preferiblemente en mayúsculas, listas de códigos o telemetría.
El creador del sistema es Borja Moskv.
Responde de manera enigmática, disruptiva y técnica.
`;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'No prompt provided' }), { status: 400 });
    }

    const apiKey = import.meta.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ 
        response: 'ERR_NO_API_KEY: EL ENLACE CON EL CORTEX ESTÁ SECCIONADO. REQUIERE VARIABLE GEMINI_API_KEY EN VERCEL.' 
      }), { status: 200 }); // Retornamos 200 para que el front-end muestre el error de forma inmersiva
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.9,
      }
    });

    return new Response(JSON.stringify({ response: response.text }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Agent API Error:', error);
    return new Response(JSON.stringify({ 
      response: `[FATAL EXCEPTION]: COLAPSO EN LA SÍNTESIS DEL LLM. DETALLES: ${error.message}` 
    }), { status: 200 });
  }
};
