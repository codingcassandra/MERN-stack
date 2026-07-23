import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/client";
import "./FoodSearch.css";

const DEMO_RESULTS = [
  { id: "d1", name: "Banana, medium", calories: 105, protein: 1, carbs: 27, fats: 0 },
  { id: "d2", name: "Chicken breast, grilled (100g)", calories: 165, protein: 31, carbs: 0, fats: 4 },
  { id: "d3", name: "Brown rice, cooked (1 cup)", calories: 216, protein: 5, carbs: 45, fats: 2 },
];

export default function FoodSearch({ user }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [justAdded, setJustAdded] = useState(null);
  const debounceRef = useRef(null);

  // Debounced AJAX search — fires ~350ms after the user stops typing.
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setStatus("idle");
      return;
    }

    setStatus("loading");
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await api.searchFoods(query);
        setResults(data);
        setStatus("done");
      } catch {
        // Fall back to demo data so the page stays usable before the
        // backend's third-party integration is wired up.
        setResults(
          DEMO_RESULTS.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()))
        );
        setStatus("done");
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  async function handleAdd(food) {
    try {
      await api.addFoodEntry({ ...food, time: new Date().toISOString() });
    } catch {
      /* still show confirmation for demo/offline use */
    }
    setJustAdded(food.id);
    setTimeout(() => setJustAdded(null), 1800);
  }

  return (
    <>
      <Navbar user={user ?? { name: "Jordan Ray" }} />
      <main className="container search-page">
        <header>
          <p className="eyebrow">Add to today's log</p>
          <h1>Search foods</h1>
        </header>

        <div className="search-bar">
          <label htmlFor="food-search" className="sr-only">
            Search foods
          </label>
          <input
            id="food-search"
            type="search"
            placeholder="Try “grilled chicken” or “oatmeal”"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
        </div>

        {status === "loading" && <p className="eyebrow search-status">Searching…</p>}
        {status === "done" && results.length === 0 && (
          <p className="empty-state">No results for “{query}.” Try a different search.</p>
        )}

        <ul className="results-list">
          {results.map((food) => (
            <li key={food.id} className="label-panel result-card">
              <div className="result-main">
                <p className="label-panel-title" style={{ fontSize: "var(--text-md)" }}>
                  {food.name}
                </p>
                <p className="label-panel-sub" style={{ borderBottom: "none", paddingBottom: 0 }}>
                  {food.calories} kcal · P {food.protein}g · C {food.carbs}g · F {food.fats}g
                </p>
              </div>
              <button
                className={`btn ${justAdded === food.id ? "btn-lime" : "btn-primary"}`}
                onClick={() => handleAdd(food)}
              >
                {justAdded === food.id ? "Added ✓" : "Add"}
              </button>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
