# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common commands

The project is a SvelteKit + Vite SPA managed via npm. All commands are run from the repo root.

- Install dependencies:
  - `npm install`
- Start dev server (uses adapter-static, base path empty in dev):
  - `npm run dev`
- Production build (honors `BASE_PATH` for GitHub Pages):
  - Basic: `npm run build`
  - With example env file (from `README.md`):
    - `npx dotenv -e .env.example -- npm run build`
  - PowerShell example for GitHub Pages with repo base path:
    - `$env:BASE_PATH="/HobCanon"; npm run build`
- Preview the production build locally:
  - `npm run preview`
- Typecheck Svelte/TS (single run):
  - `npm run check`
- Typecheck in watch mode:
  - `npm run check:watch`
- Lint `.svelte` and `.ts` files with ESLint:
  - `npm run lint`
- Validate the local datasets against their JSON Schemas with AJV:
  - `npm run validate`

### Notes on tests

There is currently no `npm test` script or dedicated test runner configured. Validation and quality gates are provided by `npm run check`, `npm run lint`, and `npm run validate`.

## High-level architecture

### Framework and build

- The app is a SvelteKit 2 SPA using `@sveltejs/adapter-static` and Vite.
- `svelte.config.js` and `vite.config.ts` both derive a `base` path from the `BASE_PATH` environment variable, defaulting to:
  - `''` in development (`NODE_ENV === 'development'`)
  - `'/HobCanon'` in production when `BASE_PATH` is unset
- `src/routes/+layout.ts` sets:
  - `export const prerender = true;` (fully static site)
  - `export const trailingSlash = 'always';` (URLs end in `/`)
- Output for deployment is written to `build/`, suitable for GitHub Pages under the configured base path.

### Data layer and dataset shaping

- Source data lives in JSON files under `src/lib/data/`:
  - `authors.json`
  - `books.json`
- Reference JSON Schemas for these datasets live in `src/lib/data/schemas/` and are enforced via `npm run validate`.
- Types for authors, books, counts, and derived statistics/facets are defined in `src/lib/data/types.ts`.
- `src/lib/data/slug.ts` provides a canonical `slugify` helper (lowercase, accent-stripped, URL-safe, deduped) used for both authors and books.
- `src/lib/data/dataset.ts` is the central data module:
  - Imports the raw JSON data and normalizes it into typed `Author` and `Book` objects.
  - Assigns **stable, unique slugs** to authors and books using a shared registry so that collisions result in `-2`, `-3`, etc.
  - Maintains in-memory indexes:
    - `authorsBySlug`, `authorsByName`, `booksBySlug`.
  - Enriches authors with `bookCount` and books with `authorSlug` links.
  - Computes aggregated `stats`:
    - Totals for books/authors.
    - Top tags, genres, and countries.
  - Computes `facets` for filter UIs:
    - Unique, sorted lists of countries, languages, formats, genres, tags, and periods.
  - Builds the dataset **once at module initialization** and exposes read-only accessors:
    - `getDataset()` returns `{ books, authors, stats, facets }` without re-computing.
    - `getBookBySlug(slug)`/`getAuthorBySlug(slug)` to resolve detail pages.
    - `getBooksByAuthorSlug(slug)` for reverse lookup from author to books.
- All routes consume this in-memory dataset; there is no network or backend I/O at runtime.

### Layout and routing

- Global layout: `src/routes/+layout.svelte`
  - Imports `../app.css` and defines the main shell: sticky header, nav, language toggle, and footer.
  - Uses `$app/paths.base` so links honor the configured base path.
  - Reads `stats` from `LayoutData` to surface total books/authors in the footer badges.
- Layout load: `src/routes/+layout.ts`
  - Calls `getDataset()` at load time and exposes `{ books, authors, stats, facets }` as layout data.
  - Because prerendering is enabled and the dataset is static, this happens once during the static build.

#### Key routes

- Home (`src/routes/+page.svelte`)
  - Uses layout data to:
    - Show a hero section with totals and top genres/tags.
    - Derive a small set of "highlighted" books using importance/difficulty.
    - Derive "spotlight" authors by highest `bookCount`.
- Books index (`src/routes/books/+page.svelte`)
  - Consumes `data.books` and `data.facets` to implement a rich client-side filter panel:
    - Text search over title/author/genre.
    - Range filtering by publication year.
    - Select filters for country, language, format, genre, tag, period.
    - Minimum thresholds for difficulty and importance.
  - Displays results via a shared `BookCard` component.
- Book detail (`src/routes/books/[slug]/+page.ts` and `+page.svelte`)
  - Load function resolves a book by slug and optionally its author via `authorSlug`.
  - Page shows core metadata (year, language, country, difficulty, importance, period, pages, tags) and a CTA to the associated author page.
- Authors index (`src/routes/authors/+page.svelte`)
  - Builds filters over authors:
    - Text search over name and alias.
    - Country select from `facets.countries`.
    - Birth/death year range slider.
  - Displays derived counts and a simple results list with link-through to detail views.
- Author detail (`src/routes/authors/[slug]/+page.ts` and `+page.svelte`)
  - Load function resolves an author and their books from the dataset.
  - Page shows author profile (years, country, optional Wikipedia link/photo) and a grid of associated books using `BookCard`.
- Stats (`src/routes/stats/+page.svelte`)
  - Derives several aggregate series from `data.books` (genre, language, country, format, difficulty, importance).
  - Constructs custom SVG-based charts (bars and line charts) for:
    - Distribution by genre, language, country, format.
    - Timelines by century (up to 18th) and by decade (1800s–1990s).
    - Histograms for difficulty and importance (1–5).
  - All charting is done locally with simple computations and inline SVG—no external charting library usage in this page despite `chart.js` being a dependency.

### i18n and formatting utilities

- `src/lib/i18n/index.ts` contains the i18n system:
  - A `locale` writable Svelte store for the current UI language (`'en' | 'es'`).
  - A `t` derived store that maps translation keys to dictionary entries.
  - `toggleLocale()` which flips the language and updates `document.documentElement.lang` when in the browser.
  - Helper functions for titles and formatting:
    - `titleFor(book, lang)` chooses the best-available title based on language preference and fallbacks.
    - `flagFromCountry`, `flagForLanguage`, `formatLanguage`, `formatLanguageName`, `formatCountry`, `formatCountryName` for human-friendly labels and emoji flags.
- Layout and pages rely on these helpers extensively for labels, badges, and metadata.

### UI components and styling

- `src/lib/components/BookCard.svelte` encapsulates the common layout for displaying a single book in lists.
- Styling is primarily via Tailwind CSS utility classes and a small set of custom classes defined in `src/app.css` (e.g., `card`, `badge`, `glass`, `shadow-soft`).
- The layout centers the content in a `max-w-6xl` container with responsive grids; most pages are designed for GitHub Pages-style static hosting.

## Working with data and slugs

- Slugs for authors and books are derived from human-readable names/titles and deduplicated with numeric suffixes. Changing source names or titles will change slugs and therefore page URLs; prefer to keep names/titles stable for canonical entries.
- When editing the JSON datasets:
  - Run `npm run validate` to ensure they still conform to their schemas.
  - Be aware that new or updated records will automatically be included in all routes and charts via `getDataset()`.
- The dataset is held in memory at build time only. There is no persistence or runtime mutation; all state is reconstructed from JSON on each build.
