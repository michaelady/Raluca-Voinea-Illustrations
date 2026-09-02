import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { translations } from "../src/i18n.js";

const dist = "dist";
const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function read(rel) {
  const path = join(dist, rel);
  assert(existsSync(path), `missing ${path}`);
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

const frHome = read("fr/index.html");
const frGallery = read("fr/gallery.html");
const enHome = read("index.html");
const enGallery = read("gallery.html");
const sitemap = read("sitemap.xml");
const robots = read("robots.txt");

assert(frHome.includes('<html lang="fr"'), "French home html lang=fr");
assert(frHome.includes("<title>Raluca Voinea — Illustratrice et peintre à Neuchâtel"), "French home title");
assert(frHome.includes(translations.fr.heroTitle), "French home heroTitle in body");
assert(frHome.includes(translations.fr.heroAlt), "French home heroAlt");
assert(frHome.includes(translations.fr.aboutAlt), "French home aboutAlt");
assert(frHome.includes('href="https://www.ralucavoinea.ch/fr/"'), "French home canonical/og/hreflang URL");
assert(frHome.includes('<link rel="alternate" hreflang="en" href="https://www.ralucavoinea.ch/" />'), "French home hreflang en");
assert(frHome.includes('<link rel="alternate" hreflang="fr" href="https://www.ralucavoinea.ch/fr/" />'), "French home hreflang fr");
assert(frHome.includes('<link rel="alternate" hreflang="x-default" href="https://www.ralucavoinea.ch/" />'), "French home hreflang x-default");
assert(frHome.includes('content="fr_CH"'), "French home og:locale fr_CH");
assert(frHome.includes('"inLanguage": "fr"'), "French home JSON-LD inLanguage");
assert(frHome.includes(`"jobTitle": "${translations.fr.jobTitle}"`), "French home JSON-LD jobTitle");
assert(!frHome.includes('src="./artwork/'), "French home artwork paths are not relative");
assert(!frHome.includes('src="./assets/'), "French home JS is not relative ./assets");
assert(!frHome.includes('href="./assets/'), "French home CSS is not relative ./assets");
assert(frHome.includes('href="/fr/"') && frHome.includes('aria-current="page"'), "French home FR switcher is current");
assert(frHome.includes('data-contact-form'), "French home keeps the contact form");
assert(frHome.includes(translations.fr.contactTitle), "French home contact title");
assert(frHome.includes("Linktree"), "French home keeps the Linktree about link");
assert(frHome.includes('src="/artwork/'), "French home artwork uses root-absolute paths");

assert(frGallery.includes('<html lang="fr"'), "French gallery html lang=fr");
assert(frGallery.includes(translations.fr.galleryMetaTitle), "French gallery title");
assert(frGallery.includes(translations.fr.galleryTitle), "French gallery h1");
assert(frGallery.includes('href="https://www.ralucavoinea.ch/fr/gallery.html"'), "French gallery canonical");
assert(frGallery.includes('<link rel="alternate" hreflang="fr" href="https://www.ralucavoinea.ch/fr/gallery.html" />'), "French gallery hreflang");
assert(frGallery.includes('"inLanguage": "fr"'), "French gallery JSON-LD inLanguage");

assert(enHome.includes('<html lang="en"'), "English home stays lang=en");
assert(enHome.includes('<link rel="alternate" hreflang="fr" href="https://www.ralucavoinea.ch/fr/" />'), "English home hreflang fr");
assert(enGallery.includes('<link rel="alternate" hreflang="fr" href="https://www.ralucavoinea.ch/fr/gallery.html" />'), "English gallery hreflang fr");

for (const lang of ["de", "it", "ro"]) {
  assert(existsSync(join(dist, lang, "index.html")), `missing ${lang}/index.html`);
  assert(existsSync(join(dist, lang, "gallery.html")), `missing ${lang}/gallery.html`);
  const html = read(`${lang}/index.html`);
  assert(html.includes(`<html lang="${lang}"`), `${lang} home html lang`);
  assert(html.includes(translations[lang].heroTitle), `${lang} heroTitle`);
}

assert(sitemap.includes("https://www.ralucavoinea.ch/fr/"), "sitemap includes /fr/");
assert(sitemap.includes("https://www.ralucavoinea.ch/fr/gallery.html"), "sitemap includes /fr/gallery.html");
assert(robots.includes("Sitemap: https://www.ralucavoinea.ch/sitemap.xml"), "robots.txt sitemap pointer");

if (errors.length) {
  console.error(`i18n page checks failed:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log("i18n page checks passed (en + fr/de/it/ro home and gallery).");
