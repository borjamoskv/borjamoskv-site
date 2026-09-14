import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

export const prerender = false;

const YUE_DIR = '/Users/borjafernandezangulo/.gemini/antigravity/scratch/YuE';
const STATUS_FILE = '/Users/borjafernandezangulo/.gemini/antigravity/scratch/yue_generation_status.json';
const OUTPUT_PUBLIC_DIR = path.resolve(process.cwd(), 'public/generated');

// Simulación de logs de YuE (modo C4-SIM)
const SIMULATED_STEPS = [
  { p: 5, log: "[SYSTEM] Initializing SoundStream and Vocos models..." },
  { p: 10, log: "[SYSTEM] MMTokenizer loaded with vocabulary size of 32,000." },
  { p: 15, log: "[STAGE 1] Loading m-a-p/YuE-s1-7B-anneal-en-icl weight matrices onto execution units..." },
  { p: 20, log: "[STAGE 1] Formatting input prompts. Processing Dual-Track In-Context Learning cues..." },
  { p: 25, log: "[STAGE 1] Vocal track prompt pop.00001.Vocals.mp3 read (0s to 30s)." },
  { p: 30, log: "[STAGE 1] Instrumental track prompt pop.00001.Instrumental.mp3 read (0s to 30s)." },
  { p: 35, log: "[STAGE 1] Start generating Segment 1/2. Processing lyric block: [verse]..." },
  { p: 40, log: "[STAGE 1] Generating audio tokens (Autoregressive sampling: temp=1.0, top_p=0.9)..." },
  { p: 50, log: "[STAGE 1] Segment 1/2 complete. Generated 1840 audio tokens." },
  { p: 55, log: "[STAGE 1] Start generating Segment 2/2. Processing lyric block: [chorus]..." },
  { p: 65, log: "[STAGE 1] Segment 2/2 complete. Generated 1920 audio tokens." },
  { p: 70, log: "[STAGE 2] Initializing m-a-p/YuE-s2-1B-general for upsampling and quantization..." },
  { p: 75, log: "[STAGE 2] Processing batch size of 4. Refining audio codebooks..." },
  { p: 85, log: "[STAGE 2] Upsampling complete. Extracting 8-layer quantizer indices." },
  { p: 90, log: "[VOCODER] Reconstructing final audio waveform with SoundStream decoder..." },
  { p: 95, log: "[VOCODER] Running energy-matched low-frequency phase alignment..." },
  { p: 100, log: "[SYSTEM] Synthesis successfully completed. Output saved." }
];

