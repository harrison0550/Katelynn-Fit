"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PROGRAM, type Exercise, type WorkoutDay } from "./program";

type Tab = "home" | "calendar" | "progress" | "learn" | "profile";
type SetLog = { weight: string; reps: string; done: boolean };
type CardioLog = { minutes: string; distance: string; effort: string; enjoyment: string };
type TimerState = {
  exerciseId: string;
  label: string;
  endsAt: number | null;
  remainingSeconds: number;
  totalSeconds: number;
  mode?: "countdown" | "extended";
  status?: "running" | "paused" | "complete";
  extendedStartedAt?: number | null;
  elapsedSeconds?: number;
};
type ActiveWorkout = { workoutId: string; startedAt: string; setLogs: Record<string, SetLog>; cardioLogs: Record<string, CardioLog>; timer?: TimerState };
type ExerciseSnapshot = { id: string; name: string; type: Exercise["type"]; prescription: string; sets: SetLog[]; cardio?: CardioLog };
type WorkoutSession = { id: string; workoutId: string; title: string; date: string; completedAt: string; durationMinutes: number; exercises: ExerciseSnapshot[] };
type ProgressState = {
  completed: Record<string, string>;
  setChecks: Record<string, boolean>;
  checkIns: Array<{ id: string; date: string; weight: number; waist?: number }>;
  sessions: WorkoutSession[];
  activeWorkout?: ActiveWorkout;
};

const STORAGE_KEY = "katelynn-fit-v1";
const MEDIA_BASE = import.meta.env.BASE_URL;
const EMPTY_PROGRESS: ProgressState = { completed: {}, setChecks: {}, checkIns: [], sessions: [] };
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const timerSeconds: Record<string, number> = { "warmup-walk": 300, "row-easy": 600, "row-intervals": 720, "treadmill-intervals": 1440, cooldown: 300 };

function localDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function findToday() {
  const name = dayNames[new Date().getDay()];
  return PROGRAM.find((day) => day.day === name) ?? PROGRAM[0];
}

function legacySetKey(dayId: string, exerciseId: string, set: number) { return `${dayId}:${exerciseId}:${set}`; }
function setKey(exerciseId: string, set: number) { return `${exerciseId}:${set}`; }
function formatTimer(seconds: number) { return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; }
function wallClockNow() { return new Date().getTime(); }
function displayDate(date: string) { return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }); }
function dateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function workoutForDate(date: Date) { return PROGRAM.find((day) => day.day === dayNames[date.getDay()]); }
function calendarCells(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first); start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, index) => { const date = new Date(start); date.setDate(start.getDate() + index); return date; });
}

function timerRemaining(timer: TimerState, now: number) {
  return timer.endsAt ? Math.max(0, Math.ceil((timer.endsAt - now) / 1000)) : Math.max(0, timer.remainingSeconds);
}

function timerElapsed(timer: TimerState, now: number) {
  const saved = Math.max(0, timer.elapsedSeconds ?? timer.totalSeconds);
  return timer.mode === "extended" && timer.extendedStartedAt ? saved + Math.max(0, Math.floor((now - timer.extendedStartedAt) / 1000)) : saved;
}

function findExercise(exerciseId: string) {
  for (const day of PROGRAM) {
    const found = day.exercises.find((exercise) => exercise.id === exerciseId);
    if (found) return found;
  }
  return undefined;
}

