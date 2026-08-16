# Architecture

Katelynn Fit is a static, mobile-first React Progressive Web App built with Vite and published through GitHub Pages. It has no application server or account dependency. A single program data module is the source of truth for workout definitions.

## Boundaries

- `app/program.ts` contains immutable workout and exercise definitions.
- `app/page.tsx` renders navigation, workouts, education, and check-ins.
- `app/globals.css` owns the light-pink visual system and responsive behavior.
- `public/manifest.webmanifest` and `public/sw.js` provide the installable offline shell.
- `public/assets/exercise-library` contains the reviewed CarrieFit media collection; active exercise records opt into exact or safely applicable visuals through typed metadata.
- `.github/workflows/deploy-pages.yml` builds and publishes `main` to GitHub Pages.
- Browser storage persists device-local progress under a versioned key.

Completed workout dates and saved check-ins are facts. Future program changes must not silently rewrite them. Storage migrations must be additive and preserve malformed source data for recovery.

Exercise media is locally bundled and precached. App-created illustrations and animations must be labelled, include meaningful alternative text, and remain secondary to written coaching. Media provenance and license notes live in `docs/MEDIA_CREDITS.md`.
