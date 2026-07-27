import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/client";
import "./WorkoutLog.css";

const MUSCLE_GROUPS = ["chest", "back", "legs", "shoulders", "arms", "core"];

const emptyExercise = () => ({ name: "", muscleGroup: MUSCLE_GROUPS[0], sets: "", reps: "", weight: "" });

const emptyForm = () => ({
  workoutType: "",
  duration: "",
  caloriesBurned: "",
  exercises: [emptyExercise()],
});

export default function WorkoutLog({ user }) {
  const [workouts, setWorkouts] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [status, setStatus] = useState("idle"); // idle | saving | error
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api
      .getWorkouts()
      .then((res) => active && setWorkouts(res))
      .catch(() => {
        /* stay on an empty list if the backend isn't reachable */
      });
    return () => {
      active = false;
    };
  }, []);

  const updateField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const updateExercise = (index, field) => (e) => {
    const value = e.target.value;
    setForm((f) => ({
      ...f,
      exercises: f.exercises.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex)),
    }));
  };

  const addExerciseRow = () => setForm((f) => ({ ...f, exercises: [...f.exercises, emptyExercise()] }));

  const removeExerciseRow = (index) =>
    setForm((f) => ({ ...f, exercises: f.exercises.filter((_, i) => i !== index) }));

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("saving");
    setError("");

    const payload = {
      workoutType: form.workoutType,
      duration: Number(form.duration) || 0,
      caloriesBurned: Number(form.caloriesBurned) || 0,
      exercises: form.exercises.map((ex) => ({
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        sets: Number(ex.sets) || 0,
        reps: Number(ex.reps) || undefined,
        weight: Number(ex.weight) || undefined,
      })),
    };

    try {
      const created = await api.addWorkout(payload);
      setWorkouts((list) => [created, ...list]);
      setForm(emptyForm());
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err.message || "Couldn't save that workout. Please try again.");
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteWorkout(id);
    } catch {
      /* still remove locally so the UI doesn't get stuck */
    }
    setWorkouts((list) => list.filter((w) => (w.id ?? w._id) !== id));
  }

  return (
    <>
      <Navbar user={user ?? { name: "Jordan Ray" }} />
      <main className="container workout-page">
        <header className="workout-header">
          <p className="eyebrow">Today</p>
          <h1>Log workout</h1>
        </header>

        <div className="workout-grid">
          <form className="label-panel" onSubmit={handleSubmit}>
            <p className="label-panel-title">New session</p>
            <p className="label-panel-sub">Tag each exercise with the muscle group it trains</p>

            {status === "error" && (
              <p className="banner banner-error" role="alert">
                {error}
              </p>
            )}

            <div className="field">
              <label htmlFor="workoutType">Session name</label>
              <input
                id="workoutType"
                type="text"
                required
                placeholder="Leg day"
                value={form.workoutType}
                onChange={updateField("workoutType")}
              />
            </div>

            <div className="goal-row">
              <div className="field">
                <label htmlFor="duration">Duration (min)</label>
                <input
                  id="duration"
                  type="number"
                  min="0"
                  required
                  value={form.duration}
                  onChange={updateField("duration")}
                />
              </div>
              <div className="field">
                <label htmlFor="caloriesBurned">Calories burned</label>
                <input
                  id="caloriesBurned"
                  type="number"
                  min="0"
                  value={form.caloriesBurned}
                  onChange={updateField("caloriesBurned")}
                />
              </div>
            </div>

            <p className="label-panel-title exercises-title">Exercises</p>

            {form.exercises.map((ex, i) => (
              <div className="exercise-row" key={i}>
                <div className="field exercise-name">
                  <label htmlFor={`ex-name-${i}`}>Exercise</label>
                  <input
                    id={`ex-name-${i}`}
                    type="text"
                    required
                    placeholder="Squat"
                    value={ex.name}
                    onChange={updateExercise(i, "name")}
                  />
                </div>
                <div className="field exercise-group">
                  <label htmlFor={`ex-group-${i}`}>Muscle group</label>
                  <select id={`ex-group-${i}`} value={ex.muscleGroup} onChange={updateExercise(i, "muscleGroup")}>
                    {MUSCLE_GROUPS.map((group) => (
                      <option key={group} value={group}>
                        {group[0].toUpperCase() + group.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field exercise-num">
                  <label htmlFor={`ex-sets-${i}`}>Sets</label>
                  <input
                    id={`ex-sets-${i}`}
                    type="number"
                    min="0"
                    required
                    value={ex.sets}
                    onChange={updateExercise(i, "sets")}
                  />
                </div>
                <div className="field exercise-num">
                  <label htmlFor={`ex-reps-${i}`}>Reps</label>
                  <input
                    id={`ex-reps-${i}`}
                    type="number"
                    min="0"
                    value={ex.reps}
                    onChange={updateExercise(i, "reps")}
                  />
                </div>
                <div className="field exercise-num">
                  <label htmlFor={`ex-weight-${i}`}>Weight</label>
                  <input
                    id={`ex-weight-${i}`}
                    type="number"
                    min="0"
                    value={ex.weight}
                    onChange={updateExercise(i, "weight")}
                  />
                </div>
                {form.exercises.length > 1 && (
                  <button
                    type="button"
                    className="receipt-remove exercise-remove"
                    onClick={() => removeExerciseRow(i)}
                    aria-label={`Remove exercise ${i + 1}`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}

            <button type="button" className="btn btn-ghost btn-block" onClick={addExerciseRow}>
              + Add exercise
            </button>

            <button type="submit" className="btn btn-primary btn-block" disabled={status === "saving"}>
              {status === "saving" ? "Saving…" : "Log workout"}
            </button>
          </form>

          <div className="label-panel">
            <p className="label-panel-title">Logged sessions</p>
            <p className="label-panel-sub">{workouts.length} sessions</p>

            {workouts.length === 0 ? (
              <p className="empty-state">No workouts logged yet. Add your first session.</p>
            ) : (
              <ul className="receipt-list">
                {workouts.map((w) => (
                  <li className="receipt-row workout-row" key={w.id ?? w._id}>
                    <div className="receipt-row-main">
                      <span className="receipt-name">{w.workoutType}</span>
                      <span className="eyebrow">
                        {w.exercises.map((ex) => ex.muscleGroup).join(", ")} · {w.duration} min
                      </span>
                    </div>
                    <span className="receipt-kcal mono-num">{w.caloriesBurned} kcal</span>
                    <button
                      className="receipt-remove"
                      onClick={() => handleDelete(w.id ?? w._id)}
                      aria-label={`Remove ${w.workoutType} from log`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