function playTimerCue(context: AudioContext | null) {
  try {
    if (context) {
      void context.resume().then(() => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = 660;
      gain.gain.setValueAtTime(0.001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.16, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.55);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.56);
      }).catch(() => undefined);
    }
    navigator.vibrate?.([180, 80, 180]);
  } catch { /* The visual completion state remains available when audio is blocked. */ }
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("home");
  const [progress, setProgress] = useState<ProgressState>(EMPTY_PROGRESS);
  const [activeDay, setActiveDay] = useState<WorkoutDay | null>(null);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [expandedMedia, setExpandedMedia] = useState<Exercise["media"] | null>(null);
  const [expandedSession, setExpandedSession] = useState<WorkoutSession | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [notice, setNotice] = useState("");
  const [clock, setClock] = useState(() => Date.now());
  const timerAudio = useRef<AudioContext | null>(null);

  function prepareTimerAudio() {
    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      timerAudio.current ??= new AudioContextClass();
      if (timerAudio.current.state === "suspended") void timerAudio.current.resume().catch(() => undefined);
    } catch { /* Visual and vibration completion cues remain available. */ }
  }

  useEffect(() => {
    const loadSavedProgress = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<ProgressState>;
          setProgress({ ...EMPTY_PROGRESS, ...parsed, sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [] });
        }
      } catch { setNotice("Your saved data could not be read. Nothing was replaced."); }
    }, 0);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register(`${MEDIA_BASE}sw.js`).catch(() => undefined);
    return () => window.clearTimeout(loadSavedProgress);
  }, []);

  const timer = progress.activeWorkout?.timer;
  useEffect(() => {
    const countdownRunning = Boolean(timer?.endsAt);
    const extendedRunning = timer?.mode === "extended" && Boolean(timer.extendedStartedAt);
    if (!timer || (!countdownRunning && !extendedRunning)) return;
    const sync = () => {
      const now = Date.now();
      const remaining = timerRemaining(timer, now);
      setClock(now);
      if (timer.endsAt && remaining === 0) {
        playTimerCue(timerAudio.current);
        setProgress((current) => {
          const currentTimer = current.activeWorkout?.timer;
          if (!currentTimer?.endsAt || currentTimer.endsAt !== timer.endsAt) return current;
          const exercise = findExercise(currentTimer.exerciseId);
          const nextCardioLogs = { ...current.activeWorkout!.cardioLogs };
          if (exercise?.sets === 0) {
            const prior = nextCardioLogs[exercise.id] ?? { minutes: "", distance: "", effort: "", enjoyment: "" };
            nextCardioLogs[exercise.id] = { ...prior, minutes: String(Math.round(currentTimer.totalSeconds / 6) / 10) };
          }
          const nextTimer: TimerState = { ...currentTimer, endsAt: null, remainingSeconds: 0, mode: "countdown", status: "complete", elapsedSeconds: currentTimer.totalSeconds };
          const next = { ...current, activeWorkout: { ...current.activeWorkout!, cardioLogs: nextCardioLogs, timer: nextTimer } };
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          return next;
        });
        setNotice(findExercise(timer.exerciseId)?.sets === 0 ? "Target complete — stop here or keep going." : "Rest complete — begin when ready.");
      }
    };
    sync();
    const interval = window.setInterval(sync, 1000);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("focus", sync);
    window.addEventListener("pageshow", sync);
    return () => { window.clearInterval(interval); document.removeEventListener("visibilitychange", sync); window.removeEventListener("focus", sync); window.removeEventListener("pageshow", sync); };
  }, [timer]);

  function save(next: ProgressState, message?: string) {
    setProgress(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    if (message) { setNotice(message); window.setTimeout(() => setNotice(""), 3500); }
  }

  const today = findToday();
  const completedCount = Math.max(progress.sessions.length, Object.keys(progress.completed).length);
  const latest = progress.checkIns[0];
  const first = progress.checkIns.at(-1);
  const weightChange = latest && first && latest.id !== first.id ? latest.weight - first.weight : null;
  const allExercises = useMemo(() => {
    const unique = new Map<string, Exercise>();
    PROGRAM.forEach((day) => day.exercises.forEach((item) => unique.set(item.id, item)));
    return [...unique.values()];
  }, []);
  const monthCells = useMemo(() => calendarCells(calendarMonth), [calendarMonth]);
  const selectedDateObject = selectedDate ? new Date(`${selectedDate}T12:00:00`) : null;
  const selectedWorkout = selectedDateObject ? workoutForDate(selectedDateObject) : undefined;
  const selectedSessions = selectedDate ? progress.sessions.filter((session) => session.date === selectedDate) : [];

  function startWorkout(day: WorkoutDay) {
    let next = progress;
    if (!progress.activeWorkout || progress.activeWorkout.workoutId !== day.id) {
      next = { ...progress, activeWorkout: { workoutId: day.id, startedAt: new Date().toISOString(), setLogs: {}, cardioLogs: {} } };
      save(next, `${day.title} is ready.`);
    }
    setActiveDay(day);
    setActiveExercise(null);
  }

  function updateSet(exercise: Exercise, setNumber: number, patch: Partial<SetLog>) {
    if (!progress.activeWorkout) return;
    const key = setKey(exercise.id, setNumber);
    const legacyDone = !!progress.setChecks[legacySetKey(progress.activeWorkout.workoutId, exercise.id, setNumber)];
    const current = progress.activeWorkout.setLogs[key] ?? { weight: "", reps: "", done: legacyDone };
    const existingTimer = progress.activeWorkout.timer;
    const otherTimerBusy = Boolean(existingTimer && existingTimer.exerciseId !== exercise.id && (existingTimer.endsAt || existingTimer.extendedStartedAt || (existingTimer.status === "paused" && (existingTimer.remainingSeconds > 0 || existingTimer.mode === "extended"))));
    const nextTimer = patch.done === true && !otherTimerBusy
      ? { exerciseId: exercise.id, label: `${exercise.name} rest`, endsAt: wallClockNow() + 90000, remainingSeconds: 90, totalSeconds: 90, mode: "countdown" as const, status: "running" as const, elapsedSeconds: 0 }
      : existingTimer;
    if (patch.done === true && !otherTimerBusy) prepareTimerAudio();
    const message = patch.done === true ? (otherTimerBusy ? `Set complete. ${existingTimer!.label} is still active, so the rest timer was not started.` : "Set complete — 90-second rest started.") : undefined;
    save({ ...progress, activeWorkout: { ...progress.activeWorkout, setLogs: { ...progress.activeWorkout.setLogs, [key]: { ...current, ...patch } }, timer: nextTimer } }, message);
  }

  function updateCardio(exerciseId: string, patch: Partial<CardioLog>) {
    if (!progress.activeWorkout) return;
    const current = progress.activeWorkout.cardioLogs[exerciseId] ?? { minutes: "", distance: "", effort: "", enjoyment: "" };
    save({ ...progress, activeWorkout: { ...progress.activeWorkout, cardioLogs: { ...progress.activeWorkout.cardioLogs, [exerciseId]: { ...current, ...patch } } } });
  }

  function setTimer(nextTimer?: TimerState) {
    if (!progress.activeWorkout) return;
    save({ ...progress, activeWorkout: { ...progress.activeWorkout, timer: nextTimer } });
  }

  function startOrPauseTimer(exercise: Exercise, seconds: number) {
    const current = progress.activeWorkout?.timer;
    if (current && current.exerciseId !== exercise.id && (current.endsAt || current.extendedStartedAt || (current.status === "paused" && (current.remainingSeconds > 0 || current.mode === "extended")))) {
      setNotice(`${current.label} is still running. Stop it before starting another timer.`);
      return;
    }
    prepareTimerAudio();
    if (current?.exerciseId === exercise.id && current.endsAt) {
      setTimer({ ...current, endsAt: null, remainingSeconds: timerRemaining(current, wallClockNow()), status: "paused" });
    } else if (current?.exerciseId === exercise.id && current.mode === "extended" && current.extendedStartedAt) {
      setTimer({ ...current, extendedStartedAt: null, elapsedSeconds: timerElapsed(current, wallClockNow()), status: "paused" });
    } else if (current?.exerciseId === exercise.id && current.mode === "extended") {
      setTimer({ ...current, extendedStartedAt: wallClockNow(), status: "running" });
    } else {
      const savedRemaining = current?.exerciseId === exercise.id ? current.remainingSeconds : seconds;
      const remaining = savedRemaining > 0 ? savedRemaining : seconds;
      setTimer({ exerciseId: exercise.id, label: exercise.name, endsAt: wallClockNow() + remaining * 1000, remainingSeconds: remaining, totalSeconds: seconds, mode: "countdown", status: "running", elapsedSeconds: 0 });
    }
  }

  function keepGoing(exercise: Exercise) {
    const current = progress.activeWorkout?.timer;
    if (!current || current.exerciseId !== exercise.id) return;
    prepareTimerAudio();
    setTimer({ ...current, mode: "extended", status: "running", endsAt: null, extendedStartedAt: wallClockNow(), elapsedSeconds: current.elapsedSeconds ?? current.totalSeconds });
  }

  function stopTimer() {
    if (!progress.activeWorkout?.timer) return;
    const current = progress.activeWorkout.timer;
    const exercise = findExercise(current.exerciseId);
    let cardioLogs = progress.activeWorkout.cardioLogs;
    if (exercise?.sets === 0) {
      const elapsed = current.mode === "extended" ? timerElapsed(current, wallClockNow()) : Math.max(0, current.totalSeconds - timerRemaining(current, wallClockNow()));
      const prior = cardioLogs[exercise.id] ?? { minutes: "", distance: "", effort: "", enjoyment: "" };
      cardioLogs = { ...cardioLogs, [exercise.id]: { ...prior, minutes: String(Math.round(elapsed / 6) / 10) } };
    }
    save({ ...progress, activeWorkout: { ...progress.activeWorkout, cardioLogs, timer: undefined } }, exercise?.sets === 0 ? "Timer stopped and actual minutes saved." : "Rest timer stopped.");
  }

  function finishWorkout() {
    if (!activeDay || !progress.activeWorkout) return;
    const active = progress.activeWorkout;
    const session: WorkoutSession = {
      id: crypto.randomUUID(), workoutId: activeDay.id, title: activeDay.title, date: localDate(), completedAt: new Date().toISOString(),
      durationMinutes: Math.max(1, Math.round((Date.now() - new Date(active.startedAt).getTime()) / 60000)),
      exercises: activeDay.exercises.map((exercise) => ({
        id: exercise.id, name: exercise.name, type: exercise.type, prescription: exercise.prescription,
        sets: Array.from({ length: exercise.sets }, (_, index) => active.setLogs[setKey(exercise.id, index + 1)] ?? { weight: "", reps: "", done: false }),
        cardio: exercise.sets === 0 ? active.cardioLogs[exercise.id] : undefined,
      })),
    };
    save({ ...progress, completed: { ...progress.completed, [activeDay.id]: session.date }, sessions: [session, ...progress.sessions], activeWorkout: undefined }, `${activeDay.title} saved to workout history!`);
    setActiveDay(null); setActiveExercise(null); setTab("progress");
  }

  function saveCheckIn(event: React.FormEvent) {
    event.preventDefault();
    const parsedWeight = Number(weight); const parsedWaist = waist ? Number(waist) : undefined;
    if (!Number.isFinite(parsedWeight) || parsedWeight < 70 || parsedWeight > 500) { setNotice("Enter a weight between 70 and 500 lb."); return; }
    if (parsedWaist !== undefined && (!Number.isFinite(parsedWaist) || parsedWaist < 15 || parsedWaist > 100)) { setNotice("Enter a valid waist measurement or leave it blank."); return; }
    const entry = { id: crypto.randomUUID(), date: localDate(), weight: parsedWeight, waist: parsedWaist };
    save({ ...progress, checkIns: [entry, ...progress.checkIns] }, "Private check-in saved on this device.");
    setWeight(""); setWaist(""); setShowCheckIn(false);
  }

  if (activeExercise && activeDay && progress.activeWorkout) {
    const defaultSeconds = timerSeconds[activeExercise.id] ?? 90;
    const exerciseTimer = progress.activeWorkout.timer?.exerciseId === activeExercise.id ? progress.activeWorkout.timer : undefined;
    const otherTimer = progress.activeWorkout.timer && progress.activeWorkout.timer.exerciseId !== activeExercise.id ? progress.activeWorkout.timer : undefined;
    const remaining = exerciseTimer ? timerRemaining(exerciseTimer, clock) : defaultSeconds;
    const elapsed = exerciseTimer ? timerElapsed(exerciseTimer, clock) : 0;
    const timerIsExtended = exerciseTimer?.mode === "extended";
    const timerIsComplete = exerciseTimer?.status === "complete" || Boolean(exerciseTimer && !exerciseTimer.endsAt && !timerIsExtended && remaining === 0);
    const timerDisplay = timerIsExtended ? formatTimer(elapsed) : timerIsComplete ? (activeExercise.sets === 0 ? "Target complete" : "Rest complete") : formatTimer(remaining);
    const otherTimerDisplay = otherTimer ? (otherTimer.mode === "extended" ? formatTimer(timerElapsed(otherTimer, clock)) : formatTimer(timerRemaining(otherTimer, clock))) : "";
    const showOtherTimer = Boolean(otherTimer && (otherTimer.endsAt || otherTimer.extendedStartedAt || (otherTimer.status === "paused" && otherTimer.remainingSeconds > 0)));
    const cardio = progress.activeWorkout.cardioLogs[activeExercise.id] ?? { minutes: "", distance: "", effort: "", enjoyment: "" };
    return <main className="app-shell exercise-screen">
      {notice && <div className="notice" role="status">{notice}</div>}
      <button className="back-button" onClick={() => setActiveExercise(null)}>← Back to workout</button>
      {activeExercise.media ? <><button className="exercise-hero media-hero" onClick={() => setExpandedMedia(activeExercise.media)} aria-label={`Enlarge ${activeExercise.name} demonstration`}><img src={`${MEDIA_BASE}${activeExercise.media.src}`} alt={activeExercise.media.alt} /><span className="media-badge">Tap to enlarge animation</span></button>{activeExercise.media.reference && <section className="card equipment-reference"><div><p className="eyebrow">EQUIPMENT &amp; FORM REFERENCE</p><h2>{activeExercise.media.reference.label}</h2><p>Use this alongside the animation for equipment position and setup.</p></div><button onClick={() => setExpandedMedia(activeExercise.media!.reference)} aria-label={`Enlarge equipment reference for ${activeExercise.name}`}><img src={`${MEDIA_BASE}${activeExercise.media.reference.src}`} alt={activeExercise.media.reference.alt} /><span>Tap to enlarge</span></button></section>}</> : <div className="exercise-hero"><span>{activeExercise.icon}</span></div>}
      <p className="eyebrow">{activeExercise.type}</p><h1>{activeExercise.name}</h1><p className="lead">{activeExercise.prescription}</p>
      {showOtherTimer && otherTimer && <section className="card active-timer-banner" aria-live="polite"><div><p className="eyebrow">{otherTimer.endsAt || otherTimer.extendedStartedAt ? "TIMER STILL RUNNING" : "TIMER PAUSED"}</p><strong>{otherTimer.label}</strong><span>{otherTimerDisplay}</span></div><button className="secondary-button" onClick={stopTimer}>Stop timer</button></section>}
      <section className="card timer-card" aria-live="polite"><p className="eyebrow">{timerIsExtended ? "KEEP GOING" : activeExercise.sets ? "REST TIMER" : "ACTIVITY TIMER"}</p><strong className={timerIsComplete ? "timer-finished" : ""}>{timerDisplay}</strong>{timerIsComplete && activeExercise.sets === 0 ? <div className="timer-actions"><button className="primary-button" onClick={() => keepGoing(activeExercise)}>Keep going</button><button className="secondary-button" onClick={() => startOrPauseTimer(activeExercise, defaultSeconds)}>Restart target</button></div> : <div className="timer-actions"><button className="primary-button" onClick={() => startOrPauseTimer(activeExercise, defaultSeconds)}>{exerciseTimer?.endsAt || exerciseTimer?.extendedStartedAt ? "Pause" : timerIsComplete ? "Start again" : exerciseTimer ? "Resume" : "Start timer"}</button><button className="secondary-button" onClick={() => { prepareTimerAudio(); setTimer({ exerciseId: activeExercise.id, label: activeExercise.name, endsAt: null, remainingSeconds: defaultSeconds, totalSeconds: defaultSeconds, mode: "countdown", status: "paused", elapsedSeconds: 0 }); }}>Reset</button></div>}{exerciseTimer && <button className="timer-stop-button" onClick={stopTimer}>Stop timer</button>}<small>{timerIsExtended ? "Stop when finished to save the complete cardio time." : "Timer stays accurate if the screen locks or you switch apps."}</small></section>
      <section className="card coaching-card"><div><h2>How to do it</h2><ol>{activeExercise.steps.map((step) => <li key={step}>{step}</li>)}</ol></div></section>
      <section className="card soft-card"><h2>Remember</h2><p>{activeExercise.cue}</p><p className="safety-copy">Stop if you feel sharp pain, dizziness, or unusual shortness of breath. Ask an adult for help with equipment setup.</p></section>
      {activeExercise.sets > 0 ? <section className="set-log-list"><h2>Log your sets</h2>{Array.from({ length: activeExercise.sets }, (_, index) => index + 1).map((setNumber) => { const log = progress.activeWorkout!.setLogs[setKey(activeExercise.id, setNumber)] ?? { weight: "", reps: "", done: !!progress.setChecks[legacySetKey(activeDay.id, activeExercise.id, setNumber)] }; return <article className={log.done ? "card set-log done" : "card set-log"} key={setNumber}><strong>Set {setNumber}</strong><label>Weight (lb)<input value={log.weight} onChange={(event) => updateSet(activeExercise, setNumber, { weight: event.target.value })} type="number" inputMode="decimal" min="0" step="0.5" placeholder="0 for bodyweight" /></label><label>Reps<input value={log.reps} onChange={(event) => updateSet(activeExercise, setNumber, { reps: event.target.value })} type="number" inputMode="numeric" min="0" step="1" /></label><button className="set-complete" onClick={() => updateSet(activeExercise, setNumber, { done: !log.done })}>{log.done ? "✓ Complete" : "Mark complete"}</button></article>; })}<p className="form-note">Enter only what you actually completed. Weight increases are never automatic.</p></section>
      : <section className="card cardio-log"><h2>Log what you did</h2><div className="field-grid"><label>Actual minutes<input value={cardio.minutes} onChange={(event) => updateCardio(activeExercise.id, { minutes: event.target.value })} type="number" inputMode="decimal" min="0" step="0.5" /></label><label>Distance <small>Optional</small><input value={cardio.distance} onChange={(event) => updateCardio(activeExercise.id, { distance: event.target.value })} placeholder="Example: 1.5 mi or 2500 m" /></label><label>Effort<select value={cardio.effort} onChange={(event) => updateCardio(activeExercise.id, { effort: event.target.value })}><option value="">Choose</option><option>Easy</option><option>Comfortable</option><option>Challenging</option></select></label><label>Enjoyment<select value={cardio.enjoyment} onChange={(event) => updateCardio(activeExercise.id, { enjoyment: event.target.value })}><option value="">Choose</option><option>Loved it</option><option>It was okay</option><option>Not for me yet</option></select></label></div></section>}
      {expandedMedia && <MediaModal media={expandedMedia} close={() => setExpandedMedia(null)} />}
    </main>;
  }

  if (activeDay && progress.activeWorkout) {
    const totalSets = activeDay.exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
    const completedSets = activeDay.exercises.reduce((total, exercise) => total + Array.from({ length: exercise.sets }, (_, index) => progress.activeWorkout!.setLogs[setKey(exercise.id, index + 1)]?.done || progress.setChecks[legacySetKey(activeDay.id, exercise.id, index + 1)] ? 1 : 0).reduce<number>((sum, value) => sum + value, 0), 0);
    const activeTimer = progress.activeWorkout.timer;
    const activeTimerDisplay = activeTimer?.mode === "extended" ? formatTimer(timerElapsed(activeTimer, clock)) : activeTimer ? formatTimer(timerRemaining(activeTimer, clock)) : "";
    return <main className="app-shell workout-screen">{notice && <div className="notice" role="status">{notice}</div>}<button className="back-button" onClick={() => setActiveDay(null)}>← Save and exit</button><p className="eyebrow">{activeDay.day} · {activeDay.duration}</p><h1>{activeDay.title}</h1><p className="lead">{activeDay.focus}</p>{activeTimer && (activeTimer.endsAt || activeTimer.extendedStartedAt) && <section className="card active-timer-banner" aria-live="polite"><div><p className="eyebrow">ACTIVE TIMER</p><strong>{activeTimer.label}</strong><span>{activeTimerDisplay}</span></div><button className="secondary-button" onClick={stopTimer}>Stop timer</button></section>}<div className="progress-bar" aria-label={`${completedSets} of ${totalSets} strength sets complete`}><span style={{ width: totalSets ? `${Math.min(100, completedSets / totalSets * 100)}%` : "0%" }} /></div><div className="workout-list">{activeDay.exercises.map((exercise, index) => { const done = exercise.sets ? Array.from({ length: exercise.sets }, (_, setIndex) => progress.activeWorkout!.setLogs[setKey(exercise.id, setIndex + 1)]?.done).filter(Boolean).length : progress.activeWorkout!.cardioLogs[exercise.id]?.minutes ? 1 : 0; return <button className="exercise-row" key={exercise.id} onClick={() => setActiveExercise(exercise)}><span className="exercise-number">{done ? "✓" : index + 1}</span><span><strong>{exercise.name}</strong><small>{exercise.prescription}{done ? ` · ${exercise.sets ? `${done}/${exercise.sets} sets` : "logged"}` : ""}</small></span><span aria-hidden="true">›</span></button>; })}</div><button className="primary-button" onClick={finishWorkout}>Finish and save workout</button></main>;
  }

  return <div className="app-shell"><header className="topbar"><div><p className="brand-kicker">KATELYNN&apos;S HOME GYM</p><h1>Katelynn Fit</h1></div><div className="avatar" aria-hidden="true">KF</div></header>{notice && <div className="notice" role="status">{notice}</div>}<main>
    {tab === "home" && <><section className="welcome"><p className="eyebrow">YOUR BEGINNER JOURNEY</p><h2>Stronger starts here.</h2><p>Learn the equipment, find cardio you enjoy, and build confidence one workout at a time.</p></section>{progress.activeWorkout && <section className="card resume-card"><p className="eyebrow">WORKOUT IN PROGRESS</p><h2>{PROGRAM.find((day) => day.id === progress.activeWorkout?.workoutId)?.title}</h2><button className="primary-button" onClick={() => startWorkout(PROGRAM.find((day) => day.id === progress.activeWorkout?.workoutId) ?? today)}>Resume workout</button></section>}<section className="card today-card"><div className="card-top"><span className="day-pill">{today.day}</span><span>{today.duration}</span></div><p className="eyebrow">TODAY&apos;S PLAN</p><h2>{today.title}</h2><p>{today.focus}</p><div className="workout-meta"><span>♥ Beginner friendly</span><span>▷ Under 1 hour</span></div><button className="primary-button" onClick={() => startWorkout(today)}>{progress.completed[today.id] ? "Do it again" : "Start workout"}</button></section><section className="week-strip" aria-label="Weekly workouts">{PROGRAM.map((day) => <button key={day.id} onClick={() => startWorkout(day)} className={progress.completed[day.id] ? "day-dot done" : "day-dot"}><small>{day.day.slice(0, 3)}</small><span>{progress.completed[day.id] ? "✓" : day.icon}</span></button>)}</section><section className="stats-grid"><article className="card stat"><span>✦</span><strong>{completedCount}</strong><small>Workouts complete</small></article><article className="card stat"><span>♡</span><strong>{latest ? latest.weight : "—"}</strong><small>Latest weight (lb)</small></article></section><section className="card coach-card"><span className="coach-icon">☀</span><div><p className="eyebrow">COACH&apos;S NOTE</p><h3>Keep it comfortable</h3><p>Your first goal is learning—not exhaustion. Finish feeling like you could do a little more.</p></div></section></>}
    {tab === "calendar" && <section><p className="eyebrow">WORKOUT CALENDAR</p><h2 className="page-title">Your training month</h2><p className="page-intro">Tap any date to see the planned workout or review what you completed.</p><div className="card calendar-card"><div className="calendar-header"><button aria-label="Previous month" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}>‹</button><h3>{calendarMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h3><button aria-label="Next month" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}>›</button></div><div className="calendar-weekdays" aria-hidden="true">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-grid">{monthCells.map((date) => { const key = dateKey(date); const planned = workoutForDate(date); const sessions = progress.sessions.filter((session) => session.date === key); const legacyDone = planned && progress.completed[planned.id] === key; const done = sessions.length > 0 || legacyDone; const isToday = key === localDate(); const outside = date.getMonth() !== calendarMonth.getMonth(); return <button key={key} className={`${outside ? "outside " : ""}${isToday ? "today " : ""}${done ? "completed" : planned ? "planned" : "rest"}`} onClick={() => setSelectedDate(key)} aria-label={`${displayDate(key)}. ${done ? `${sessions.length || 1} workout completed` : planned ? `${planned.title} planned` : "Recovery day"}`}><span>{date.getDate()}</span>{done ? <b>✓</b> : planned ? <i>{planned.icon}</i> : null}</button>; })}</div><div className="calendar-legend"><span><i className="legend-planned" /> Planned</span><span><i className="legend-completed" /> Completed</span><span><i className="legend-today" /> Today</span></div></div></section>}
    {tab === "progress" && <section><p className="eyebrow">PRIVATE PROGRESS</p><h2 className="page-title">Your workout history</h2><p className="page-intro">See what you actually completed. Measurements are optional trend data—not grades.</p><button className="primary-button" onClick={() => setShowCheckIn(true)}>Add weekly check-in</button><div className="stats-grid progress-stats"><article className="card stat"><strong>{completedCount}</strong><small>Sessions</small></article><article className="card stat"><strong>{weightChange === null ? "—" : `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)}`}</strong><small>Weight trend (lb)</small></article></div><h3 className="section-title">Completed workouts</h3><div className="history-list">{progress.sessions.map((session) => <button className="card history-row" key={session.id} onClick={() => setExpandedSession(session)}><span><strong>{session.title}</strong><small>{displayDate(session.date)} · {session.durationMinutes} min</small></span><span>View ›</span></button>)}{!progress.sessions.length && <div className="empty-state"><span>✦</span><h3>Your detailed history starts next workout</h3><p>Earlier completion totals are still preserved.</p></div>}</div><h3 className="section-title">Body check-ins</h3><div className="checkin-list">{progress.checkIns.map((entry) => <article className="card checkin-row" key={entry.id}><div><strong>{entry.weight} lb</strong><small>{displayDate(entry.date)}</small></div>{entry.waist && <span>{entry.waist} in waist</span>}</article>)}{!progress.checkIns.length && <div className="empty-state"><span>♡</span><h3>Your first trend starts here</h3><p>Check-ins stay on this device.</p></div>}</div></section>}
    {tab === "learn" && <section><p className="eyebrow">EXERCISE LIBRARY</p><h2 className="page-title">Learn before you lift</h2><p className="page-intro">Every movement includes setup steps and a simple form reminder. Equipment exercises keep their movement animation and setup reference together.</p><div className="library-grid">{allExercises.map((exercise) => <article className="card library-card" key={exercise.id}>{exercise.media ? <button className="library-media" onClick={() => setExpandedMedia(exercise.media)} aria-label={`Enlarge ${exercise.name} demonstration`}><img src={`${MEDIA_BASE}${exercise.media.src}`} alt={exercise.media.alt} /></button> : <span>{exercise.icon}</span>}<div><p className="eyebrow">{exercise.type}</p><h3>{exercise.name}</h3><p>{exercise.cue}</p>{exercise.media && <small className="media-source">{exercise.media.label}{exercise.media.reference ? " · Setup reference included" : ""}</small>}</div></article>)}</div></section>}
    {tab === "profile" && <section><p className="eyebrow">MY PROFILE</p><h2 className="page-title">Built for your home gym</h2><div className="card profile-card"><div className="profile-avatar">KF</div><h3>Foundation Beginner</h3><p>Five planned workouts · Under 60 minutes</p></div><div className="card"><h3>Available equipment</h3><div className="equipment-tags"><span>iFIT rower</span><span>Treadmill</span><span>Smith machine</span><span>Cable station</span><span>Bench</span><span>Dumbbells</span><span>Plates</span></div></div><div className="card safety-card"><h3>Train safely</h3><p>Use an adult spotter for unfamiliar equipment. Keep weights light while learning. Stop for sharp pain, dizziness, chest pain, or unusual breathing trouble.</p></div><div className="card privacy-card"><h3>Your data is private</h3><p>Workout history and measurements are stored only in this browser on this device.</p></div></section>}
  </main>{expandedMedia && <MediaModal media={expandedMedia} close={() => setExpandedMedia(null)} />}{expandedSession && <SessionModal session={expandedSession} close={() => setExpandedSession(null)} />}{selectedDate && <div className="modal-backdrop"><section className="modal calendar-modal" role="dialog" aria-modal="true" aria-labelledby="calendar-date-title"><button className="modal-close" aria-label="Close calendar day" onClick={() => setSelectedDate(null)}>×</button><p className="eyebrow">{selectedDateObject?.toLocaleDateString(undefined, { weekday: "long" })}</p><h2 id="calendar-date-title">{displayDate(selectedDate)}</h2>{selectedWorkout ? <div className="calendar-workout"><span className="plan-icon">{selectedWorkout.icon}</span><div><p className="eyebrow">PLANNED WORKOUT</p><h3>{selectedWorkout.title}</h3><p>{selectedWorkout.focus}</p></div></div> : <div className="empty-state compact"><span>♡</span><h3>Recovery day</h3><p>Rest or enjoy an easy family activity.</p></div>}{selectedSessions.map((session) => <button className="card history-row" key={session.id} onClick={() => { setSelectedDate(null); setExpandedSession(session); }}><span><strong>✓ {session.title}</strong><small>{session.durationMinutes} minutes · Completed</small></span><span>View ›</span></button>)}{selectedWorkout && <button className="primary-button calendar-start" onClick={() => { setSelectedDate(null); startWorkout(selectedWorkout); }}>{selectedSessions.length ? "Repeat workout" : "Start workout"}</button>}</section></div>}{showCheckIn && <div className="modal-backdrop"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="checkin-title"><button className="modal-close" aria-label="Close check-in" onClick={() => setShowCheckIn(false)}>×</button><p className="eyebrow">WEEKLY CHECK-IN</p><h2 id="checkin-title">How are things trending?</h2><form onSubmit={saveCheckIn}><label>Weight (lb)<input value={weight} onChange={(event) => setWeight(event.target.value)} type="number" inputMode="decimal" step="0.1" required /></label><label>Waist (inches) <small>Optional</small><input value={waist} onChange={(event) => setWaist(event.target.value)} type="number" inputMode="decimal" step="0.1" /></label><p className="form-note">This is one data point—not a grade. Weekly trends matter more than daily changes.</p><button className="primary-button" type="submit">Save private check-in</button></form></section></div>}<nav className="bottom-nav" aria-label="Primary navigation">{([["home","⌂","Home"],["calendar","□","Calendar"],["progress","↗","Progress"],["learn","◈","Learn"],["profile","○","Profile"]] as const).map(([id, icon, label]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}><b>{icon}</b><span>{label}</span></button>)}</nav></div>;
}

