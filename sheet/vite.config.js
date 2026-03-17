import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  // Questa riga controlla se stiamo compilando su GitHub
  const isGithub = process.env.GITHUB_ACTIONS === 'true';

  return {
    // SE siamo su GitHub usa il percorso della sottocartella
    // ALTRIMENTI usa il percorso relativo './' (che serve a Electron per non essere bianco)
    base: isGithub ? '/asgaroth_dnd_sheet_apk/' : './',
    
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Asgaroth D&D Sheet',
          short_name: 'Scheda D&D',
          display: 'standalone',
          start_url: './index.html',
          icons: [
            {
              src: 'icon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true
    }
  }
})