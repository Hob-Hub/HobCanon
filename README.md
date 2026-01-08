# HobCanon SPA

Single-page app built with SvelteKit, Tailwind CSS, and TypeScript to explore the local `AUTHORS_DB.json` and `BOOKS_DB.json` datasets. Everything runs purely on static files; no backend or remote fetches.

## Quick start

```sh
npm install
npm run dev
```

Then open the printed local URL. The app ships with i18n (default English, toggle to Spanish) and responsive UI.

## Scripts

- `npm run dev` – start the dev server.
- `npm run build` – static build (adapter-static) honoring the configured base path.
- `npm run preview` – preview the production build locally.
- `npm run check` – typecheck with `svelte-check`.
- `npm run lint` – ESLint for `.svelte` and `.ts`.

## Base path & GitHub Pages

The site is configured for GitHub Pages with a non-root base path. Set `BASE_PATH` to match your repo name (e.g. `/HobCanon`) before building:

```sh
npx dotenv -e .env.example -- npm run build
# or set BASE_PATH directly, e.g.:
# $env:BASE_PATH="/HobCanon" ; npm run build   # PowerShell
# BASE_PATH=/HobCanon npm run build            # bash
npm run build
```

`svelte.config.js` and `vite.config.ts` both consume `BASE_PATH`; defaults to `/HobCanon` in production and `/` in dev. Output is ready to publish from `build/` to `gh-pages`.

## Data model

Local JSON copies live in `src/lib/data/`:
- `authors.json`
- `books.json`

Reference schemas are kept alongside the data at `src/lib/data/schemas/` (`authors.schema.json`, `books.schema.json`) for optional validation.

To validate the datasets against the schemas:

```sh
npm run validate
```

On load we enrich with slugs, author cross-links, basic indices, and stats (top tags/genres/countries, totals). Filters run entirely client-side.

## i18n

Simple dictionary-based i18n under `src/lib/i18n/`. UI strings are bilingual; content falls back to the best available title (`title_en` → `title_es` → `title_orig`).

## Deployment

1) Ensure `BASE_PATH` is set appropriately.
2) `npm run build`.
3) Publish the `build/` directory to GitHub Pages (e.g., `gh-pages` branch or the repo’s Pages settings).

No extra server configuration is needed; the app is fully prerendered with trailing slashes.
