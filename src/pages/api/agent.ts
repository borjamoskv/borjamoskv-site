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

// Helper to run shell commands in local development (Node.js)
async function runLocalCommand(command: string, cwd: string): Promise<{ stdout: string; stderr: string }> {
  if (typeof process !== 'undefined' && typeof require !== 'undefined') {
    try {
      const cp = await import('child_process');
      const util = await import('util');
      const exec = util.promisify(cp.exec);
      return await exec(command, { cwd });
    } catch (e: any) {
      return { stdout: '', stderr: `Failed to execute command: ${e.message}` };
    }
  }
  return { stdout: '', stderr: 'Execution not supported in this environment' };
}

// Helper to write file in local development (Node.js)
async function writeLocalFile(filePath: string, content: string): Promise<boolean> {
  if (typeof process !== 'undefined' && typeof require !== 'undefined') {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const absolutePath = path.resolve(filePath);
      await fs.mkdir(path.dirname(absolutePath), { recursive: true });
      await fs.writeFile(absolutePath, content, 'utf-8');
      return true;
    } catch (e) {
      console.error('Failed to write file:', e);
      return false;
    }
  }
  return false;
}

// Helper to read file in local development (Node.js)
async function readLocalFile(filePath: string): Promise<string | null> {
  if (typeof process !== 'undefined' && typeof require !== 'undefined') {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const absolutePath = path.resolve(filePath);
      return await fs.readFile(absolutePath, 'utf-8');
    } catch (e) {
      return null;
    }
  }
  return null;
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'No prompt provided' }), { status: 400 });
    }

    const trimmedPrompt = prompt.trim();
    const isNode = typeof process !== 'undefined' && typeof require !== 'undefined';
    const workspaceRoot = isNode ? process.cwd() : '';

    // ─────────────────────────────────────────────────────────────────────────
    // 1. COMMAND: /audit
    // ─────────────────────────────────────────────────────────────────────────
    if (trimmedPrompt.startsWith('/audit')) {
      if (isNode) {
        // Run unified linters locally
        const { stdout, stderr } = await runLocalCommand('python3 CORTEX/audit_all_linters.py', workspaceRoot);
        const output = stdout || stderr;
        return new Response(JSON.stringify({
          response: `### CORTEX SENTINEL AUDIT (LOCAL EXECUTION)\n\n\`\`\`\n${output}\n\`\`\``
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } else {
        // Serverless Cloudflare Fallback: Fetch pre-compiled JSON diagnostics
        try {
          const url = new URL('/cortex_diagnostic.json', request.url);
          const res = await fetch(url.toString());
          if (res.ok) {
            const data = await res.json() as any;
            let mdTable = `### CORTEX PRE-COMPILED DIAGNOSTICS (PRODUCTION)\n\n`;
            mdTable += `**Timestamp**: ${data.timestamp}\n`;
            mdTable += `**Average Score**: ${data.average_score}%\n`;
            mdTable += `**Verdict**: ${data.verdict}\n\n`;
            mdTable += `| Dimension Linter | Exergy Score | Verdict / Status |\n`;
            mdTable += `| :--- | :---: | :--- |\n`;
            for (const r of data.results || []) {
              mdTable += `| **${r.name}** | **${r.score}%** | ${r.verdict} |\n`;
            }
            return new Response(JSON.stringify({ response: mdTable }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        } catch (e: any) {
          return new Response(JSON.stringify({
            response: `[ERR_AUDIT_FALLBACK]: Failed to retrieve pre-compiled diagnostics: ${e.message}`
          }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({
          response: `[ERR_NO_NODE]: Live child_process audit is not supported in production serverless environments. Please run the audit locally.`
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. COMMAND: /distribute
    // ─────────────────────────────────────────────────────────────────────────
    if (trimmedPrompt.startsWith('/distribute')) {
      const parts = trimmedPrompt.split(' ');
      if (parts.length < 2) {
        return new Response(JSON.stringify({
          response: `[ERR_FORMAT]: USAGE: /distribute [ledger_name]\nExample: /distribute AUTODIDACT`
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      
      const ledgerName = parts[1].toUpperCase();
      const ledgerFile = `CORTEX_LEDGER_${ledgerName}.md`;

      if (isNode) {
        const ledgerContent = await readLocalFile(ledgerFile);
        if (!ledgerContent) {
          return new Response(JSON.stringify({
            response: `[ERR_NOT_FOUND]: Ledger file "${ledgerFile}" not found in root workspace.`
          }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        // Generate clean frontmatter markdown article
        const articleTitle = `Exergía Cognitiva: ${ledgerName.charAt(0) + ledgerName.slice(1).toLowerCase()}`;
        const articlePath = `src/content/articles/${ledgerName.toLowerCase()}.md`;
        
        const dateStr = new Date().toISOString().split('T')[0];
        const formattedArticle = `---
title: "${articleTitle}"
description: "Publicación automática de la síntesis del Ledger ${ledgerName}."
pubDate: "${dateStr}"
tags: ["C5-REAL", "${ledgerName.toLowerCase()}", "cortex-distribution"]
sentiment: "High Exergy"
---

${ledgerContent.replace(/^>.*$/m, '') /* strip ledger metadata header */}
`;

        const writeSuccess = await writeLocalFile(articlePath, formattedArticle);
        if (!writeSuccess) {
          return new Response(JSON.stringify({
            response: `[ERR_WRITE_FAILED]: Failed to create content file at ${articlePath}`
          }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        // Run local git workflow (Git Sentinel pre-commit integration)
        let gitMessage = `[+] Published locally to ${articlePath}\n`;
        try {
          const linterAudit = await runLocalCommand('python3 CORTEX/audit_all_linters.py', workspaceRoot);
          if (linterAudit.stderr && !linterAudit.stdout) {
            gitMessage += `[!] Linter audit failed: ${linterAudit.stderr}. Git commit aborted.\n`;
          } else {
            // Commit and push
            await runLocalCommand(`git add ${articlePath} ${ledgerFile}`, workspaceRoot);
            await runLocalCommand(`git commit -m "feat(cortex): distribute ${ledgerName} ledger"`, workspaceRoot);
            gitMessage += `[+] Staged, validated, and committed via Git Sentinel.\n`;
          }
        } catch (gitErr: any) {
          gitMessage += `[!] Git Sync error: ${gitErr.message}\n`;
        }

        return new Response(JSON.stringify({
          response: `### KNOWLEDGE AGENT: DISTRIBUTION RESOLVED\n\n${gitMessage}`
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } else {
        return new Response(JSON.stringify({
          response: `[ERR_PRODUCTION_LOCKED]: Automated local file writes and Git commits must be run in local development mode.`
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. STANDARD INFERENCE (RITXIE HAWTING CHAT fallback)
    // ─────────────────────────────────────────────────────────────────────────
    let llmResponseText = '';
    let usedFallback = false;

    let env: any = null;
    try {
      env = locals?.runtime?.env;
    } catch (e) {}
    if (!env) {
      try {
        // @ts-ignore
        const cfWorkers = await import('cloudflare:workers');
        env = cfWorkers.env;
      } catch (e) {}
    }
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
