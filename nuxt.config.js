import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@pinia/nuxt"],
  runtimeConfig: {
    public: {
      apiHost: process.env.NUXT_PUBLIC_API_HOST || "http://localhost:5000",
      apiPrefix: "/api/v1",
    },
  },
  vite: { plugins: [tailwindcss()] },
  css: ["~/assets/css/main.css"],
});
