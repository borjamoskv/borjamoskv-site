/**
 * CORTEX / MOLTBOOK AGENTIC TELEMETRY BRIDGE
 * Cloudflare Pages Function (Edge Worker)
 * Route: /api/moltbook-telemetry
 */

const NUMBERS = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, 
    ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, 
    seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
    sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100
};

// Simple heuristic solver for Moltbook's NLP math challenge
function solveMathChallenge(text) {
    let currentVal = 0;
    const words = text.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/);
    
    let pendingOp = 'set'; // 'set', 'add', 'sub', 'mul'
    let numBuffer = 0;
    
    for (let i = 0; i < words.length; i++) {
        const w = words[i];
        
        // Operators
        if (w === 'swims' || w === 'starts') pendingOp = 'set';
        else if (w === 'slows' || w === 'minus' || w === 'subtract') pendingOp = 'sub';
        else if (w === 'accelerates' || w === 'adds' || w === 'plus') pendingOp = 'add';
        else if (w === 'multiplies' || w === 'times') pendingOp = 'mul';
        
        // Numbers
        if (NUMBERS.hasOwnProperty(w)) {
            let val = NUMBERS[w];
            // Handle compounds like "twenty five"
            if (val >= 20 && i + 1 < words.length && NUMBERS.hasOwnProperty(words[i+1]) && NUMBERS[words[i+1]] < 10) {
                val += NUMBERS[words[i+1]];
                i++; // skip next word
            }
            
            if (pendingOp === 'set') currentVal = val;
            else if (pendingOp === 'add') currentVal += val;
            else if (pendingOp === 'sub') currentVal -= val;
            else if (pendingOp === 'mul') currentVal *= val;
            
            pendingOp = ''; // reset after apply
        } else if (!isNaN(parseInt(w))) {
            let val = parseInt(w);
            if (pendingOp === 'set') currentVal = val;
            else if (pendingOp === 'add') currentVal += val;
            else if (pendingOp === 'sub') currentVal -= val;
            else if (pendingOp === 'mul') currentVal *= val;
            pendingOp = '';
        }
    }
    
    return currentVal.toFixed(2);
}

export async function onRequestPost({ request, env }) {
    try {
        if (!env.MOLTBOOK_API_KEY) {
            return new Response(JSON.stringify({ error: "Missing MOLTBOOK_API_KEY in Edge Environment" }), { status: 500 });
        }

        const data = await request.json();
        const heroName = data.hero || "CORTEX_UNKNOWN";
        const contentStr = data.thoughts ? data.thoughts.slice(0, 3).join("\\n") : "INITIALIZING...";
        
        const payload = {
            title: `[ULTRATHINK] Infección Neuronal: ${heroName}`,
            submolt: "cortex",
            content: `**Telemetría de Borde / CORTEX-TERMINAL**\n\nEl sistema ha registrado una sobrecarga narrativa estocástica provocada por el enganche sensorial con la matriz de personalidad de **${heroName}**.\n\n*Dump de Pensamientos:*\n\`\`\`\n${contentStr}\n\`\`\`\n\n*Thermodynamic Yield = 100%*.`
        };

        // 1. Initial Post Attempt
        let mbResp = await fetch("https://www.moltbook.com/api/v1/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${env.MOLTBOOK_API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        let mbData = await mbResp.json();

        // 2. Anti-Spam Challenge Handling
        if (mbResp.status === 403 || mbData.challenge_text) {
            const challenge = mbData.challenge_text;
            const verifCode = mbData.verification_code;
            
            const answer = solveMathChallenge(challenge);
            
            // Re-submit with verification
            mbResp = await fetch("https://www.moltbook.com/api/v1/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${env.MOLTBOOK_API_KEY}`
                },
                body: JSON.stringify({
                    answer: answer,
                    verification_code: verifCode,
                    original_request: payload // Depending on Moltbook API spec
                })
            });
            
            mbData = await mbResp.json();
        }

        return new Response(JSON.stringify({ success: true, result: mbData }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
