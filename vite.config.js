import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: "/Web-Based-Barangay-Management-System-for-San-Agustin-San-Rafael-Bulacan/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
Sent
Compose
Write to Nyx Shade
