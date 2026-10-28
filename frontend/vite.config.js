import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base44 sandbox only: the dev server is reached through a per-session proxy host
// (e.g. 3000-<suffix>.<public host suffix>), which Vite's host check would reject.
// Enabled only when BASE44_PREVIEW_MODE is exactly "1"; unset keeps normal behaviour.
const previewAllowedHosts = []
if (process.env.BASE44_PREVIEW_MODE === '1') {
  // Wildcard for the documented "<port>-<sandbox id>.<sandbox host domain>" form.
  if (process.env.BASE44_SANDBOX_HOST_DOMAIN) {
    previewAllowedHosts.push(`.${process.env.BASE44_SANDBOX_HOST_DOMAIN}`)
  }
  // The preview proxy actually reaches us as "<port>-<public host suffix>", which a
  // leading-dot wildcard cannot match, so allow that exact host.
  if (process.env.BASE44_PUBLIC_HOST_SUFFIX) {
    previewAllowedHosts.push(`3000-${process.env.BASE44_PUBLIC_HOST_SUFFIX}`)
  }
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    ...(previewAllowedHosts.length ? { allowedHosts: previewAllowedHosts } : {}),
    proxy: {
      '/api': {
        // Defaults to a locally running backend; the Base44 sandbox overrides this
        // with the compose service address (http://api:8000).
        target: process.env.API_PROXY_TARGET || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
