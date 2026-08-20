export type ExerciseMedia = {
  src: string;
  alt: string;
  label: string;
  source: "app-original" | "official-equipment" | "licensed-community";
  reference?: Omit<ExerciseMedia, "reference">;
};

export type TreadmillStage = {
  time: string;
  speed: string;
  incline: string;
  effort: string;
};

export type Exercise = {
  id: string;
  name: string;
  type: "Warm-up" | "Strength" | "Cardio" | "Core" | "Cooldown";
  prescription: string;
  sets: number;
  icon: string;
  cue: string;
  steps: string[];
  treadmillPlan?: TreadmillStage[];
  media?: ExerciseMedia;
};

export type WorkoutDay = {
  id: string;
  day: string;
  title: string;
  focus: string;
  duration: string;
  icon: string;
  exercises: Exercise[];
};

const exercise = (id: string, name: string, type: Exercise["type"], prescription: string, sets: number, icon: string, cue: string, steps: string[]): Exercise => ({ id, name, type, prescription, sets, icon, cue, steps });

const warmupWalk = exercise("warmup-walk", "Easy treadmill warm-up", "Warm-up", "5 minutes · 1.5–2.8 mph · 0% incline", 0, "◷", "Use the speed range as a starting suggestion. Stay at the lower number longer whenever needed.", ["Clip on the safety key and stand on the side rails while starting the belt at 1.0 mph.", "Step onto the moving belt, hold the rails until balanced, then let your arms swing naturally.", "Follow the three stages below. Change speed in small 0.1–0.2 mph steps and never rush to the top of a range.", "Keep shoulders relaxed and look ahead. You should be able to speak comfortably throughout the warm-up."]);
const benchSquat = exercise("bench-squat", "Sit-to-stand bench squat", "Strength", "2 sets · 8–10 reps", 2, "♙", "Tap the bench softly, then stand tall through your whole foot.", ["Use a stable bench and stand just in front of it with feet about shoulder-width apart.", "Reach hips back and bend your knees until you gently sit or tap the bench.", "Press through both feet to stand without rocking forward."]);
const cableRow = exercise("cable-row", "Seated cable row", "Strength", "2 sets · 10–12 reps", 2, "↔", "Pull elbows toward your back pockets without shrugging.", ["Ask an adult to set the cable low and select a very light weight.", "Sit tall with the handle at arm’s length and brace your feet.", "Pull toward your lower ribs, pause, and return slowly."]);
const inclinePushup = exercise("incline-pushup", "Incline bench push-up", "Strength", "2 sets · 6–10 reps", 2, "↗", "Keep your body in one long line from head to heels.", ["Place hands on a stable bench slightly wider than shoulders.", "Walk feet back until your body forms a straight line.", "Lower your chest toward the bench, then press away smoothly."]);
const gluteBridge = exercise("glute-bridge", "Glute bridge", "Strength", "2 sets · 10–12 reps", 2, "⌒", "Squeeze your glutes; do not arch your lower back.", ["Lie on your back with knees bent and feet flat.", "Brace gently and press through your heels to lift your hips.", "Pause when shoulders, hips, and knees make a line, then lower slowly."]);
const deadBug = exercise("dead-bug", "Dead bug", "Core", "2 sets · 5 reps each side", 2, "✣", "Move slowly while keeping your lower back comfortable and steady.", ["Lie on your back with arms up and knees bent over your hips.", "Gently brace your middle.", "Lower the opposite arm and leg only as far as you can control, return, and switch sides."]);
const rowEasy = exercise("row-easy", "Easy rowing technique", "Cardio", "10 minutes · easy effort", 0, "≋", "Legs, then body, then arms. Return arms, body, then legs.", ["Strap feet securely and set the resistance to an easy level.", "Push with your legs first, lean back slightly, then bring the handle toward your ribs.", "Straighten arms, lean forward, then bend knees to return. Keep the pace relaxed."]);
const rowIntervals = exercise("row-intervals", "Rowing discovery intervals", "Cardio", "6 rounds: 1 min steady + 1 min easy", 0, "≋", "Steady should feel purposeful, never like an all-out sprint.", ["Row easily for the first minute.", "For the next minute, increase your pace slightly while keeping smooth technique.", "Alternate six times. You should still be able to speak a short sentence."]);
const cooldown = exercise("cooldown", "Easy cooldown and breathing", "Cooldown", "5 minutes", 0, "♡", "Finish feeling calm, not wiped out.", ["Slow the activity gradually for two to three minutes instead of stopping suddenly.", "When breathing feels comfortable, stop the equipment and step off safely.", "Take slow breaths and gently stretch any muscles that feel tight without forcing the range."]);
const latPulldown = exercise("lat-pulldown", "Cable lat pulldown", "Strength", "2 sets · 10–12 reps", 2, "↓", "Bring the bar toward your upper chest; never pull behind your neck.", ["Ask an adult to set a light weight and adjust the seat or leg support.", "Grip just wider than shoulders and sit tall.", "Pull elbows down until the bar nears your upper chest, then return with control."]);
const supportedSplitSquat = exercise("split-squat", "Supported split squat", "Strength", "2 sets · 6–8 reps each side", 2, "↕", "Hold the rack lightly and keep the movement small at first.", ["Stand beside the rack for balance and step one foot back.", "Lower straight down through a comfortable range.", "Press through the front foot to stand, finish the side, then switch."]);
const dumbbellPress = exercise("db-floor-press", "Dumbbell floor press", "Strength", "2 sets · 8–10 reps", 2, "↑", "Use light dumbbells and keep elbows at a comfortable angle.", ["Sit with light dumbbells, then carefully roll onto your back with knees bent.", "Start with upper arms resting on the floor and wrists stacked over elbows.", "Press up without clanging the weights, then lower until upper arms gently touch down."]);
const birdDog = exercise("bird-dog", "Bird dog", "Core", "2 sets · 5 reps each side", 2, "✦", "Reach long instead of lifting high.", ["Start on hands and knees with hands under shoulders and knees under hips.", "Brace gently, then reach one arm and the opposite leg long.", "Return with control and switch sides without letting your body twist."]);
const treadmillIntervals = exercise("treadmill-intervals", "Treadmill discovery walk", "Cardio", "24 minutes · 8 rounds: 2 min easy + 1 min brisk", 0, "◷", "Brisk should feel like 5–6 out of 10: breathing faster, able to talk but not sing, and never running.", ["Attach the safety key and keep incline at 0% while learning the pace changes.", "For every round, walk easy for two minutes, then brisk for one minute. Repeat that pattern eight times.", "Start at the bottom of each speed range. Change only 0.1–0.2 mph at a time until the effort description matches.", "Slow down immediately if you need to hold the rails, cannot speak a full sentence, feel unsteady, or lose tall walking posture."]);
const treadmillCooldown = exercise("treadmill-cooldown", "Treadmill cooldown", "Cooldown", "5 minutes · gradually slow to 1.0–1.5 mph", 0, "♡", "Let breathing settle gradually. The final minute should feel very easy.", ["Set incline to 0% and reduce speed gradually using the three stages below.", "Keep walking tall and take slow, relaxed breaths. Do not stop the belt suddenly unless safety requires it.", "At the end, slow to 1.0 mph, hold the rails, step onto the side rails, stop the belt, and remove the safety key."]);
const stepUp = exercise("step-up", "Low bench step-up", "Strength", "2 sets · 6–8 reps each side", 2, "↥", "Use a low, stable platform and hold support while learning.", ["Choose the lowest stable step and stand close to it beside the rack.", "Place your whole foot on top and stand up through that leg.", "Step down slowly, finish the side, then switch."]);
const dumbbellRdl = exercise("db-rdl", "Light dumbbell hip hinge", "Strength", "2 sets · 8–10 reps", 2, "⌁", "Push your hips back while keeping the weights close to your legs.", ["Practice without weight first, then hold very light dumbbells at your thighs.", "Soften your knees and push your hips backward with a long spine.", "Stop when your hamstrings feel a gentle stretch, then squeeze your glutes to stand."]);
const farmerCarry = exercise("farmer-carry", "Dumbbell farmer carry", "Strength", "2 walks · 30 seconds", 2, "↔", "Walk tall with light weights and plenty of clear floor space.", ["Clear your walking path and pick up two light dumbbells safely.", "Stand tall with arms by your sides and walk with controlled steps.", "Set the weights down by bending your knees and hips—not rounding your back."]);

