import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const theoryDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../theory')

function serveTheory() {
  return {
    name: 'serve-theory',
    configureServer(server) {
      server.middlewares.use('/theory', (req, res, next) => {
        let rel = decodeURIComponent((req.url || '/').split('?')[0]).replace(/^\/+/, '') || 'index.html'
        if (rel.endsWith('/')) rel += 'index.html'
        const file = path.resolve(theoryDir, rel)
        if (!file.startsWith(theoryDir)) {
          res.statusCode = 403
          res.end('forbidden')
          return
        }
        fs.readFile(file, (err, data) => {
          if (err) return next()
          const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8' }
          res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream')
          res.end(data)
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    serveTheory(),
  ],
})
