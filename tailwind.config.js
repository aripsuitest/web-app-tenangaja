// tailwind.config.js
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}', // Sesuaikan dengan App Router
    './src/components/**/*.{js,ts,jsx,tsx}', // Komponen (jika ada)
    './pages/**/*.{js,ts,jsx,tsx}', // Jika ada file di pages/
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
