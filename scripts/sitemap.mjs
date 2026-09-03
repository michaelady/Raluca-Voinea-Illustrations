import { LANGUAGES, pageUrl } from "../src/i18n.js";

const HOME_IMAGES = [
  ["/artwork/coming-back.jpg", "Coming Back"],
  ["/artwork/snow-poem.jpg", "Snow Poem"],
  ["/artwork/la-nuit.jpg", "La Nuit"],
];

const GALLERY_IMAGES = [
  ["/artwork/coming-back.jpg", "Coming Back"],
  ["/artwork/instagram/08-sweet-child.jpg", "Sweet Child"],
  ["/artwork/hilma-tribute.jpg", "Hilma Tribute"],
];

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

function sitemapUrl(lang, isGallery, lastmod) {
  const loc = pageUrl(lang, isGallery);
  const images = sitemapImages(isGallery ? GALLERY_IMAGES : HOME_IMAGES);
  const alternates = [...LANGUAGES, "x-default"]
    .map((code) => {
      const hrefLang = code === "x-default" ? "x-default" : code;
      const href = pageUrl(code === "x-default" ? "en" : code, isGallery);
      return `    <xhtml:link rel="alternate" hreflang="${hrefLang}" href="${href}" />`;
    })
    .join("\n");
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${isGallery ? "0.8" : lang === "en" ? "1.0" : "0.9"}</priority>
${alternates}
${images}
  </url>`;
}

export function sitemapPageUrls() {
  return LANGUAGES.flatMap((lang) => [pageUrl(lang), pageUrl(lang, true)]);
}

export function parseSitemapLocs(xml) {
  const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((match) => match[1]);
  return [...new Set(locs)];
}

export function buildSitemapXml(lastmod = new Date().toISOString().slice(0, 10)) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${LANGUAGES.map((lang) => sitemapUrl(lang, false, lastmod)).join("\n")}
${LANGUAGES.map((lang) => sitemapUrl(lang, true, lastmod)).join("\n")}
</urlset>
`;
}
