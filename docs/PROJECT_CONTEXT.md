# Project Context

## Current release

- Product: Katelynn Fit
- Version: 0.8.0 guided treadmill settings
- Status: first working GitHub Pages application
- Audience: a new teenage trainee using a parent-supervised home gym

## Current experience

The application has five primary destinations: Home, Calendar, Progress, Learn, and Profile. The monthly Calendar projects the repeating five-day Foundation Beginner plan, marks today and completed sessions, opens day details, and launches the matching workout. It provides three strength days, a rowing day, and a treadmill day. Workouts stay below one hour and begin with conservative two-set prescriptions.

Progress data is intentionally device-local. Completed workouts, legacy checked sets, optional body check-ins, resumable active workouts, and detailed session history use the versioned `katelynn-fit-v1` browser-storage key. Existing 0.3 data remains compatible.

Production is deployed from `main` to `https://harrison0550.github.io/Katelynn-Fit/` using GitHub Actions. The app must remain a fully static PWA so core workouts never depend on an application server.

Release 0.3 ports CarrieFit's reviewed exercise media and pink install icons. Exact or safely applicable demonstrations now appear for treadmill walking, the squat pattern, seated cable rows, dead bugs, rowing technique, breathing cooldowns, lat pulldowns, bird dogs, and the hip-hinge pattern. The complete approved CarrieFit media set is stored locally and precached for future matching; exercises without an accurate match continue to use written instruction.

Release 0.4 adds background-safe exercise and rest timers, a local completion cue, per-set weight/repetition/completion logging, actual cardio duration/distance/effort/enjoyment logging, resumable active workouts, and append-only detailed workout history. Previous results are facts for reference; the app does not automatically increase or prefill weight.

Release 0.5 replaces the weekly Plan tab with a monthly Calendar consistent with the family workout apps. Calendar dates show planned sessions, completed history, recovery days, and direct workout launch actions without rewriting historical session dates.

Release 0.6 replicates CarrieFit 1.2's completed visual audit. All 24 newly approved female movement loops are stored and precached offline. Exact current-program matches replace static-only movement previews for the bench squat pattern, seated cable row, lat pulldown, and dumbbell hip hinge. Equipment and posture references remain visible beside the animation rather than being displaced. Unmatched animations remain inactive until Katelynn's program contains the corresponding exercise.

Release 0.7 upgrades timer behavior to the mature family-app mechanics. Completing a strength set starts a 90-second rest automatically. Running or paused timers remain visible across exercise navigation and cannot be silently replaced. Countdown completion can restart at the original duration, cardio targets prefill actual minutes, Keep Going extends cardio beyond the target, and Stop finalizes measured cardio time. Audio is prepared from the initiating user action for stronger iPhone compatibility, while absolute wall-clock timestamps preserve accuracy across screen locks, app switches, refreshes, and page restoration.

Release 0.8 adds minute-by-minute treadmill settings for the five-minute warm-up, the 24-minute discovery walk, and a dedicated five-minute treadmill cooldown. Each stage names a conservative speed range, 0% incline, and an effort/talk-test target. The lowest speed is always the starting point; 0.1–0.2 mph adjustments and relative effort take priority over reaching the top of a range.

## Guardrails

- Prioritize movement quality, confidence, and consistency over exhaustion.
- Do not prescribe calorie targets, rapid weight-loss deadlines, or punishment workouts.
- Body check-ins are optional and described as trend data, not grades.
- Do not increase load automatically.
- Require adult help for unfamiliar equipment setup.
- Preserve locally saved progress through additive, versioned migrations.
- Maintain usable 320-pixel layouts, safe areas, reduced-motion support, and 44-pixel touch targets.

## Next priorities

1. Confirm timer audio and vibration on Katelynn's installed iPhone PWA.
2. Add backup export and import for the expanded local history.
3. Add adjustable workout scheduling without rewriting completed history.
4. Activate additional reviewed animations only when the matching exercise enters Katelynn's program.
5. Consider simple previous-performance references after enough beginner baseline data exists.
