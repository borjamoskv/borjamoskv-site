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

    let llmResponseText = '';
    let usedFallback = false;

    const env = locals?.runtime?.env as any;
    if (env && env.AI) {
      try {
        const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt }
          ]
        });
        llmResponseText = response.response;
      } catch (err: any) {
        console.warn('Cloudflare Workers AI failed, trying local Ollama...', err);
        usedFallback = true;
      }
    } else {
      usedFallback = true;
    }

    if (usedFallback) {
      try {
        // Query local Ollama tags to find a valid model
        const listRes = await fetch('http://127.0.0.1:11434/api/tags');
        const listData = (await listRes.json()) as any;
        const availableModels = listData.models?.map((m: any) => m.name) || [];

        const preferredModels = [
          'cortex-8b-solver-pro:latest',
          'cortex-8b-solver:latest',
          'qwen2.5-coder:7b',
          'llama3.2:latest'
        ];
        
        let chosenModel = 'llama3.2:latest';
        for (const pref of preferredModels) {
          if (availableModels.includes(pref)) {
            chosenModel = pref;
            break;
          }
        }
        if (!availableModels.includes(chosenModel) && availableModels.length > 0) {
          chosenModel = availableModels[0];
        }

        const ollamaRes = await fetch('http://127.0.0.1:11434/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: chosenModel,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: prompt }
            ],
            stream: false
          })
        });

        if (!ollamaRes.ok) {
          throw new Error(`Ollama returned status ${ollamaRes.status}`);
        }

        const ollamaData = (await ollamaRes.json()) as any;
        llmResponseText = ollamaData.message?.content || '';
      } catch (ollamaErr: any) {
        console.error('Local Ollama fallback error:', ollamaErr);
        llmResponseText = `[ERR_NO_INFERENCE]: COLAPSO COMPLETO DEL EDGE. CLOUDFLARE AI INACCESIBLE Y OLLAMA LOCAL CAÍDO. CORTANTE TÉRMICO ACTIVO.`;
      }
    }

    return new Response(JSON.stringify({ response: llmResponseText }), {
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
