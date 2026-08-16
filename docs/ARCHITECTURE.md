# Architecture

Katelynn Fit is a static, mobile-first React Progressive Web App built with Vite and published through GitHub Pages. It has no application server or account dependency. A single program data module is the source of truth for workout definitions.

## Boundaries

- `app/program.ts` contains immutable workout and exercise definitions.
- `app/page.tsx` renders navigation, workouts, education, and check-ins.
- `app/globals.css` owns the light-pink visual system and responsive behavior.
- `public/manifest.webmanifest` and `public/sw.js` provide the installable offline shell.
- `public/assets/exercise-library` contains the reviewed CarrieFit media collection; active exercise records opt into exact or safely applicable visuals through typed metadata.
- `.github/workflows/deploy-pages.yml` builds and publishes `main` to GitHub Pages.
- Browser storage persists device-local progress under a versioned key. The additive workout model keeps a resumable active workout and append-only completed session snapshots containing the exercise prescription, set results, and cardio results.

Completed workout dates and saved check-ins are facts. Future program changes must not silently rewrite them. Storage migrations must be additive and preserve malformed source data for recovery.

The Calendar is a read-only projection of the weekly program and append-only completed session history. It calculates the planned workout from each date's weekday, while completed markers use the session's saved local date. Opening or starting from a calendar day does not rewrite history or create a scheduled-session record.

Workout timers persist an absolute wall-clock finish timestamp. The interface reconciles remaining time every second and when the document regains visibility or focus, so a locked screen or suspended iPhone PWA does not make the timer inaccurate. Timer completion uses a locally generated chime, vibration when supported, and a visible status message. A timer never marks an exercise complete automatically.

Exercise media is locally bundled and precached. App-created illustrations and animations must be labelled, include meaningful alternative text, and remain secondary to written coaching. Media provenance and license notes live in `docs/MEDIA_CREDITS.md`.
