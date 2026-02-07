import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANTE: Troque '/nome-do-repositorio/' pelo nome do seu repositório no GitHub.
  // Exemplo: se o repo for https://github.com/usuario/meu-app, use base: '/meu-app/'
  // Se for usar um domínio personalizado (ex: www.meuapp.com), remova essa linha ou use '/'
  base: './', 
  build: {
    outDir: 'dist',
  }
});