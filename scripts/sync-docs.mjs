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
console.log("Synced dist/ → docs/ (static site with local artwork).");