function MediaModal({ media, close }: { media: NonNullable<Exercise["media"]>; close: () => void }) {
  return <div className="modal-backdrop"><section className="modal media-modal" role="dialog" aria-modal="true" aria-labelledby="media-title"><button className="modal-close" aria-label="Close exercise demonstration" onClick={close}>×</button><p className="eyebrow">EXERCISE DEMONSTRATION</p><h2 id="media-title">{media.label}</h2><img src={`${MEDIA_BASE}${media.src}`} alt={media.alt} /><p>{media.alt}.</p><small>Written setup, movement, and safety cues remain the authoritative guide.</small></section></div>;
}

function SessionModal({ session, close }: { session: WorkoutSession; close: () => void }) {
  return <div className="modal-backdrop"><section className="modal history-modal" role="dialog" aria-modal="true" aria-labelledby="history-title"><button className="modal-close" aria-label="Close workout history" onClick={close}>×</button><p className="eyebrow">COMPLETED {displayDate(session.date)}</p><h2 id="history-title">{session.title}</h2><p className="history-summary">Workout time: {session.durationMinutes} minutes</p><div className="history-exercises">{session.exercises.map((exercise) => <article key={exercise.id}><h3>{exercise.name}</h3><small>{exercise.prescription}</small>{exercise.sets.length > 0 && <div className="history-sets">{exercise.sets.map((set, index) => <span key={index}>Set {index + 1}: {set.done ? "✓" : "Not marked"}{set.weight ? ` · ${set.weight} lb` : ""}{set.reps ? ` · ${set.reps} reps` : ""}</span>)}</div>}{exercise.cardio && <p>{exercise.cardio.minutes ? `${exercise.cardio.minutes} min` : "Duration not entered"}{exercise.cardio.distance ? ` · ${exercise.cardio.distance}` : ""}{exercise.cardio.effort ? ` · ${exercise.cardio.effort}` : ""}{exercise.cardio.enjoyment ? ` · ${exercise.cardio.enjoyment}` : ""}</p>}</article>)}</div></section></div>;
}
