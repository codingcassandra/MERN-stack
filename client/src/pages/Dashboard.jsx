import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import CalorieRing from "../components/CalorieRing";
import api from "../api/client";
import "./Dashboard.css";

const FALLBACK = {
  calories: { consumed: 1480, goal: 2100 },
  protein: { value: 92, goal: 140 },
  carbs: { value: 150, goal: 230 },
  fats: { value: 46, goal: 70 },
  meals: [
    { name: "Greek yogurt & berries", calories: 260, time: "7:40 AM" },
    { name: "Grilled chicken bowl", calories: 610, time: "12:20 PM" },
    { name: "Almonds (1 oz)", calories: 165, time: "3:00 PM" },
    { name: "Salmon, rice, broccoli", calories: 445, time: "6:45 PM" },
  ],
};

export default function Dashboard({ user }) {
  const [data, setData] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .getDashboard()
      .then((res) => active && setData(res))
      .catch(() => {
        /* keep fallback demo data if the API isn't reachable yet */
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <Navbar user={user ?? { name: "Jordan Ray" }} />
      <main className="container dashboard">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
            <h1>Today's fuel</h1>
          </div>
          <a href="/search" className="btn btn-primary">
            + Log food
          </a>
        </header>

        {loading && <p className="eyebrow">Loading today's data…</p>}

        <div className="dashboard-grid">
          <CalorieRing consumed={data.calories.consumed} goal={data.calories.goal} />

          <div className="label-panel macro-panel">
            <p className="label-panel-title">Macros</p>
            <p className="label-panel-sub">Amount per day · goal in parentheses</p>

            <div className="label-row thick">
              <span className="label-row-name">Protein</span>
              <span className="label-row-value">
                {data.protein.value}g{" "}
                <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
                  ({data.protein.goal}g)
                </span>
              </span>
            </div>
            <div className="label-row">
              <span className="label-row-name">Carbohydrates</span>
              <span className="label-row-value">
                {data.carbs.value}g{" "}
                <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
                  ({data.carbs.goal}g)
                </span>
              </span>
            </div>
            <div className="label-row">
              <span className="label-row-name">Fat</span>
              <span className="label-row-value">
                {data.fats.value}g{" "}
                <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
                  ({data.fats.goal}g)
                </span>
              </span>
            </div>
          </div>

          <StatCard
            label="Calories remaining"
            value={Math.max(data.calories.goal - data.calories.consumed, 0)}
            unit="kcal"
            meta="Based on today's goal"
            accent="lime"
          />
          <StatCard
            label="Meals logged"
            value={data.meals.length}
            meta="Tap “Log food” to add another"
            accent="coral"
          />
        </div>

        <section className="recent-meals">
          <h2 className="section-heading">Logged today</h2>
          <div className="label-panel">
            {data.meals.map((meal, i) => (
              <div className={`label-row${i === data.meals.length - 1 ? "" : ""}`} key={meal.name + i}>
                <span className="label-row-name">
                  {meal.name}
                  <span className="eyebrow" style={{ display: "block" }}>
                    {meal.time}
                  </span>
                </span>
                <span className="label-row-value">{meal.calories} kcal</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