const MEDIA = {
  treadmillWalk: {
    src: "assets/exercise-library/generated/treadmill-easy-walk.gif",
    alt: "Looping side-view demonstration of a woman walking upright on a treadmill with relaxed shoulders, free arms, and the safety clip attached",
    label: "App-created treadmill demonstration",
    source: "app-original" as const,
  },
  squatPosture: {
    src: "assets/exercise-library/original/bodyweight-squat-posture.webp",
    alt: "Side-by-side illustration of a tall squat start and a controlled squat with heels planted, knees tracking over the toes, and arms extended forward",
    label: "App-created squat posture reference",
    source: "app-original" as const,
  },
  squatAnimation: {
    src: "assets/exercise-library/generated/bodyweight-squat-female.gif",
    alt: "Looping female demonstration of a controlled squat pattern, sitting the hips back with heels planted and standing tall",
    label: "CarrieFit squat movement demonstration",
    source: "app-original" as const,
    reference: {
      src: "assets/exercise-library/original/bodyweight-squat-posture.webp",
      alt: "Side-by-side illustration of a tall squat start and a controlled squat with heels planted, knees tracking over the toes, and arms extended forward",
      label: "App-created squat posture reference",
      source: "app-original" as const,
    },
  },
  seatedCableRow: {
    src: "assets/exercise-library/generated/seated-cable-row-female.gif",
    alt: "Looping female demonstration of a seated cable row, pulling the handle toward the lower ribs with a tall torso and controlled return",
    label: "CarrieFit seated cable row animation",
    source: "app-original" as const,
    reference: {
      src: "assets/exercise-library/ritfit/seated-cable-row.webp",
      alt: "RitFit seated cable row start and finish positions",
      label: "Official RitFit equipment guide",
      source: "official-equipment" as const,
    },
  },
  deadBug: {
    src: "assets/exercise-library/generated/dead-bug-female.gif",
    alt: "Looping female demonstration of a controlled dead bug, alternating one arm and the opposite leg while keeping the lower back supported",
    label: "App-created dead bug demonstration",
    source: "app-original" as const,
  },
  rowerTechnique: {
    src: "assets/phase3/rower-technique.jpg",
    alt: "Four-position rowing reference showing the catch, drive, finish, and recovery sequence with legs driving first and arms returning first",
    label: "Rower technique reference",
    source: "app-original" as const,
  },
  breathingCooldown: {
    src: "assets/exercise-library/generated/slow-breathing-female.gif",
    alt: "Looping female demonstration of relaxed seated breathing with the hands around the lower ribs",
    label: "App-created breathing demonstration",
    source: "app-original" as const,
  },
  latPulldown: {
    src: "assets/exercise-library/generated/lat-pulldown-female.gif",
    alt: "Looping female demonstration of a front lat pulldown, drawing the elbows down and bringing the bar toward the upper chest",
    label: "CarrieFit lat pulldown animation",
    source: "app-original" as const,
    reference: {
      src: "assets/exercise-library/original/lat-pulldown-red-cage.webp",
      alt: "Start and finish positions for a seated lat pulldown on a red cage-style Smith machine, bringing the wide bar toward the upper chest",
      label: "App-created home-gym equipment guide",
      source: "app-original" as const,
    },
  },
  birdDog: {
    src: "assets/exercise-library/generated/bird-dog-female.gif",
    alt: "Looping female demonstration of a bird dog, alternating the left arm with right leg and the right arm with left leg while keeping the torso level",
    label: "App-created bird dog demonstration",
    source: "app-original" as const,
  },
  hipHinge: {
    src: "assets/exercise-library/generated/hip-hinge-female.gif",
    alt: "Looping female demonstration of a controlled hip hinge with soft knees, hips moving backward, and a long neutral spine",
    label: "CarrieFit hip-hinge animation",
    source: "app-original" as const,
    reference: {
      src: "assets/exercise-library/original/hip-hinge-posture.webp",
      alt: "Side-by-side illustration of a standing start and a hip hinge with soft knees, hips pushed backward, and a long neutral spine",
      label: "App-created hip-hinge posture reference",
      source: "app-original" as const,
    },
  },
};

