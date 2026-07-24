import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/client";
import "./FoodLog.css";

const DEMO_ENTRIES = [
  { id: "1", name: "Greek yogurt & berries", calories: 260, protein: 18, time: "7:40 AM" },
  { id: "2", name: "Grilled chicken bowl", calories: 610, protein: 42, time: "12:20 PM" },
  { id: "3", name: "Almonds (1 oz)", calories: 165, protein: 6, time: "3:00 PM" },
  { id: "4", name: "Salmon, rice, broccoli", calories: 445, protein: 34, time: "6:45 PM" },
];

export default function FoodLog({ user }) {
  const [entries, setEntries] = useState(DEMO_ENTRIES);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    let active = true;
    api
      .getFoodLog()
      .then((res) => active && setEntries(res))
      .catch(() => {
        /* keep demo entries if backend isn't wired up yet */
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleDelete(id) {
    setRemovingId(id);
    try {
      await api.deleteFoodEntry(id);
    } catch {
      /* optimistic UI still removes it locally below */
    }
    setEntries((list) => list.filter((e) => e.id !== id));
    setRemovingId(null);
  }

  const totalKcal = entries.reduce((sum, e) => sum + e.calories, 0);

  return (
    <>
      <Navbar user={user ?? { name: "Jordan Ray" }} />
      <main className="container food-log-page">
        <header className="food-log-header">
          <div>
            <p className="eyebrow">Today</p>
            <h1>Food log</h1>
          </div>
          <a href="/search" className="btn btn-primary">
            + Log food
          </a>
        </header>

        <div className="label-panel receipt">
          <p className="label-panel-title">Itemized Log</p>
          <p className="label-panel-sub">{entries.length} items · {totalKcal} kcal total</p>

          {entries.length === 0 ? (
            <p className="empty-state">
              Nothing logged yet today. Search for a food to add your first entry.
            </p>
          ) : (
            <ul className="receipt-list">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className={`receipt-row${removingId === entry.id ? " removing" : ""}`}
                >
                  <div className="receipt-row-main">
                    <span className="receipt-name">{entry.name}</span>
                    <span className="eyebrow">{entry.time} · {entry.protein}g protein</span>
                  </div>
                  <span className="receipt-kcal mono-num">{entry.calories} kcal</span>
                  <button
                    className="receipt-remove"
                    onClick={() => handleDelete(entry.id)}
                    aria-label={`Remove ${entry.name} from log`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="label-row thick receipt-total">
            <span className="label-row-name">Total</span>
            <span className="label-row-value">{totalKcal} kcal</span>
          </div>
        </div>
      </main>
    </>
  );
}
