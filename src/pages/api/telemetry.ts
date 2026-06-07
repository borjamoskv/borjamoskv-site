import type { APIRoute } from 'astro';

export const prerender = false;

// C5-REAL / C4-SIM: Global Entropy Tracker
export const GET: APIRoute = async ({ locals }) => {
  try {
    const env = locals?.runtime?.env as any;
    if (!env || !env.CORTEX_ENTROPY) {
      return new Response(JSON.stringify({ 
        entropy: 9999, 
        status: "C4-SIM: LOCAL CACHE", 
        error: "NO CLOUDFLARE KV BINDING" 
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const entropyStr = await env.CORTEX_ENTROPY.get('global_entropy');
    const entropy = entropyStr ? parseInt(entropyStr, 10) : 0;
    
    return new Response(JSON.stringify({ 
      entropy, 
      status: "C5-REAL: CLOUDFLARE KV" 
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { delta } = await request.json();
    const amount = Number(delta) || 1;

    const env = locals?.runtime?.env as any;
    if (!env || !env.CORTEX_ENTROPY) {
      return new Response(JSON.stringify({ 
        entropy: 9999 + amount, 
        status: "C4-SIM: LOCAL CACHE",
        error: "NO CLOUDFLARE KV BINDING"
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const entropyStr = await env.CORTEX_ENTROPY.get('global_entropy');
    const currentEntropy = entropyStr ? parseInt(entropyStr, 10) : 0;
    const newEntropy = currentEntropy + amount;
    
    await env.CORTEX_ENTROPY.put('global_entropy', newEntropy.toString());
    
    return new Response(JSON.stringify({ 
      entropy: newEntropy, 
      status: "C5-REAL: CLOUDFLARE KV" 
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
