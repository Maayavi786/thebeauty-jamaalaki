import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current directory
  const env = loadEnv(mode, process.cwd())
  const isProd = mode === 'production'

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@shared': path.resolve(__dirname, '../shared')
      }
    },
    // server: {
    //   proxy: {
    //     '/api': {
    //       target: process.env.VITE_API_BASE_URL || 'http://localhost:5000',
    //       changeOrigin: true,
    //     },
    //   },
    // },
    build: {
      chunkSizeWarningLimit: 1200,
      minify: isProd ? 'terser' : 'esbuild',
      terserOptions: isProd ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
        }
      } : undefined,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'routing-vendor': ['wouter'],
            'ui-vendor': ['@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion'],
            'form-vendor': ['react-hook-form', '@hookform/resolvers'],
            'data-vendor': ['@tanstack/react-query']
          }
        }
      },
      sourcemap: !isProd,
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'wouter'],
    },
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' }
    }
  }
})
