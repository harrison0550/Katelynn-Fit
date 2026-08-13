# Architecture

Katelynn Fit is a mobile-first React application built with the Vinext Sites starter. The application is client-rendered and uses a single program data module as the source of truth for workout definitions.

## Boundaries

- `app/program.ts` contains immutable workout and exercise definitions.
- `app/page.tsx` renders navigation, workouts, education, and check-ins.
- `app/globals.css` owns the light-pink visual system and responsive behavior.
- `public/manifest.webmanifest` and `public/sw.js` provide the installable offline shell.
- Browser storage persists device-local progress under a versioned key.

Completed workout dates and saved check-ins are facts. Future program changes must not silently rewrite them. Storage migrations must be additive and preserve malformed source data for recovery.
