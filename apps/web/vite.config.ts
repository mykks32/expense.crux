import path from 'node:path';
import { defineConfig } from 'vite';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { config as loadDotenv } from 'dotenv';

// Local (non-Docker) dev and `vite build`/`vite preview` all read env/web.env from
// the repo root — same shared env/ directory convention as apps/server's
// `envFilePath`. Vite has no built-in option to point its own .env loading at a
// directory outside the app root, so this loads it into process.env manually;
// Vite then auto-exposes any VITE_-prefixed var already in process.env as
// import.meta.env. Docker builds skip this file entirely and pass VITE_API_URL
// as a build ARG instead (see docker/web.Dockerfile) — dotenv only fills in vars
// that aren't already set, so the two approaches don't conflict.
// quiet: true suppresses dotenv's own stdout banner (including a rotating "tip" line
// that advertises the maintainer's other products) — unrelated noise on every dev/build run.
loadDotenv({ path: path.resolve(import.meta.dirname, '../../env/web.env'), quiet: true });

export default defineConfig({
  server: {
    port: 3001,
  },
  preview: {
    port: 3001,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [tailwindcss(), tanstackStart(), viteReact()],
});
