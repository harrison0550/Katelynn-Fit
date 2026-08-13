# Project Context

## Current release

- Product: Katelynn Fit
- Version: 0.1.0 foundation
- Status: first working GitHub Pages application
- Audience: a new teenage trainee using a parent-supervised home gym

## Current experience

The application has five primary destinations: Home, Plan, Progress, Learn, and Profile. It provides a five-day Foundation Beginner program with three strength days, a rowing day, and a treadmill day. Workouts stay below one hour and begin with conservative two-set prescriptions.

Progress data is intentionally device-local. Completed workouts, checked sets, and optional body check-ins use the versioned `katelynn-fit-v1` browser-storage key.

Production is deployed from `main` to `https://harrison0550.github.io/Katelynn-Fit/` using GitHub Actions. The app must remain a fully static PWA so core workouts never depend on an application server.

## Guardrails

- Prioritize movement quality, confidence, and consistency over exhaustion.
- Do not prescribe calorie targets, rapid weight-loss deadlines, or punishment workouts.
- Body check-ins are optional and described as trend data, not grades.
- Do not increase load automatically.
- Require adult help for unfamiliar equipment setup.
- Preserve locally saved progress through additive, versioned migrations.
- Maintain usable 320-pixel layouts, safe areas, reduced-motion support, and 44-pixel touch targets.

## Next priorities

1. Test the first two weeks with Katelynn and record exercise preferences.
2. Add effort and enjoyment feedback after cardio sessions.
3. Add adjustable workout scheduling without rewriting completed history.
4. Add reviewed equipment-specific exercise visuals.
5. Add export and import before expanding the storage model.
