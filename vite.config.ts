import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'stats-receiver',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/stats' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
              fs.writeFileSync('stats.json', body);
              res.end('ok');
            });
          } else {
            next();
          }
        });
      }
    }
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Split heavy vendor libs so public shell stays lighter.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('firebase')) return 'vendor-firebase';
          if (id.includes('xlsx')) return 'vendor-xlsx';
          if (id.includes('jspdf')) return 'vendor-jspdf';
          if (id.includes('motion') || id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('react-dom') || id.includes('react-router') || id.includes('/react/')) {
            return 'vendor-react';
          }
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
})
