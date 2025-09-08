import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import crossOriginIsolation from "vite-plugin-cross-origin-isolation";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), crossOriginIsolation()],
  optimizeDeps: {
    exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
})