warmupWalk.media = MEDIA.treadmillWalk;
benchSquat.media = MEDIA.squatAnimation;
cableRow.media = MEDIA.seatedCableRow;
deadBug.media = MEDIA.deadBug;
rowEasy.media = MEDIA.rowerTechnique;
rowIntervals.media = MEDIA.rowerTechnique;
cooldown.media = MEDIA.breathingCooldown;
latPulldown.media = MEDIA.latPulldown;
birdDog.media = MEDIA.birdDog;
treadmillIntervals.media = MEDIA.treadmillWalk;
treadmillCooldown.media = MEDIA.treadmillWalk;
dumbbellRdl.media = MEDIA.hipHinge;

warmupWalk.treadmillPlan = [
  { time: "Minute 0–1", speed: "1.5–2.0 mph", incline: "0%", effort: "Very easy · 1–2/10" },
  { time: "Minutes 1–3", speed: "2.0–2.5 mph", incline: "0%", effort: "Easy · 2/10" },
  { time: "Minutes 3–5", speed: "2.3–2.8 mph", incline: "0%", effort: "Easy and warm · 2–3/10" },
];
treadmillIntervals.treadmillPlan = [
  { time: "Rounds 1–8 · 2 min", speed: "2.0–2.6 mph", incline: "0%", effort: "Easy · full conversation" },
  { time: "Rounds 1–8 · 1 min", speed: "2.7–3.4 mph", incline: "0%", effort: "Brisk · talk but not sing · never all-out" },
];
treadmillCooldown.treadmillPlan = [
  { time: "Minutes 0–2", speed: "2.0–2.5 mph", incline: "0%", effort: "Easy · breathing settling" },
  { time: "Minutes 2–4", speed: "1.5–2.0 mph", incline: "0%", effort: "Very easy" },
  { time: "Minute 4–5", speed: "1.0–1.5 mph", incline: "0%", effort: "Calm and comfortable" },
];

