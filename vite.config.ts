import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      // Node.js memory allocation is handled through CLI flags
      // Add --max-old-space-size=4096 to your start script
      // Target modern browsers
      target: 'es2020',
      // Enable source maps
      sourcemap: true,
      // Error handling
      logOverride: {
        'this-is-undefined-in-esm': 'silent'
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5195,
    host: '0.0.0.0',
    open: true,
    hmr: {
      clientPort: 5196
    }
  },
  envPrefix: 'VITE_',
  preview: {
    port: 4173,
    host: '0.0.0.0',
    open: true,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    target: 'esnext',
    chunkSizeWarningLimit: 2000,
    modulePreload: {
      polyfill: true
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@headlessui/react', 'lucide-react'],
          charts: ['recharts'],
          utils: ['date-fns', 'zustand']
        }
      }
    }
  }
});
