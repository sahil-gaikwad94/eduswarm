import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server accepts any preview host and proxies API traffic to the local
// Express server, so browser code uses relative URLs (set VITE_API_URL='' to
// enable same-origin mode).
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
      '/auth': { target: 'http://localhost:4000', changeOrigin: true },
      '/health': { target: 'http://localhost:4000', changeOrigin: true },
      '/ready': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
});
