import {
  LANGUAGES,
  OG_LOCALES,
  PREFIX_LOCALES,
  localeGalleryUrl,
  localeHomeUrl,
  translations,
} from "../src/i18n.js";

export { PREFIX_LOCALES };

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}

function replaceInnerByDataAttr(html, attrName, dict, asHtml) {
  const pattern = new RegExp(
    `<([a-zA-Z][\\w:-]*)([^>]*\\s${attrName}="([^"]+)"[^>]*)>([\\s\\S]*?)</\\1\\s*>`,
    "g"
  );
  return html.replace(pattern, (full, tag, attrs, key) => {
    const value = dict[key];
    if (value == null) return full;
    const body = asHtml ? value : escapeHtml(value);
    return `<${tag}${attrs}>${body}</${tag}>`;
  });
}

function setAttrFromData(html, dataAttr, targetAttr, dict) {
  return html.replace(/<[a-zA-Z][^>]*>/g, (tag) => {
    const dataMatch = tag.match(new RegExp(`${dataAttr}="([^"]+)"`));
    if (!dataMatch) return tag;
    const value = dict[dataMatch[1]];
    if (value == null) return tag;
    const encoded = escapeAttr(value);
    if (new RegExp(`\\s${targetAttr}="[^"]*"`).test(tag)) {
      return tag.replace(new RegExp(`\\s${targetAttr}="[^"]*"`), ` ${targetAttr}="${encoded}"`);
    }
    return tag.replace(/\s*(\/?)>$/, ` ${targetAttr}="${encoded}"$1>`);
  });
}

function setMeta(html, key, value, keyAttr = "name") {
  const encoded = escapeAttr(value);
  const namedFirst = new RegExp(
    `(<meta\\b[^>]*\\b${keyAttr}="${key}"[^>]*\\bcontent=")([^"]*)(")`,
    "i"
  );
  if (namedFirst.test(html)) return html.replace(namedFirst, `$1${encoded}$3`);
  const contentFirst = new RegExp(
    `(<meta\\b[^>]*\\bcontent=")([^"]*)("[^>]*\\b${keyAttr}="${key}")`,
    "i"
  );
  if (contentFirst.test(html)) return html.replace(contentFirst, `$1${encoded}$3`);
  return html;
}

function setInputValue(html, name, value) {
  const encoded = escapeAttr(value);
  const nameFirst = new RegExp(`(name="${name}"[^>]*\\bvalue=")([^"]*)(")`);
  if (nameFirst.test(html)) return html.replace(nameFirst, `$1${encoded}$3`);
  const valueFirst = new RegExp(`(value=")([^"]*)("[^>]*\\bname="${name}")`);
  if (valueFirst.test(html)) return html.replace(valueFirst, `$1${encoded}$3`);
  return html;
}

function ogLocaleBlock(lang) {
  const lines = [`<meta property="og:locale" content="${OG_LOCALES[lang]}" />`];
  for (const other of LANGUAGES) {
    if (other === lang) continue;
    lines.push(`    <meta property="og:locale:alternate" content="${OG_LOCALES[other]}" />`);
  }
  return lines.join("\n");
}

function patchJsonLd(html, lang, page, dict) {
  return html.replace(
    /<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/,
    (full, raw) => {
      let data;
      try {
        data = JSON.parse(raw);
      } catch (error) {
        throw new Error(`Invalid JSON-LD while localizing ${page}/${lang}: ${error.message}`);
      }

      if (page === "home" && Array.isArray(data["@graph"])) {
        for (const node of data["@graph"]) {
          const types = [].concat(node["@type"] || []);
          if (types.includes("WebSite")) {
            node.inLanguage = lang;
            node.url = localeHomeUrl(lang);
          }
          if (types.includes("Person") || types.includes("VisualArtist")) {
            node.jobTitle = dict.jobTitle;
          }
        }
      } else if (page === "gallery") {
        data.inLanguage = lang;
        data.name = dict.galleryMetaTitle;
        data.description = dict.galleryMetaDescription;
        data.url = localeGalleryUrl(lang);
        if (data.creator) data.creator.jobTitle = dict.jobTitle;
      }

      return `<script type="application/ld+json">\n      ${JSON.stringify(data, null, 2).replace(/\n/g, "\n      ")}\n    </script>`;
    }
  );
}

