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
    sourcemap: false
  }
})