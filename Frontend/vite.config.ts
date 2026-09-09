import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const configDir = path.dirname(fileURLToPath(import.meta.url))

// Keep the browser talking to a relative `/api` URL by default. In
// development Vite forwards it to the loopback API; in production a reverse
// proxy or VITE_API_URL can provide the same-origin API boundary.
export default defineConfig(({ mode }) => {
  // Only load browser-safe VITE_* values into the config. Server credentials
  // such as HOST_API_TOKEN are intentionally never read by the web toolchain.
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:4100'
  const base = env.VITE_BASE_PATH || '/'
  const host = env.VITE_DEV_HOST || '127.0.0.1'
  const port = Number(env.VITE_DEV_PORT || '5173')

  return {
    base: base.endsWith('/') ? base : `${base}/`,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(configDir, './src'),
      },
    },
    server: {
      host,
      port,
      strictPort: true,
      proxy: {
        '/api': { target: apiTarget, changeOrigin: false },
        '/auth': { target: apiTarget, changeOrigin: false },
        '/health': { target: apiTarget, changeOrigin: false },
      },
    },
    preview: {
      host,
      port,
      strictPort: true,
    },
  }
})
