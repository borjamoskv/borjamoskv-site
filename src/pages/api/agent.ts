import type { APIRoute } from 'astro';

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

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'No prompt provided' }), { status: 400 });
    }

    const env = locals?.runtime?.env as any;
    
    if (!env || !env.AI) {
      return new Response(JSON.stringify({ 
        response: 'ERR_NO_AI_BINDING: EL ENLACE CON EL WORKERS AI ESTÁ SECCIONADO. REQUIERE VARIABLE AI EN WRANGLER.' 
      }), { status: 200 }); 
    }

    const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ]
    });

    return new Response(JSON.stringify({ response: response.response }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error: any) {
    console.error('Agent API Error:', error);
    return new Response(JSON.stringify({ 
      response: `[FATAL EXCEPTION]: COLAPSO EN LA SÍNTESIS DEL LLM. DETALLES: ${error.message}` 
    }), { status: 200 });
  }
};