function toRootAbsoluteAssets(html) {
  return html
    .replaceAll('src="./artwork/', 'src="/artwork/')
    .replaceAll('href="./assets/', 'href="/assets/')
    .replaceAll('src="./assets/', 'src="/assets/')
    .replaceAll('href="./favicon', 'href="/favicon');
}

function setActiveLanguageLink(html, lang) {
  return html.replace(/<a\b([^>]*\bdata-lang="[^"]+"[^>]*)>/g, (full, attrs) => {
    const match = attrs.match(/\bdata-lang="([^"]+)"/);
    const active = match?.[1] === lang;
    let next = attrs.replace(/\saria-current="page"/g, "").replace(/\saria-pressed="(?:true|false)"/g, "");
    if (active) next += ' aria-current="page"';
    return `<a${next}>`;
  });
}

export function localizeHtml(html, lang, page) {
  const dict = translations[lang];
  if (!dict) throw new Error(`Missing translations for ${lang}`);

  const isGallery = page === "gallery";
  const title = isGallery ? dict.galleryMetaTitle : dict.metaTitle;
  const description = isGallery ? dict.galleryMetaDescription : dict.metaDescription;
  const socialDescription = isGallery ? dict.galleryMetaDescription : dict.ogDescription || dict.metaDescription;
  const canonical = isGallery ? localeGalleryUrl(lang) : localeHomeUrl(lang);

  let next = html.replace(/(<html\b[^>]*\blang=")[^"]*(")/, `$1${lang}$2`);
  next = replaceInnerByDataAttr(next, "data-i18n-html", dict, true);
  next = replaceInnerByDataAttr(next, "data-i18n", dict, false);
  next = setAttrFromData(next, "data-i18n-placeholder", "placeholder", dict);
  next = setAttrFromData(next, "data-i18n-aria", "aria-label", dict);
  next = setAttrFromData(next, "data-i18n-alt", "alt", dict);
  next = next.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  next = setMeta(next, "description", description);
  next = setMeta(next, "og:title", title, "property");
  next = setMeta(next, "og:description", socialDescription, "property");
  next = setMeta(next, "og:url", canonical, "property");
  next = setMeta(next, "og:image:alt", dict.heroAlt, "property");
  next = setMeta(next, "twitter:title", title);
  next = setMeta(next, "twitter:description", description);
  next = next.replace(
    /<link rel="canonical" href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${canonical}" />`
  );
  next = next.replace(
    /<meta property="og:locale"[^>]*>(?:\s*<meta property="og:locale:alternate"[^>]*>)*/,
    ogLocaleBlock(lang)
  );
  next = patchJsonLd(next, lang, page, dict);
  next = setInputValue(next, "_subject", dict.formSubject);
  next = setInputValue(next, "_next", `${localeHomeUrl(lang)}#contact`);
  next = setInputValue(next, "language", dict.languageName);
  next = setActiveLanguageLink(next, lang);
  next = toRootAbsoluteAssets(next);
  return next;
}

export function matchLocalePage(url) {
  const path = String(url || "/").split("?")[0].split("#")[0];
  const gallery = path.match(/^\/(fr|de|it|ro)\/gallery(?:\.html)?\/?$/);
  if (gallery) return { lang: gallery[1], page: "gallery" };
  const home = path.match(/^\/(fr|de|it|ro)(?:\/(?:index\.html)?)?$/);
  if (home) return { lang: home[1], page: "home" };
  return null;
}
