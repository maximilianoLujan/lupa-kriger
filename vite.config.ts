import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    // Un jsdom por worker en vez de uno por archivo: mucho más rápido en Windows.
    pool: 'vmThreads',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // Los tests siempre corren contra el mock, sin importar el .env local del desarrollador.
    env: { VITE_DATA_SOURCE: 'mock', VITE_API_URL: '' },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/test/**', 'src/**/*.test.{ts,tsx}'],
    },
  },
})