export const PROGRAM: WorkoutDay[] = [
  { id: "monday-foundation-a", day: "Monday", title: "Foundation A", focus: "Learn the basic squat, push, pull, and core patterns.", duration: "45–50 min", icon: "A", exercises: [warmupWalk, benchSquat, cableRow, inclinePushup, gluteBridge, deadBug, cooldown] },
  { id: "tuesday-row", day: "Tuesday", title: "Rower Confidence", focus: "Practice smooth technique and compare easy versus steady effort.", duration: "35–40 min", icon: "≋", exercises: [warmupWalk, rowEasy, rowIntervals, cooldown] },
  { id: "wednesday-foundation-b", day: "Wednesday", title: "Foundation B", focus: "Build balance, posture, and upper-body confidence.", duration: "45–50 min", icon: "B", exercises: [warmupWalk, supportedSplitSquat, latPulldown, dumbbellPress, gluteBridge, birdDog, cooldown] },
  { id: "thursday-treadmill", day: "Thursday", title: "Treadmill Discovery", focus: "Explore comfortable pace changes without running or all-out efforts.", duration: "35–40 min", icon: "◷", exercises: [warmupWalk, treadmillIntervals, treadmillCooldown] },
  { id: "friday-foundation-c", day: "Friday", title: "Foundation C", focus: "Practice stepping, hinging, carrying, and total-body control.", duration: "45–55 min", icon: "C", exercises: [warmupWalk, stepUp, dumbbellRdl, inclinePushup, cableRow, farmerCarry, deadBug, cooldown] },
];
