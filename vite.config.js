import { defineConfig } from 'vite';

export default defineConfig({
  base: '/substance/', // GitHub Pages repository name
  root: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './index.html',
        demo: './demo.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    host: true
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  optimizeDeps: {
    include: ['three', 'cannon-es', 'chroma-js', 'simplex-noise', 'dat.gui']
  }
});