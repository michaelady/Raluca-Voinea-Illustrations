import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  LANGUAGES,
  OG_LOCALES,
  hreflangSnippet,
  pageUrl,
  translations,
} from "../src/i18n.js";

const dist = "dist";
const today = new Date().toISOString().slice(0, 10);
const localizedLangs = LANGUAGES.filter((lang) => lang !== "en");

function escapeAttr(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
}

function setMetaContent(html, key, value) {
  const encoded = escapeAttr(value);
  const named = new RegExp(
    `(<meta[^>]*(?:name|property)="${key}"[^>]*content=")([^"]*)(")`,
    "i"
  );
  if (named.test(html)) return html.replace(named, `$1${encoded}$3`);
  const reversed = new RegExp(
    `(<meta[^>]*content=")([^"]*)("[^>]*(?:name|property)="${key}")`,
    "i"
  );
  return html.replace(reversed, `$1${encoded}$3`);
}

function applyCopy(html, dict) {
  html = html.replace(
    /(<([a-zA-Z0-9]+)[^>]*\sdata-i18n-html="([^"]+)"[^>]*>)[\s\S]*?(<\/\2>)/g,
    (full, open, _tag, key, close) => (dict[key] != null ? `${open}${dict[key]}${close}` : full)
  );
  html = html.replace(
    /(\sdata-i18n="([^"]+)"[^>]*>)([^<]*)/g,
    (full, open, key) => (dict[key] != null ? `${open}${dict[key]}` : full)
  );
  html = html.replace(
    /data-i18n-placeholder="([^"]+)"([^>]*?)placeholder="[^"]*"/g,
    (full, key, mid) =>
      dict[key] != null ? `data-i18n-placeholder="${key}"${mid}placeholder="${escapeAttr(dict[key])}"` : full
  );
  html = html.replace(
    /data-i18n-aria="([^"]+)"([^>]*?)aria-label="[^"]*"/g,
    (full, key, mid) =>
      dict[key] != null ? `data-i18n-aria="${key}"${mid}aria-label="${escapeAttr(dict[key])}"` : full
  );
  html = html.replace(
    /data-i18n-alt="([^"]+)"([^>]*?)alt="[^"]*"/g,
    (full, key, mid) =>
      dict[key] != null ? `data-i18n-alt="${key}"${mid}alt="${escapeAttr(dict[key])}"` : full
  );
  return html;
}

function rewriteAssets(html) {
  return html.replace(/(src|href)="\.\/(assets\/|artwork\/|favicon\.svg)/g, `$1="../$2`);
}

function localize(html, lang, isGallery) {
  const dict = translations[lang];
  const url = pageUrl(lang, isGallery);
  const title = isGallery ? dict.galleryMetaTitle : dict.metaTitle;
  const description = isGallery ? dict.galleryMetaDescription : dict.metaDescription;
  const social = isGallery ? dict.galleryMetaDescription : dict.ogDescription || dict.metaDescription;

  html = applyCopy(html, dict);
  html = html.replace(/<html lang="[^"]*"/, `<html lang="${lang}" data-lang="${lang}"`);
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  html = setMetaContent(html, "description", description);
  html = setMetaContent(html, "og:title", title);
  html = setMetaContent(html, "og:description", social);
  html = setMetaContent(html, "og:locale", OG_LOCALES[lang]);
  html = setMetaContent(html, "og:url", url);
  html = setMetaContent(html, "twitter:title", title);
  html = setMetaContent(html, "twitter:description", description);
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${url}" />`);
  html = html.replace(
    /name="_next" value="[^"]*"/,
    `name="_next" value="${pageUrl(lang)}#contact"`
  );
  html = html.replace(/name="language" value="[^"]*"/, `name="language" value="${dict.languageName}"`);
  html = html.replace(/name="_subject" value="[^"]*"/, `name="_subject" value="${escapeAttr(dict.formSubject)}"`);

  if (isGallery) {
    html = html.replace(
      /("url":\s*")https:\/\/www\.ralucavoinea\.ch\/gallery\.html(")/,
      `$1${url}$2`
    );
    html = html.replace(
      /("name":\s*")Illustration Gallery — Raluca Voinea, Neuchâtel(")/,
      `$1${title.replaceAll('"', '\\"')}$2`
    );
  }

  html = html.replace(/\saria-current="true"/g, "");
  html = html.replace(
    new RegExp(`(<a [^>]*data-lang="${lang}"[^>]*)>`),
    `$1 aria-current="true">`
  );

  html = rewriteAssets(html);
  return html;
}

function addHreflang(html, isGallery) {
  if (html.includes('hreflang="x-default"')) return html;
  const snippet = `    ${hreflangSnippet(isGallery)}`;
  return html.replace(/<link rel="canonical" href="[^"]*"\s*\/>/, (match) => `${match}\n${snippet}`);
}

function sitemapImages(entries) {
  return entries
    .map(
      ([src, title]) => `    <image:image>
      <image:loc>https://www.ralucavoinea.ch${src}</image:loc>
      <image:title>${title}</image:title>
    </image:image>`
    )
    .join("\n");
}

function sitemapUrl(lang, isGallery) {
  const loc = pageUrl(lang, isGallery);
  const images = isGallery
    ? sitemapImages([
        ["/artwork/coming-back.jpg", "Coming Back"],
        ["/artwork/instagram/08-sweet-child.jpg", "Sweet Child"],
        ["/artwork/hilma-tribute.jpg", "Hilma Tribute"],
      ])
    : sitemapImages([
        ["/artwork/coming-back.jpg", "Coming Back"],
        ["/artwork/snow-poem.jpg", "Snow Poem"],
        ["/artwork/la-nuit.jpg", "La Nuit"],
      ]);
  const alternates = [...LANGUAGES, "x-default"]
    .map((code) => {
      const hrefLang = code === "x-default" ? "x-default" : code;
      const href = pageUrl(code === "x-default" ? "en" : code, isGallery);
      return `    <xhtml:link rel="alternate" hreflang="${hrefLang}" href="${href}" />`;
    })
    .join("\n");
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${isGallery ? "0.8" : lang === "en" ? "1.0" : "0.9"}</priority>
${alternates}
${images}
  </url>`;
}

const home = addHreflang(readFileSync(join(dist, "index.html"), "utf8"), false);
const gallery = addHreflang(readFileSync(join(dist, "gallery.html"), "utf8"), true);
writeFileSync(join(dist, "index.html"), home);
writeFileSync(join(dist, "gallery.html"), gallery);

for (const lang of localizedLangs) {
  mkdirSync(join(dist, lang), { recursive: true });
  writeFileSync(join(dist, lang, "index.html"), localize(home, lang, false));
  writeFileSync(join(dist, lang, "gallery.html"), localize(gallery, lang, true));
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${LANGUAGES.map((lang) => sitemapUrl(lang, false)).join("\n")}
${LANGUAGES.map((lang) => sitemapUrl(lang, true)).join("\n")}
</urlset>
`;
writeFileSync(join(dist, "sitemap.xml"), sitemap);

console.log(
  `Wrote localized pages for ${localizedLangs.join(", ")} and a ${LANGUAGES.length * 2}-URL sitemap.`
);
