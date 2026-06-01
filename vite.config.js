import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
      alias: {
        // Definimos que '@' apunta dinámicamente a la carpeta 'src'
        '@': path.resolve(__dirname, './src'),
      },
    },
})
