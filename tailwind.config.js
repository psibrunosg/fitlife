/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",           // Pega arquivos na raiz (App.tsx, index.tsx)
    "./components/**/*.{js,ts,jsx,tsx}", // Pega arquivos na pasta components
    "./data/**/*.{js,ts,jsx,tsx}"    // Pega arquivos de dados se houver UI neles
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}