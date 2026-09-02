const KEY = "bddfa6db908c47519623860a975b344d";
const HOST = "www.ralucavoinea.ch";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const URLS = [
  `https://${HOST}/`,
  `https://${HOST}/gallery.html`,
  `https://${HOST}/fr/`,
  `https://${HOST}/fr/gallery.html`,
  `https://${HOST}/de/`,
  `https://${HOST}/de/gallery.html`,
  `https://${HOST}/it/`,
  `https://${HOST}/it/gallery.html`,
  `https://${HOST}/ro/`,
  `https://${HOST}/ro/gallery.html`,
];
const ENDPOINT = "https://api.indexnow.org/indexnow";

async function waitForKeyFile() {
  for (let attempt = 1; attempt <= 8; attempt += 1) {
    const response = await fetch(KEY_LOCATION, { redirect: "follow" });
    const body = (await response.text()).trim();
    if (response.ok && body === KEY) return;
    await new Promise((resolve) => setTimeout(resolve, attempt * 4000));
  }
  throw new Error(`IndexNow key file is not live yet: ${KEY_LOCATION}`);
}

const payload = {
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: URLS,
};

await waitForKeyFile();

const response = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(payload),
});

const text = await response.text();
if (![200, 202].includes(response.status)) {
  throw new Error(`IndexNow failed (${response.status}): ${text}`);
}

console.log(`IndexNow accepted ${URLS.length} URLs (${response.status}).`);
