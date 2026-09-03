import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const dist = "dist";
const docs = "docs";

if (!existsSync(dist)) {
  console.error("Missing dist/. Run `npm run build` first.");
  process.exit(1);
}

rmSync(docs, { recursive: true, force: true });
mkdirSync(docs, { recursive: true });
cpSync(dist, docs, { recursive: true });
writeFileSync(join(docs, ".nojekyll"), "");

if (existsSync("CNAME")) {
  const cname = `${readFileSync("CNAME", "utf8").trim()}\n`;
  writeFileSync(join(docs, "CNAME"), cname);
}

// Vite serves files from public/ at the site root, so HTML uses ./artwork/...
// GitHub Pages may publish the repo root (not /docs). Keep a root copy so
// those deploys can resolve the same relative image paths.
if (existsSync("public/artwork")) {
  rmSync("artwork", { recursive: true, force: true });
  cpSync("public/artwork", "artwork", { recursive: true });
}
if (existsSync("public/favicon.svg")) {
  cpSync("public/favicon.svg", "favicon.svg");
}

// Keep IndexNow key files at the repo root as well, in case Pages publishes `/`.
if (existsSync("public")) {
  for (const name of readdirSync("public")) {
    if (/^[a-zA-Z0-9-]{8,128}\.txt$/.test(name)) {
      cpSync(join("public", name), name);
    }
  }
}

// Search engines treat a stale lastmod as a signal the site is unmaintained.
// Every deploy changes the published files, so stamp the deploy date.
const sitemapPath = join(docs, "sitemap.xml");
if (existsSync(sitemapPath)) {
  const today = new Date().toISOString().slice(0, 10);
  const stamped = readFileSync(sitemapPath, "utf8").replace(
    /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g,
    `<lastmod>${today}</lastmod>`
  );
  writeFileSync(sitemapPath, stamped);
}

console.log("Synced dist/ → docs/ and public artwork → repo root.");
