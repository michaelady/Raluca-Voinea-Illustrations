import { defineConfig } from "vite";

// Project Pages URL: https://michaelady.github.io/Raluca-Voinea-Illustrations/
// Root-absolute paths like /artwork/... break there — base + relative public assets fix it.
export default defineConfig({
  base: "/Raluca-Voinea-Illustrations/",
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
