import { defineConfig } from "vite";
import { resolve } from "node:path";
import { i18nPagesPlugin } from "./scripts/i18n-pages-plugin.js";

// Root-absolute base so locale pages at /fr/ (etc.) can load /assets and /artwork
// on the custom domain (www.ralucavoinea.ch / GitHub Pages).
export default defineConfig({
  base: "/",
  root: ".",
  publicDir: "public",
  plugins: [i18nPagesPlugin()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        gallery: resolve(__dirname, "gallery.html"),
      },
    },
  },
  server: {
    host: true,
    port: 5173,
  },
});
