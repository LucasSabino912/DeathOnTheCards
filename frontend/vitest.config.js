import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8', 
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '*.config.js',
        '**/*.config.js',
        'postcss.config.js',
        'tailwind.config.js',
        'src/main.jsx', // Optional to exclude
        'src/App.jsx', // Optional to exclude
      ],
      // Optional: set thresholds
      // statements: 70,
      // branches: 70,
      // functions: 70,
      // lines: 70,
    }
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})