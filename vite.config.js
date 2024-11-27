import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['firebase/auth', 'firebase/app', 'firebase/firestore'] // Add the problematic dependencies here
  }
})
