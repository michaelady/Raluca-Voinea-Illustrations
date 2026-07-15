# Raluca Voinea Illustration

Modern portfolio and presentation site for **Raluca Voinea Illustration** — painter and illustrator based in Neuchâtel, Switzerland.

## Content sources

All artwork and artist facts used on this site come from Raluca’s own public pages:

- Portfolio & pieces: [ralucavoinea.artweb.com](https://ralucavoinea.artweb.com/)
- About / Instagram: [About Me](https://ralucavoinea.artweb.com/about-me) · [@ralu.voinea](https://www.instagram.com/ralu.voinea/)
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

## Deploy with GitHub Pages

Images break if the site is published without a build, or if asset URLs ignore the repo subpath (`/Raluca-Voinea-Illustrations/`). This project is set up for Actions-based Pages.

1. Merge this branch into `main`.
2. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main` (or run the **Deploy to GitHub Pages** workflow manually under the **Actions** tab).
4. Open: `https://michaelady.github.io/Raluca-Voinea-Illustrations/`

Do **not** publish the repo root as a plain branch site — Vite needs `npm run build`, and the workflow uploads the `dist` folder.

## Site sections

1. **Hero** — brand-first introduction with collaboration CTA  
2. **Selected works** — filterable gallery of her digital pieces  
3. **Collaborate** — services and availability for new projects  
4. **About** — short bio and links  
5. **Contact** — collaboration form with Instagram / Artweb pathways  
