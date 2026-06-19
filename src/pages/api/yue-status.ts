import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const prerender = false;

const STATUS_FILE = '/Users/borjafernandezangulo/.gemini/antigravity/scratch/yue_generation_status.json';

export const GET: APIRoute = async () => {
  try {
    let data;
    try {
      const content = await fs.readFile(STATUS_FILE, 'utf-8');
      data = JSON.parse(content);
    } catch (e) {
      // Estado por defecto si no existe el fichero
      data = {
        status: 'idle',
        progress: 0,
        logs: ['[SYSTEM] Core idle. Ready for synthesis.'],
        outputFile: null,
        timestamp: new Date().toISOString()
      };
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
