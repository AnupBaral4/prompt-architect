import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Multi-page setup on purpose: each route builds to its own real HTML file
// (dist/index.html, dist/contact.html) instead of one JS-only SPA shell.
// Keeps content readable by crawlers that don't execute JS (GPTBot, ClaudeBot,
// PerplexityBot) — relevant generally, and especially once the AI-visibility
// scanner tool itself lives on this domain.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        contact: resolve(__dirname, 'contact.html'),
      },
    },
  },
})
