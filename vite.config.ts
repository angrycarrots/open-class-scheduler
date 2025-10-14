import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'OpenClassScheduler',
      fileName: format => format === 'es'
        ? 'open-class-scheduler.es'
        : 'open-class-scheduler.cjs'
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
      output: {
        exports: 'named',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-router-dom': 'ReactRouterDOM',
          '@tanstack/react-query': 'ReactQuery'
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
