import { cpSync, mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
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
  cpSync("CNAME", join(docs, "CNAME"));
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

console.log("Synced dist/ → docs/ and public artwork → repo root.");
