import { cp, mkdir } from "node:fs/promises";
import { readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import viteCompression from "vite-plugin-compression";
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Descubrir dinámicamente todas las páginas HTML para construir un sitio multipágina
const htmlInputs = readdirSync(__dirname)
  .filter(file => file.endsWith(".html"))
  .reduce((acc, file) => {
    const name = file.replace(/\.html$/, "");
    acc[name] = resolve(__dirname, file);
    return acc;
  }, {});

export default {
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "esnext", // 10x potente
    minify: "esbuild",
    rollupOptions: {
      input: htmlInputs,
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  },
  plugins: [
    ViteImageOptimizer({
      jpeg: { quality: 80 },
      jpg: { quality: 80 },
      png: { quality: 80 },
      webp: { lossless: true },
    }),
    viteCompression({ algorithm: 'brotliCompress' }),
    {
      name: "copy-media-directory",
      async closeBundle() {
        try {
          await mkdir("dist/media", { recursive: true });
          await cp("media", "dist/media", { recursive: true });
        } catch (e) {}
        try { await cp("search.wasm", "dist/search.wasm"); } catch (e) {}
        try {
          await mkdir("dist/exergia-omega", { recursive: true });
          await cp(resolve(__dirname, "../exergia-omega"), "dist/exergia-omega", { recursive: true });
        } catch (e) {}
        try {
          await mkdir("dist/borjamoskv-rauw-clone", { recursive: true });
          await cp(resolve(__dirname, "../borjamoskv-rauw-clone"), "dist/borjamoskv-rauw-clone", { recursive: true });
        } catch (e) {}
      },
    },
  ],
};
