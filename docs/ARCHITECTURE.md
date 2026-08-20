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

Workout timers persist an absolute wall-clock finish timestamp. The interface reconciles remaining time every second and when the document regains visibility, focus, or a restored page, so a locked screen or suspended iPhone PWA does not make the timer inaccurate. Timer audio is prepared during the initiating user action and reused for the completion chime; vibration and a visible status message supplement it. A timer never marks an exercise complete automatically.

Completing a strength set starts its 90-second rest. Only one workout timer may be active or paused at a time, and its status remains visible across exercise navigation. Cardio countdown completion prefills actual duration and may transition into a persisted Keep Going interval. Stopping cardio finalizes measured elapsed time without changing the prescribed target.

Exercise media is locally bundled and precached. App-created illustrations and animations must be labelled, include meaningful alternative text, and remain secondary to written coaching. Media provenance and license notes live in `docs/MEDIA_CREDITS.md`.

An exercise may define an animated primary demonstration plus a static `reference`. The workout screen presents both for matched equipment movements: animation teaches the movement sequence, while the retained reference teaches machine orientation, attachment position, or posture. Assets in the reviewed library are not automatically activated by filename; `app/program.ts` must explicitly match them to the programmed movement.

Treadmill exercises may define typed `treadmillPlan` stages containing time, suggested speed, incline, and relative-effort guidance. These values are displayed before the timer. Speed is a conservative starting range rather than a required performance target; the talk test and perceived effort remain authoritative so the plan adapts to a beginner's current capacity.
