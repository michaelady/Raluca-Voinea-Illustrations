import { defineConfig } from "vite";
import { resolve } from "node:path";

// Relative base so built files work on GitHub Pages project sites
// (e.g. /Raluca-Voinea-Illustrations/) without hardcoding the repo name.
export default defineConfig({
  base: "./",
  root: ".",
  publicDir: "public",
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
