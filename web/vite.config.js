import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  base: command === 'serve' ? '/' : '/book_community_arabic/',
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: false,
  },
}))
