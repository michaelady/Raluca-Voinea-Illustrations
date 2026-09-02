import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { PREFIX_LOCALES, localizeHtml, matchLocalePage } from "./localize-html.mjs";

export function i18nPagesPlugin() {
  let outDir = "dist";
  let root = process.cwd();

  return {
    name: "i18n-pages",
    configResolved(config) {
      root = config.root;
      outDir = config.build.outDir;
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const matched = matchLocalePage(req.url || "/");
        if (!matched) return next();

        const sourceName = matched.page === "gallery" ? "gallery.html" : "index.html";
        const sourcePath = resolve(root, sourceName);
        if (!existsSync(sourcePath)) return next();

        try {
          const source = readFileSync(sourcePath, "utf8");
          const localized = localizeHtml(source, matched.lang, matched.page);
          const html = await server.transformIndexHtml(req.url, localized);
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(html);
        } catch (error) {
          next(error);
        }
      });
    },
    closeBundle() {
      const dist = resolve(root, outDir);
      const indexPath = join(dist, "index.html");
      const galleryPath = join(dist, "gallery.html");
      if (!existsSync(indexPath) || !existsSync(galleryPath)) return;

      const indexHtml = readFileSync(indexPath, "utf8");
      const galleryHtml = readFileSync(galleryPath, "utf8");

      for (const lang of PREFIX_LOCALES) {
        const dir = join(dist, lang);
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, "index.html"), localizeHtml(indexHtml, lang, "home"));
        writeFileSync(join(dir, "gallery.html"), localizeHtml(galleryHtml, lang, "gallery"));
      }
    },
  };
}
