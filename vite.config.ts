import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";

import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // DO NOT REMOVE
    createIconImportProxy() as PluginOption,
    sparkPlugin() as PluginOption,
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  build: {
    // Production optimizations
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for better caching
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        }
      }
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Source maps for debugging (disable in production for smaller bundle)
    sourcemap: false,
    // Asset inlining threshold (smaller assets inline as base64)
    assetsInlineLimit: 4096,
  },
  // Server configuration for development
  server: {
    port: 5000,
    strictPort: true,
    host: true,
  },
  // Preview server configuration
  preview: {
    port: 5000,
    strictPort: true,
    host: true,
  }
});
