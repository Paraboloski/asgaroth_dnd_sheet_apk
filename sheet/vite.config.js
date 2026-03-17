import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', 
      manifest: {
        name: 'Asgaroth D&D Sheet',
        short_name: 'Scheda D&D',
        description: '',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone', 
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
  base: './', 
})