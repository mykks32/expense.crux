import path from 'node:path';
import { defineConfig } from 'vite';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { config as loadDotenv } from 'dotenv';

// Reads env/web.env (repo root) into process.env; Vite then auto-exposes any
// VITE_-prefixed var as import.meta.env. Same file Docker builds generate.
// quiet: true suppresses dotenv's stdout banner.
loadDotenv({ path: path.resolve(import.meta.dirname, '../../env/web.env'), quiet: true });

export default defineConfig({
  server: {
    port: 3001,
    host: true,
  },
  preview: {
    port: 3001,
    host: true, // bind all interfaces, not just loopback, so Docker's port mapping can reach it
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [tailwindcss(), tanstackStart(), viteReact()],
});
