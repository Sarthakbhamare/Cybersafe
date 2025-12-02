import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    open: false,
    proxy: {
      // Allow frontend to call /api without hardcoding backend origin
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        // If backend already prefixes /api, avoid duplicating
        // rewrite: (path) => path.replace(/^\/api/, '/api')
      },
    },
  },
}));
