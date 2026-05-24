import { cp, mkdir } from "node:fs/promises";
import { readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

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
    rollupOptions: {
      input: htmlInputs
    }
  },
  plugins: [
    {
      name: "copy-media-directory",
      async closeBundle() {
        try {
          await mkdir("dist/media", { recursive: true });
          await cp("media", "dist/media", { recursive: true });
        } catch (e) {
          // Si el directorio media no existe, lo ignora silenciosamente
        }
        try {
          await cp("search.wasm", "dist/search.wasm");
        } catch (e) {
          // Ignorar si no existe
        }
        try {
          await mkdir("dist/exergia-omega", { recursive: true });
          await cp(resolve(__dirname, "../exergia-omega"), "dist/exergia-omega", { recursive: true });
        } catch (e) {
          // Ignorar
        }
        try {
          await mkdir("dist/borjamoskv-rauw-clone", { recursive: true });
          await cp(resolve(__dirname, "../borjamoskv-rauw-clone"), "dist/borjamoskv-rauw-clone", { recursive: true });
        } catch (e) {
          // Ignorar
        }
      },
    },
  ],
};
