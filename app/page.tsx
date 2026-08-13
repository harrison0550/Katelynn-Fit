"use client";

import { useEffect, useMemo, useState } from "react";
import { PROGRAM, type Exercise, type WorkoutDay } from "./program";

type Tab = "home" | "plan" | "progress" | "learn" | "profile";
type ProgressState = {
  completed: Record<string, string>;
  setChecks: Record<string, boolean>;
  checkIns: Array<{ id: string; date: string; weight: number; waist?: number }>;
};

const STORAGE_KEY = "katelynn-fit-v1";
const EMPTY_PROGRESS: ProgressState = { completed: {}, setChecks: {}, checkIns: [] };
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function localDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function findToday(): WorkoutDay {
  const name = dayNames[new Date().getDay()];
  return PROGRAM.find((day) => day.day === name) ?? PROGRAM[0];
}

function exerciseKey(dayId: string, exerciseId: string, set: number) {
  return `${dayId}:${exerciseId}:${set}`;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("home");
  const [progress, setProgress] = useState<ProgressState>(EMPTY_PROGRESS);
  const [activeDay, setActiveDay] = useState<WorkoutDay | null>(null);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const loadSavedProgress = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) setProgress({ ...EMPTY_PROGRESS, ...JSON.parse(saved) });
      } catch {
        setNotice("Your saved data could not be read. Nothing was replaced.");
      }
    }, 0);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => undefined);
    return () => window.clearTimeout(loadSavedProgress);
  }, []);

  function save(next: ProgressState, message?: string) {
    setProgress(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    if (message) {
      setNotice(message);
      window.setTimeout(() => setNotice(""), 3500);
    }
  }

  const today = findToday();
  const completedCount = Object.keys(progress.completed).length;
  const latest = progress.checkIns[0];
  const first = progress.checkIns.at(-1);
  const weightChange = latest && first && latest.id !== first.id ? latest.weight - first.weight : null;
  const allExercises = useMemo(() => {
    const unique = new Map<string, Exercise>();
    PROGRAM.forEach((day) => day.exercises.forEach((exercise) => unique.set(exercise.id, exercise)));
    return [...unique.values()];
  }, []);

  function startWorkout(day: WorkoutDay) {
    setActiveDay(day);
    setActiveExercise(null);
  }

  function toggleSet(exercise: Exercise, set: number) {
    if (!activeDay) return;
    const key = exerciseKey(activeDay.id, exercise.id, set);
    save({ ...progress, setChecks: { ...progress.setChecks, [key]: !progress.setChecks[key] } });
  }

  function finishWorkout() {
    if (!activeDay) return;
    save(
      { ...progress, completed: { ...progress.completed, [activeDay.id]: localDate() } },
      `${activeDay.title} complete. Nice work showing up!`,
    );
    setActiveDay(null);
    setTab("home");
  }

  function saveCheckIn(event: React.FormEvent) {
    event.preventDefault();
    const parsedWeight = Number(weight);
    const parsedWaist = waist ? Number(waist) : undefined;
    if (!Number.isFinite(parsedWeight) || parsedWeight < 70 || parsedWeight > 500) {
      setNotice("Enter a weight between 70 and 500 lb.");
      return;
    }
    const entry = { id: crypto.randomUUID(), date: localDate(), weight: parsedWeight, waist: parsedWaist };
    save({ ...progress, checkIns: [entry, ...progress.checkIns] }, "Private check-in saved on this device.");
    setWeight("");
    setWaist("");
    setShowCheckIn(false);
  }

  if (activeExercise && activeDay) {
    return (
      <main className="app-shell exercise-screen">
        <button className="back-button" onClick={() => setActiveExercise(null)}>← Back to workout</button>
        <div className="exercise-hero"><span>{activeExercise.icon}</span></div>
        <p className="eyebrow">{activeExercise.type}</p>
        <h1>{activeExercise.name}</h1>
        <p className="lead">{activeExercise.prescription}</p>
        <section className="card coaching-card">
          <h2>How to do it</h2>
          <ol>{activeExercise.steps.map((step) => <li key={step}>{step}</li>)}</ol>
        </section>
        <section className="card soft-card">
          <h2>Remember</h2>
          <p>{activeExercise.cue}</p>
          <p className="safety-copy">Stop if you feel sharp pain, dizziness, or unusual shortness of breath. Ask an adult for help with equipment setup.</p>
        </section>
        {activeExercise.sets > 0 && (
          <div className="set-grid">
            {Array.from({ length: activeExercise.sets }, (_, index) => index + 1).map((set) => {
              const checked = !!progress.setChecks[exerciseKey(activeDay.id, activeExercise.id, set)];
              return <button className={checked ? "set-button checked" : "set-button"} key={set} onClick={() => toggleSet(activeExercise, set)}>{checked ? "✓" : set}<small>Set {set}</small></button>;
            })}
          </div>
        )}
      </main>
    );
  }

  if (activeDay) {
    const strengthExercises = activeDay.exercises.filter((exercise) => exercise.sets > 0);
    const completedSets = strengthExercises.reduce((total, exercise) => total + Array.from({ length: exercise.sets }, (_, index) => !!progress.setChecks[exerciseKey(activeDay.id, exercise.id, index + 1)]).filter(Boolean).length, 0);
    const totalSets = strengthExercises.reduce((total, exercise) => total + exercise.sets, 0);
    return (
      <main className="app-shell workout-screen">
        <button className="back-button" onClick={() => setActiveDay(null)}>← Save and exit</button>
        <p className="eyebrow">{activeDay.day} · {activeDay.duration}</p>
        <h1>{activeDay.title}</h1>
        <p className="lead">{activeDay.focus}</p>
        <div className="progress-bar" aria-label={`${completedSets} of ${totalSets} strength sets complete`}><span style={{ width: totalSets ? `${(completedSets / totalSets) * 100}%` : "0%" }} /></div>
        <div className="workout-list">
          {activeDay.exercises.map((exercise, index) => (
            <button className="exercise-row" key={exercise.id} onClick={() => setActiveExercise(exercise)}>
              <span className="exercise-number">{index + 1}</span>
              <span><strong>{exercise.name}</strong><small>{exercise.prescription}</small></span>
              <span aria-hidden="true">›</span>
            </button>
          ))}
        </div>
        <button className="primary-button" onClick={finishWorkout}>Finish workout</button>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar"><div><p className="brand-kicker">KATELYNN&apos;S HOME GYM</p><h1>Katelynn Fit</h1></div><div className="avatar" aria-hidden="true">KF</div></header>
      {notice && <div className="notice" role="status">{notice}</div>}

      <main>
        {tab === "home" && (
          <>
            <section className="welcome"><p className="eyebrow">YOUR BEGINNER JOURNEY</p><h2>Stronger starts here.</h2><p>Learn the equipment, find cardio you enjoy, and build confidence one workout at a time.</p></section>
            <section className="card today-card">
              <div className="card-top"><span className="day-pill">{today.day}</span><span>{today.duration}</span></div>
              <p className="eyebrow">TODAY&apos;S PLAN</p><h2>{today.title}</h2><p>{today.focus}</p>
              <div className="workout-meta"><span>♥ Beginner friendly</span><span>◷ Under 1 hour</span></div>
              <button className="primary-button" onClick={() => startWorkout(today)}>{progress.completed[today.id] ? "Do it again" : "Start workout"}</button>
            </section>
            <section className="week-strip" aria-label="Weekly workouts">
              {PROGRAM.map((day) => <button key={day.id} onClick={() => startWorkout(day)} className={progress.completed[day.id] ? "day-dot done" : "day-dot"}><small>{day.day.slice(0, 3)}</small><span>{progress.completed[day.id] ? "✓" : day.icon}</span></button>)}
            </section>
            <section className="stats-grid"><article className="card stat"><span>✦</span><strong>{completedCount}</strong><small>Workouts complete</small></article><article className="card stat"><span>♡</span><strong>{latest ? `${latest.weight}` : "—"}</strong><small>Latest weight (lb)</small></article></section>
            <section className="card coach-card"><span className="coach-icon">☀</span><div><p className="eyebrow">COACH&apos;S NOTE</p><h3>Keep it comfortable</h3><p>Your first goal is learning—not exhaustion. Finish feeling like you could do a little more.</p></div></section>
          </>
        )}

        {tab === "plan" && (
          <section><p className="eyebrow">WEEKLY PLAN</p><h2 className="page-title">Five days to feel stronger</h2><p className="page-intro">Three strength days and two cardio discovery days. Saturday and Sunday are for rest, family activities, or an easy walk.</p><div className="plan-list">{PROGRAM.map((day) => <article className="card plan-card" key={day.id}><div className="plan-icon">{day.icon}</div><div><p className="eyebrow">{day.day} · {day.duration}</p><h3>{day.title}</h3><p>{day.focus}</p><button className="text-button" onClick={() => startWorkout(day)}>{progress.completed[day.id] ? "Repeat workout" : "View workout"} →</button></div></article>)}</div></section>
        )}

        {tab === "progress" && (
          <section><p className="eyebrow">PRIVATE PROGRESS</p><h2 className="page-title">Notice the trend, not one day</h2><p className="page-intro">Check in about once a week under similar conditions. Normal changes from water, meals, and hormones can move the scale.</p><button className="primary-button" onClick={() => setShowCheckIn(true)}>Add weekly check-in</button><div className="stats-grid progress-stats"><article className="card stat"><strong>{completedCount}</strong><small>Sessions</small></article><article className="card stat"><strong>{weightChange === null ? "—" : `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)}`}</strong><small>Weight trend (lb)</small></article></div><div className="checkin-list">{progress.checkIns.map((entry) => <article className="card checkin-row" key={entry.id}><div><strong>{entry.weight} lb</strong><small>{new Date(`${entry.date}T12:00:00`).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</small></div>{entry.waist && <span>{entry.waist} in waist</span>}</article>)}{!progress.checkIns.length && <div className="empty-state"><span>♡</span><h3>Your first trend starts here</h3><p>Check-ins stay on this device and are never displayed publicly.</p></div>}</div></section>
        )}

        {tab === "learn" && (
          <section><p className="eyebrow">EXERCISE LIBRARY</p><h2 className="page-title">Learn before you lift</h2><p className="page-intro">Every movement includes setup steps and a simple form reminder.</p><div className="library-grid">{allExercises.map((exercise) => <article className="card library-card" key={exercise.id}><span>{exercise.icon}</span><div><p className="eyebrow">{exercise.type}</p><h3>{exercise.name}</h3><p>{exercise.cue}</p></div></article>)}</div></section>
        )}

        {tab === "profile" && (
          <section><p className="eyebrow">MY PROFILE</p><h2 className="page-title">Built for your home gym</h2><div className="card profile-card"><div className="profile-avatar">KF</div><h3>Foundation Beginner</h3><p>Five planned workouts · Under 60 minutes</p></div><div className="card"><h3>Available equipment</h3><div className="equipment-tags"><span>iFIT rower</span><span>Treadmill</span><span>Smith machine</span><span>Cable station</span><span>Bench</span><span>Dumbbells</span><span>Plates</span></div></div><div className="card safety-card"><h3>Train safely</h3><p>Use an adult spotter for unfamiliar equipment. Keep weights light while learning. Stop for sharp pain, dizziness, chest pain, or unusual breathing trouble.</p></div><div className="card privacy-card"><h3>Your data is private</h3><p>Workout history and measurements are stored only in this browser on this device.</p></div></section>
        )}
      </main>

      {showCheckIn && <div className="modal-backdrop"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="checkin-title"><button className="modal-close" aria-label="Close check-in" onClick={() => setShowCheckIn(false)}>×</button><p className="eyebrow">WEEKLY CHECK-IN</p><h2 id="checkin-title">How are things trending?</h2><form onSubmit={saveCheckIn}><label>Weight (lb)<input value={weight} onChange={(event) => setWeight(event.target.value)} type="number" inputMode="decimal" step="0.1" required /></label><label>Waist (inches) <small>Optional</small><input value={waist} onChange={(event) => setWaist(event.target.value)} type="number" inputMode="decimal" step="0.1" /></label><p className="form-note">This is one data point—not a grade. Weekly trends matter more than daily changes.</p><button className="primary-button" type="submit">Save private check-in</button></form></section></div>}

      <nav className="bottom-nav" aria-label="Primary navigation">
        {([['home','⌂','Home'],['plan','▦','Plan'],['progress','↗','Progress'],['learn','◇','Learn'],['profile','○','Profile']] as const).map(([id, icon, label]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}><b>{icon}</b><span>{label}</span></button>)}
      </nav>
    </div>
  );
}
