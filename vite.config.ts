import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Usar './' torna os caminhos dos assets relativos. 
  // Isso resolve problemas de carregamento no GitHub Pages e localmente.
  base: './',
  build: {
    outDir: 'dist',
  }
});