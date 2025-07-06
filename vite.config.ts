import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js'
  },
  json: {
    stringify: true
  },
  build: {
    // Optimisation du build
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        // Code splitting optimisé
        manualChunks: {
          vendor: ['react', 'react-dom'],
          data: ['./src/data/listeDons.json', './src/data/listeSorts.json', './src/data/classesNWN.json']
        }
      }
    },
    // Compression et optimisation
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    reportCompressedSize: false
  },
  server: {
    // Optimisation du serveur de dev
    hmr: true,
    port: 5173
  },
  // Optimisation des dépendances
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: []
  },
  // Résolution des modules optimisée
  resolve: {
    alias: {
      '@': './src',
      '@shared': './src/shared',
      '@features': './src/features',
      '@app': './src/app',
      '@data': './src/data',
      '@components': './src/components',
      '@hooks': './src/hooks',
      '@utils': './src/utils',
      '@models': './src/models'
    }
  }
})
