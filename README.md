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

- Source copies: `public/artwork/*.jpg`
- Published static site: `docs/` (HTML, CSS, JS, and the same local images)

Nothing loads artwork from external CDNs at runtime.

## Deploy with GitHub Pages (static `/docs`)

Easiest path from the GitHub website UI:

1. Merge this branch into `main`.
2. **Settings → Pages → Build and deployment**
3. **Source:** Deploy from a branch
4. **Branch:** `main` → folder **`/docs`** → Save
5. Open: `https://michaelady.github.io/Raluca-Voinea-Illustrations/`

Rebuild the static folder after design changes:

```bash
npm run build:docs
```

### Optional: GitHub Actions

There is also a workflow that builds `dist` and deploys via Actions. Prefer `/docs` if you want a fully static publish from the branch.

## Site sections

1. **Hero** — brand-first introduction with collaboration CTA  
2. **Selected works** — filterable gallery of her digital pieces  
3. **Collaborate** — services and availability for new projects  
4. **About** — short bio and links  
5. **Contact** — collaboration form with Instagram / Artweb pathways  
