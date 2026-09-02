import { defineConfig } from "vite";
import { resolve } from "node:path";

function localeDevPages() {
  return {
    name: "locale-dev-pages",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const path = req.url?.split("?")[0] ?? "";
        const match = path.match(/^\/(fr|de|it|ro)(?:\/(gallery\.html)?)?\/?$/);
        if (!match) return next();
        const query = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
        req.url = (match[2] ? "/gallery.html" : "/index.html") + query;
        next();
      });
    },
  };
}

export default defineConfig({
  base: "./",
  root: ".",
  publicDir: "public",
  plugins: [localeDevPages()],
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
