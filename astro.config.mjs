// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: process.env.MOCK_SERVER_PORT ? undefined : cloudflare(),
  security: {
    checkOrigin: false
  },
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [react(), mdx()]
});