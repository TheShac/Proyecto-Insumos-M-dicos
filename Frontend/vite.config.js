import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api": {
        // Dentro de Docker el gateway se resuelve por nombre de servicio;
        // en dev local (fuera de Docker) exportar API_PROXY_TARGET=http://localhost:80
        target: process.env.API_PROXY_TARGET || "http://api-gateway",
        changeOrigin: true,
      },
    },
  },
});
