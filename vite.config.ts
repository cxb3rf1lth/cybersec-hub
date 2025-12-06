import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, PluginOption } from "vite";
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";

const __dirname = typeof __dirname !== 'undefined' 
  ? __dirname 
  : dirname(fileURLToPath(import.meta.url))

const projectRoot = process.env.PROJECT_ROOT || process.cwd()

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    tailwindcss(),
    createIconImportProxy() as PluginOption,
    sparkPlugin() as PluginOption,
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    },
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
    preserveSymlinks: false,
    dedupe: ['react', 'react-dom', 'vite']
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
    ],
    exclude: ['@github/spark'],
    force: false,
    esbuildOptions: {
      target: 'esnext',
      platform: 'browser'
    }
  },
  server: {
    hmr: {
      overlay: true,
      clientPort: undefined
    },
    fs: {
      strict: false,
      allow: ['..', '../..']
    },
    watch: {
      usePolling: false,
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**']
    }
  },
  build: {
    sourcemap: true,
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/]
    }
  },
  cacheDir: 'node_modules/.vite',
  clearScreen: false,
  logLevel: 'info'
});
