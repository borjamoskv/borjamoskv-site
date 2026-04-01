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

    // ═══ GOD TIER TABERNA FRACTAL ═══
    // Ultra-smooth KIFS (Kaleidoscopic IFS) with soft shadows, AO, and Mouse Interactivity
    const fsSource = `
        precision highp float;
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;

        mat2 rot(float a) {
            float s = sin(a), c = cos(a);
            return mat2(c, -s, s, c);
        }

        // Kaleidoscopic Iterated Function System (KIFS)
        float map(vec3 p) {
            float d = 1.0;
            vec3 q = p;
            
            // Mouse influence on geometry
            float mx = u_mouse.x * 2.0 - 1.0;
            float my = u_mouse.y * 2.0 - 1.0;
            
            for(int i = 0; i < 7; i++) {
                // Folding space
                q = abs(q) - vec3(0.6 + sin(u_time*0.1)*0.1, 0.4 + my*0.1, 0.3 + mx*0.1);
                
                // Rotations
                q.xy *= rot(0.5 + u_time * 0.05);
                q.xz *= rot(0.3 - u_time * 0.03);
                q.yz *= rot(0.2 + mx * 0.5);

                // Scaling limitation to avoid noise
                float k = clamp(1.4 / dot(q, q), 0.0, 2.5);
                q *= k;
                d *= k;
            }
            // Box distance + sphere subtraction for organic mechanical feel
            float box = max(max(abs(q.x), abs(q.y)), abs(q.z)) - 1.2;
            return box / d;
        }

        // Calculate normal
        vec3 calcNormal(vec3 p) {
            vec2 e = vec2(0.002, 0.0);
            return normalize(vec3(
                map(p + e.xyy) - map(p - e.xyy),
                map(p + e.yxy) - map(p - e.yxy),
                map(p + e.yyx) - map(p - e.yyx)
            ));
        }

        // Ambient Occlusion
        float calcAO(vec3 p, vec3 n) {
            float occ = 0.0;
            float sca = 1.0;
            for(int i = 0; i < 5; i++) {
                float h = 0.01 + 0.15 * float(i)/4.0;
                float d = map(p + h * n);
                occ += (h - d) * sca;
                sca *= 0.95;
            }
            return clamp(1.0 - 1.5 * occ, 0.0, 1.0);
        }

        // Soft shadows
        float softShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
            float res = 1.0;
            float t = mint;
            for(int i = 0; i < 30; i++) {
                if(t > maxt) break;
                float h = map(ro + rd * t);
                if(h < 0.001) return 0.0;
                res = min(res, k * h / t);
                t += clamp(h, 0.02, 0.2);
            }
            return clamp(res, 0.0, 1.0);
        }

        void main() {
            vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
            
            // Motion and Camera
            float tTime = u_time * 0.3;
            vec3 ro = vec3(sin(tTime)*2.5, cos(tTime)*1.5, tTime * 2.0); // Travel through space
            
            vec3 target = ro + vec3(sin(tTime*1.1)*0.5, cos(tTime*0.9)*0.5, 1.0);
            vec3 fwd = normalize(target - ro);
            vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), fwd));
            vec3 up = cross(fwd, right);
            vec3 rd = normalize(fwd + uv.x * right + uv.y * up);

            // Raymarching Loop
            float t = 0.0;
            float iter = 0.0;
            for(int i = 0; i < 90; i++) {
                vec3 p = ro + rd * t;
                float d = map(p);
                if(abs(d) < 0.001 || t > 15.0) break;
                t += d * 0.8; // Dampen step for precision
                iter++;
            }

            // YInMn Color Palette
            vec3 coreBlue = vec3(0.17, 0.23, 0.90);    // #2B3BE5
            vec3 neonAqua = vec3(0.49, 0.72, 0.85);    // #7EB8DA
            vec3 darkVoid = vec3(0.04, 0.04, 0.06);    // #0A0A0A

            vec3 col = darkVoid;

            if(t < 15.0) {
                vec3 p = ro + rd * t;
                vec3 n = calcNormal(p);
                
                // Lighting
                vec3 lig = normalize(vec3(0.8, 0.6, -0.5)); // Directional light
                vec3 rlg = reflect(rd, n);
                
                float dif = clamp(dot(n, lig), 0.0, 1.0);
                float shd = softShadow(p, lig, 0.02, 3.0, 16.0);
                float fre = pow(clamp(1.0 + dot(n, rd), 0.0, 1.0), 3.0); // Fresnel glow
                float ao = calcAO(p, n);
                
                // Material Mix
                vec3 matCol = mix(coreBlue * 0.4, coreBlue * 1.5, dif * shd);
                matCol += neonAqua * fre * 1.5; // Fresnel edge highlight
                matCol *= ao;
                
                // Iteration glow (adds procedural light inside cavities)
                float glow = iter / 90.0;
                matCol += neonAqua * glow;

                col = matCol;
            }

            // Atmosphere / Fog (YInMn mist)
            float fog = exp(-0.15 * t);
            col = mix(coreBlue * 0.05, col, fog);

            // Vignette
            col *= 1.0 - 0.5 * dot(uv, uv);

            gl_FragColor = vec4(col, min(fog + iter * 0.01 + 0.1, 0.85)); // Dynamic alpha blending
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
    const mouseLoc = gl.getUniformLocation(program, 'u_mouse');

    let mouseX = 0.5;
    let mouseY = 0.5;
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX / window.innerWidth;
        mouseY = 1.0 - (e.clientY / window.innerHeight);
    }, {passive: true});
    document.addEventListener('touchmove', (e) => {
        if(e.touches.length > 0) {
            mouseX = e.touches[0].clientX / window.innerWidth;
            mouseY = 1.0 - (e.touches[0].clientY / window.innerHeight);
        }
    }, {passive: true});

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
        gl.uniform2f(mouseLoc, mouseX, mouseY);
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
