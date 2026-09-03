import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parseSitemapLocs, sitemapPageUrls } from "./sitemap.mjs";

const HOST = "www.ralucavoinea.ch";
const LIVE_SITEMAP = `https://${HOST}/sitemap.xml`;
const ENDPOINTS = [
  "https://api.indexnow.org/indexnow",
  "https://www.bing.com/indexnow",
];
const KEY_NAME = /^[a-zA-Z0-9-]{8,128}\.txt$/;

function localKeyFiles() {
  const dirs = ["public", "docs"].filter((dir) => existsSync(dir));
  const keys = [];
  for (const dir of dirs) {
    for (const name of readdirSync(dir)) {
      if (!KEY_NAME.test(name)) continue;
      const key = name.slice(0, -4);
      const body = readFileSync(join(dir, name), "utf8").trim();
      if (body === key) keys.push(key);
    }
  }
  return [...new Set(keys)];
}

async function waitForLiveKey() {
  const keys = localKeyFiles();
  if (!keys.length) throw new Error("No IndexNow key files found in public/ or docs/");

  let lastError = "no attempts";
  for (let attempt = 1; attempt <= 8; attempt += 1) {
    for (const key of keys) {
      const keyLocation = `https://${HOST}/${key}.txt`;
      try {
        const response = await fetch(keyLocation, { redirect: "follow" });
        const body = (await response.text()).trim();
        if (response.ok && body === key) {
          console.log(`Using live IndexNow key file ${keyLocation} (HTTP ${response.status})`);
          return { key, keyLocation };
        }
        lastError = `${keyLocation} → HTTP ${response.status}`;
      } catch (error) {
        lastError = `${keyLocation} → ${error.message}`;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 4000));
  }
  throw new Error(`IndexNow key file is not live yet (${lastError})`);
}

async function loadUrlList() {
  try {
    const response = await fetch(LIVE_SITEMAP, { redirect: "follow" });
    const xml = await response.text();
    const urls = parseSitemapLocs(xml).filter((url) => url.startsWith(`https://${HOST}`));
    if (response.ok && urls.length) {
      console.log(`Loaded ${urls.length} URLs from live sitemap (HTTP ${response.status} ${response.headers.get("content-type")})`);
      return urls;
    }
    console.warn(`Live sitemap not usable (HTTP ${response.status}); falling back to repo URLs.`);
  } catch (error) {
    console.warn(`Live sitemap fetch failed (${error.message}); falling back to repo URLs.`);
  }

  for (const file of ["docs/sitemap.xml", "public/sitemap.xml"]) {
    if (!existsSync(file)) continue;
    const urls = parseSitemapLocs(readFileSync(file, "utf8")).filter((url) =>
      url.startsWith(`https://${HOST}`)
    );
    if (urls.length) {
      console.log(`Loaded ${urls.length} URLs from ${file}`);
      return urls;
    }
  }
  return sitemapPageUrls();
}

async function postIndexNow(endpoint, payload) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });
  const body = await response.text();
  return { endpoint, status: response.status, body };
}

const { key, keyLocation } = await waitForLiveKey();
const urlList = await loadUrlList();
const payload = { host: HOST, key, keyLocation, urlList };

console.log(`Submitting ${urlList.length} URLs for host ${HOST}:`);
for (const url of urlList) console.log(`  ${url}`);

const results = [];
for (const endpoint of ENDPOINTS) {
  try {
    const result = await postIndexNow(endpoint, payload);
    results.push(result);
    const preview = result.body.trim() ? result.body.trim() : "(empty body)";
    console.log(`${endpoint} → HTTP ${result.status}`);
    console.log(preview);
  } catch (error) {
    results.push({ endpoint, status: 0, body: error.message });
    console.error(`${endpoint} → request failed: ${error.message}`);
  }
}

const accepted = results.filter((result) => [200, 202].includes(result.status));
if (!accepted.length) {
  const summary = results.map((result) => `${result.endpoint}: ${result.status} ${result.body}`).join(" | ");
  throw new Error(`IndexNow failed on all endpoints. ${summary}`);
}

console.log(
  `IndexNow accepted ${urlList.length} URLs via ${accepted.map((result) => `${result.endpoint} (${result.status})`).join(" and ")}.`
);
