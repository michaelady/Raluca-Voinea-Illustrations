import { defineConfig } from "vite";

// Relative base so built files work on GitHub Pages project sites
// (e.g. /Raluca-Voinea-Illustrations/) without hardcoding the repo name.
export default defineConfig({
  base: "./",
  root: ".",
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    host: true,
    port: 5173,
  },
});
