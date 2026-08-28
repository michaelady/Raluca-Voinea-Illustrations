# Raluca Voinea Illustration

Modern portfolio and presentation site for **Raluca Voinea Illustration** — painter and illustrator based in Neuchâtel, Switzerland.

## Content sources

All artwork and artist facts used on this site come from Raluca’s own public pages:

- Portfolio & pieces: [ralucavoinea.artweb.com](https://ralucavoinea.artweb.com/)
- About / Instagram: [About Me](https://ralucavoinea.artweb.com/about-me) · [@ralu.voinea.illustration](https://www.instagram.com/ralu.voinea.illustration/)
- Instagram artworks downloaded into `public/artwork/instagram/`
- Contact email from Instagram bio: `raluca_voinea@outlook.com`
- Services listed for the studio: [search.ch listing](https://search.ch/tel/neuchatel/rue-des-berthoudes-24/raluca-voinea-illustration)
- Store link: [Society6](https://society6.com/ralucavoinea)

Artwork files in `public/artwork/` are downloaded from her Artweb CDN and remain © Raluca Voinea.

## Search indexing

The published site allows Google and Bing to crawl it:

- `robots.txt` allows Googlebot, Bingbot, and related crawlers, and points to the sitemap
- `sitemap.xml` lists the home and gallery pages
- Each page has `index, follow` robots tags, a canonical URL, Open Graph tags, and JSON-LD
- After each GitHub Pages deploy, [IndexNow](https://www.indexnow.org/) notifies Bing that the URLs changed

After deploy, request indexing (this still has to be done in each dashboard):

1. [Google Search Console](https://search.google.com/search-console) — inspect `https://www.ralucavoinea.ch/` (lowercase `www`) and click **Request indexing**. Submit `https://www.ralucavoinea.ch/sitemap.xml` under **Sitemaps**.
2. [Bing Webmaster Tools](https://www.bing.com/webmasters) — URL Inspection → **Request indexing**. Bing’s “Discovered but not crawled” status is normal for a new site until that request succeeds and Bing fetches the page.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Static images

All portfolio pictures are downloaded from Raluca’s Artweb gallery and stored in the repo:

- Source copies: `public/artwork/*.jpg` (Vite copies these to `/artwork/` in `npm run dev` and `docs/`)
- Repo-root copies: `artwork/*.jpg` (same files, for GitHub Pages when it publishes the repository root)
- Published static site: `docs/` (HTML, CSS, JS, and the same local images)

The HTML references `./artwork/...`. That path works in Vite, in `/docs`, and at the repo root. Nothing loads artwork from external CDNs at runtime.

## Deploy with GitHub Pages

The live site at [ralucavoinea.ch](https://ralucavoinea.ch) must be able to fetch `/artwork/coming-back.jpg`. Prefer one of these setups:

1. **Deploy from a branch → folder `/docs`** (built site, recommended)
2. **Deploy from a branch → folder `/` (root)** — works because `artwork/` is also stored at the repo root
3. **GitHub Actions** — workflow `.github/workflows/deploy-pages.yml` builds and publishes `docs/`

Rebuild the static folder after design changes:

```bash
npm run build:docs
```

## Contact form

The homepage form sends each inquiry through [FormSubmit](https://formsubmit.co) to:

- `info@ralucavoinea.ch` via FormSubmit form ID `b989e55e267146abc54d97b5e2276618` (this ID replaces the address in the public HTML so scrapers cannot harvest it)
- `raluca_voinea@outlook.com`
- `ralucapopescudumitrescu@gmail.com`

The visitor’s address is set as Reply-To. The first submission to each inbox asks FormSubmit to confirm the address — open that email and click the activation link so later messages are delivered.

## Site pages

1. **Home (`index.html`)** — hero, curated selection (~half the works), collaborate, about, contact  
2. **Gallery (`gallery.html`)** — more works grouped by subject (Portraits, Nature, Atmosphere, Tributes, Books)  
