import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// BASE_PATH is set by the GitHub Pages workflow (e.g. "/shell-game/");
// local dev and preview serve from "/".
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
})
