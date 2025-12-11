/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // 1. HTML dosyan
    "./index.html",

    // 2. Ana dizindeki kritik dosyaların (İsim isim yazıyoruz)
    "./App.tsx",
    "./index.tsx", 

    // 3. İçinde kod olan klasörlerin (Sadece bunlara bak diyoruz)
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
    
    // Eğer varsa bu klasörleri de ekle (yoksa silebilirsin):
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./data/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
