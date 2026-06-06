import type { APIRoute } from 'astro';
import { kv } from '@vercel/kv';

export const prerender = false;

// C5-REAL / C4-SIM: Global Entropy Tracker
export const GET: APIRoute = async () => {
  try {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return new Response(JSON.stringify({ 
        entropy: 9999, 
        status: "C4-SIM: LOCAL CACHE", 
        error: "NO KV_REST_API_URL" 
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const entropy = await kv.get('global_entropy') || 0;
    
    return new Response(JSON.stringify({ 
      entropy, 
      status: "C5-REAL: UPSTASH REDIS" 
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { delta } = await request.json();
    const amount = Number(delta) || 1;

    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return new Response(JSON.stringify({ 
        entropy: 9999 + amount, 
        status: "C4-SIM: LOCAL CACHE",
        error: "NO KV_REST_API_URL"
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const newEntropy = await kv.incrby('global_entropy', amount);
    
    return new Response(JSON.stringify({ 
      entropy: newEntropy, 
      status: "C5-REAL: UPSTASH REDIS" 
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
