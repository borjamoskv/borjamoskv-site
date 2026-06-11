// C5-REAL
export const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Missing prompt' }), { status: 400 });
    }

    const cmd = prompt.toLowerCase();

    // Simulated LLM Routing Logic
    let video = 'idle';
    let tts = 'No entiendo tu lógica, humano.';
    let status = 'UNREGISTERED';

    if (cmd.includes('pintor') || cmd.includes('jumpscare') || cmd.includes('susto')) {
      video = 'jumpscare';
      tts = '¿Quieres arte? Te daré arte...';
      status = 'REGISTERED';
    } else if (cmd.includes('cigarro') || cmd.includes('fuma') || cmd.includes('porro')) {
      video = 'smoke';
      tts = 'Relajando los pulmones antes de la cacería.';
      status = 'REGISTERED';
    } else if (cmd.includes('baila') || cmd.includes('macarena') || cmd.includes('fnaf')) {
      video = 'dance';
      tts = '¿Te gusta como me muevo, víctima?';
      status = 'REGISTERED';
    } else {
      // Dynamic fallback for unrecognized prompts (The LLM proxy simulation)
      video = 'idle';
      const creepyResponses = [
        `¿${prompt}? Qué idea más patética.`,
        `No voy a hacer eso. Prefiero mirarte.`,
        `Interesante... pero no me apetece.`,
        `Tus órdenes no significan nada aquí.`
      ];
      tts = creepyResponses[Math.floor(Math.random() * creepyResponses.length)];
    }

    return new Response(JSON.stringify({
      video,
      tts,
      status
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
