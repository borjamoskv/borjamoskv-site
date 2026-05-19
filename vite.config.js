import { cp, mkdir } from "node:fs/promises";

export default {
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  plugins: [
    {
      name: "copy-media-directory",
      async closeBundle() {
        await mkdir("dist/media", { recursive: true });
        await cp("media", "dist/media", { recursive: true });
      },
    },
  ],
};
