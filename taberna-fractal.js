/**
 * CORTEX TABERNA FRACTAL ENGINE
 * Pure WebGL Raymarched Fractal Background
 * Style: Taberna / YInMn Blue dominance
 * ═══════════════════════════════════════════════════════════
 */
(function() {
'use strict';

function initFractal() {
    const canvas = document.createElement('canvas');
    canvas.id = 'taberna-fractal-bg';
    canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:-2;pointer-events:none;opacity:0.6;mix-blend-mode:screen;';
    document.body.appendChild(canvas);

    const gl = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false });
    if (!gl) return;

    const vsSource = `
        attribute vec2 position;
        void main() {
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    // High performance raymarched fractal (Mandelbox-ish / foldings)
    // Colored strictly in YInMn Blue / Cobalt Electric palette
    const fsSource = `
        precision mediump float;
        uniform float u_time;
        uniform vec2 u_resolution;

        // YInMn Blue Palette: #2B3BE5 -> vec3(0.17, 0.23, 0.90)
        // Neon Indigo: vec3(0.31, 0.27, 0.90)
        
        mat2 rot(float a) {
            float s = sin(a), c = cos(a);
            return mat2(c, -s, s, c);
        }

        // Fractal formula
        float map(vec3 p) {
            vec3 q = p;
            float d = 1.0;
            for(int i = 0; i < 5; i++) {
                q.xyz = abs(q.xyz) - vec3(0.5, 0.4, 0.3);
                q.xy *= rot(u_time * 0.1);
                q.xz *= rot(u_time * 0.05);
                float k = 1.2 / dot(q, q);
                q *= k;
                d *= k;
            }
            return (length(q) - 1.5) / d;
        }

        void main() {
            vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
            
            // Camera
            vec3 ro = vec3(sin(u_time*0.2)*2.0, cos(u_time*0.3)*1.0, u_time * 0.5); // Move forward
            vec3 rd = normalize(vec3(uv, 1.0));
            rd.xz *= rot(sin(u_time*0.1)*0.2);
            rd.xy *= rot(cos(u_time*0.15)*0.2);

            // Raymarching
            float t = 0.0;
            float iter = 0.0;
            for(int i = 0; i < 60; i++) {
                vec3 p = ro + rd * t;
                float d = map(p);
                if(d < 0.001 || t > 10.0) break;
                t += d;
                iter++;
            }

            // Coloring based on iterations and distance
            float glow = iter / 60.0;
            
            // YInMn Blue dominance: #2B3BE5
            vec3 colBase = vec3(0.17, 0.23, 0.90);
            vec3 colHighlight = vec3(0.48, 0.72, 0.85); // 7EB8DA Pastel blue
            
            vec3 col = mix(colBase * 0.1, colHighlight, glow * 1.5);
            
            // Fog / Depth fade
            col *= exp(-0.2 * t);
            
            // Add grid / digital noise texture subtle
            float pulse = sin(u_time * 2.0 - length(uv)*10.0) * 0.5 + 0.5;
            col += colBase * pulse * 0.1;

            gl_FragColor = vec4(col, glow * 0.8);
        }
    `;

    function compileShader(type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const vs = compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,  1, -1,  -1, 1,
        -1,  1,  1, -1,   1, 1
    ]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const resLoc = gl.getUniformLocation(program, 'u_resolution');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(resLoc, canvas.width, canvas.height);
    }
    window.addEventListener('resize', resize);
    resize();

    let start = Date.now();
    function render() {
        gl.uniform1f(timeLoc, (Date.now() - start) / 1000.0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(render);
    }
    render();
}

// Ensure it loads after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFractal);
} else {
    initFractal();
}

})();