async function updateStatus(data: any) {
  await fs.mkdir(path.dirname(STATUS_FILE), { recursive: true });
  await fs.writeFile(STATUS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const lyrics = formData.get('lyrics') as string;
    const genre = formData.get('genre') as string;
    const runNSegments = parseInt(formData.get('run_n_segments') as string || '2');
    const repetitionPenalty = parseFloat(formData.get('repetition_penalty') as string || '1.1');
    const simulation = formData.get('simulation') === 'true';

    const vocalFile = formData.get('vocal_file') as File | null;
    const instFile = formData.get('inst_file') as File | null;

    if (!lyrics || !genre) {
      return new Response(JSON.stringify({ error: 'Faltan campos obligatorios: letras y género.' }), { status: 400 });
    }

    const taskId = `yue_${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Crear carpetas necesarias
    await fs.mkdir(OUTPUT_PUBLIC_DIR, { recursive: true });

    if (simulation) {
      // Lanzar simulación asíncrona
      let currentProgress = 0;
      let logsList: string[] = [`[SYSTEM] Task ${taskId} started in simulation mode (C4-SIM).`];
      
      await updateStatus({
        taskId,
        status: 'running',
        progress: 0,
        logs: logsList,
        outputFile: null,
        timestamp
      });

      const interval = setInterval(async () => {
        const nextStep = SIMULATED_STEPS.find(s => s.p > currentProgress);
        if (nextStep) {
          currentProgress = nextStep.p;
          logsList.push(nextStep.log);
          
          let outputFile = null;
          let status = 'running';
          if (currentProgress === 100) {
            status = 'completed';
            // Dejar una pista simulada
            outputFile = `/generated/simulated_track.mp3`;
            clearInterval(interval);
          }

          await updateStatus({
            taskId,
            status,
            progress: currentProgress,
            logs: logsList,
            outputFile,
            timestamp: new Date().toISOString()
          });
        } else {
          clearInterval(interval);
        }
      }, 2000);

      return new Response(JSON.stringify({ taskId, message: 'Simulación de síntesis iniciada.' }), { status: 200 });
    }

    // --- MODO REAL C5-REAL ---
    // Guardar los archivos de audio
    let vocalPath = '';
    let instPath = '';

    const uploadDir = path.join(YUE_DIR, 'inference/prompt_egs');
    await fs.mkdir(uploadDir, { recursive: true });

    if (vocalFile && vocalFile.size > 0) {
      vocalPath = path.join(uploadDir, `${taskId}_vocals.mp3`);
      const buffer = Buffer.from(await vocalFile.arrayBuffer());
      await fs.writeFile(vocalPath, buffer);
    }
    if (instFile && instFile.size > 0) {
      instPath = path.join(uploadDir, `${taskId}_instrumental.mp3`);
      const buffer = Buffer.from(await instFile.arrayBuffer());
      await fs.writeFile(instPath, buffer);
    }

    // Escribir genre.txt y lyrics.txt
    const genreTxtPath = path.join(YUE_DIR, `inference/${taskId}_genre.txt`);
    const lyricsTxtPath = path.join(YUE_DIR, `inference/${taskId}_lyrics.txt`);
    
    await fs.writeFile(genreTxtPath, genre.trim(), 'utf-8');
    await fs.writeFile(lyricsTxtPath, lyrics.trim(), 'utf-8');

    // Inicializar estado
    const logsList = [`[SYSTEM] Task ${taskId} initialized. Mode: C5-REAL (CPU).`];
    await updateStatus({
      taskId,
      status: 'running',
      progress: 0,
      logs: logsList,
      outputFile: null,
      timestamp
    });

    // Argumentos para infer.py
    const args = [
      'infer.py',
      '--cuda_idx', '0',
      '--stage1_model', 'm-a-p/YuE-s1-7B-anneal-en-icl',
      '--stage2_model', 'm-a-p/YuE-s2-1B-general',
      '--genre_txt', genreTxtPath,
      '--lyrics_txt', lyricsTxtPath,
      '--run_n_segments', String(runNSegments),
      '--stage2_batch_size', '4',
      '--output_dir', `../output_${taskId}`,
      '--max_new_tokens', '3000',
      '--repetition_penalty', String(repetitionPenalty)
    ];

    if (vocalPath && instPath) {
      args.push('--use_dual_tracks_prompt');
      args.push('--vocal_track_prompt_path', vocalPath);
      args.push('--instrumental_track_prompt_path', instPath);
      args.push('--prompt_start_time', '0');
      args.push('--prompt_end_time', '30');
    }

    // Lanzar proceso infer.py usando el python del venv si existe, o python3 por defecto
    const pythonCmd = 'python3';
    const child = spawn(pythonCmd, args, {
      cwd: path.join(YUE_DIR, 'inference'),
      env: { ...process.env, PYTORCH_ENABLE_MPS_FALLBACK: '1' }
    });

    child.stdout.on('data', async (chunk) => {
      const line = chunk.toString().trim();
      if (line) {
        logsList.push(line);
        // Intentar parsear el progreso aproximado
        let progress = 5;
        if (line.includes('stage1')) progress = 30;
        if (line.includes('stage2')) progress = 70;
        if (line.includes('Vocos')) progress = 90;

        await updateStatus({
          taskId,
          status: 'running',
          progress,
          logs: logsList.slice(-200), // Mantener los últimos 200 logs para evitar saturar la memoria
          outputFile: null,
          timestamp: new Date().toISOString()
        });
      }
    });

    child.stderr.on('data', async (chunk) => {
      const line = chunk.toString().trim();
      if (line) {
        logsList.push(`[WARN/ERR] ${line}`);
        await updateStatus({
          taskId,
          status: 'running',
          progress: logsList.length > 50 ? 50 : 10,
          logs: logsList.slice(-200),
          outputFile: null,
          timestamp: new Date().toISOString()
        });
      }
    });

    child.on('close', async (code) => {
      if (code === 0) {
        // Buscar el archivo resultante en la carpeta de salida
        const outDir = path.join(YUE_DIR, `output_${taskId}/stage2`);
        try {
          const files = await fs.readdir(outDir);
          const audioFile = files.find(f => f.endsWith('.mp3') || f.endsWith('.wav'));
          if (audioFile) {
            const srcPath = path.join(outDir, audioFile);
            const destName = `${taskId}_output.mp3`;
            const destPath = path.join(OUTPUT_PUBLIC_DIR, destName);
            await fs.copyFile(srcPath, destPath);

            logsList.push(`[SYSTEM] Success. Audio file saved as /generated/${destName}`);
            await updateStatus({
              taskId,
              status: 'completed',
              progress: 100,
              logs: logsList,
              outputFile: `/generated/${destName}`,
              timestamp: new Date().toISOString()
            });
            return;
          }
        } catch (e) {
          logsList.push(`[ERROR] Failed to locate output file: ${(e as Error).message}`);
        }
        
        await updateStatus({
          taskId,
          status: 'failed',
          progress: 100,
          logs: logsList,
          outputFile: null,
          timestamp: new Date().toISOString()
        });
      } else {
        logsList.push(`[SYSTEM] Process exited with error code ${code}`);
        await updateStatus({
          taskId,
          status: 'failed',
          progress: 100,
          logs: logsList,
          outputFile: null,
          timestamp: new Date().toISOString()
        });
      }
    });

    return new Response(JSON.stringify({ taskId, message: 'Inferencia de YuE iniciada de forma asíncrona en CPU.' }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
};
