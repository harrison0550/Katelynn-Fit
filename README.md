# Katelynn Fit

Katelynn Fit is a private-data, beginner-friendly workout companion for a five-day home-gym program. It combines three full-body strength sessions with dedicated rowing and treadmill discovery days, all designed to stay under one hour. Background-safe timers, strength-set logs, cardio results, and detailed workout history support each session.

Production app: [harrison0550.github.io/Katelynn-Fit](https://harrison0550.github.io/Katelynn-Fit/)

## Product principles

- Teach movement and equipment confidence before increasing difficulty.
- Treat consistency, strength, cardio comfort, and energy as meaningful progress.
- Keep weight and measurement check-ins private, optional, and trend-focused.
- Avoid aggressive weight-loss deadlines, calorie prescriptions, and appearance-based pressure.
- Remain comfortable to use one-handed on a small phone.
- Use reviewed CarrieFit animations and equipment guides only where they accurately support the programmed movement.

## First program

| Day | Session | Expected time |
| --- | --- | --- |
| Monday | Foundation A | 45–50 minutes |
| Tuesday | Rower Confidence | 35–40 minutes |
| Wednesday | Foundation B | 45–50 minutes |
| Thursday | Treadmill Discovery | 35–40 minutes |
| Friday | Foundation C | 45–55 minutes |

Saturday and Sunday are recovery days. Optional easy walking or family activity is encouraged, but it is not a required workout.

## Development

Install dependencies and start the development server:

```powershell
npm install
npm run dev
```

Create a production build with:

```powershell
npm run build
```

Every push to `main` builds and publishes the static app through GitHub Pages.

## Data and privacy

Workout completion, active workout progress, detailed session history, and body check-ins are stored locally in the browser under the versioned `katelynn-fit-v1` key. The app has no account, advertising, analytics, or remote health-data storage.

## Safety scope

The app provides general exercise education, not medical diagnosis or individualized medical care. New equipment should be set up with adult help. Users should stop for sharp pain, dizziness, chest pain, or unusual breathing difficulty.
