import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config for the React frontend.
// The dev server runs on port 5173. Any request starting with /api is
// forwarded ("proxied") to the NestJS backend on port 3000, which means
// the frontend can call the API without dealing with CORS.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
