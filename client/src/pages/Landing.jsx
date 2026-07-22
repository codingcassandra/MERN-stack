import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Landing.css";

export default function Landing() {
  return (
    <>
      <Navbar user={null} />

      <main>
        <section className="hero">
          <div className="container hero-inner">
            <div className="hero-copy">
              <p className="eyebrow">Serving size: your whole day</p>
              <h1 className="hero-title">
                Track what
                <br />
                fuels you.
              </h1>
              <p className="hero-sub">
                Log meals in seconds, see exactly where your calories and macros are
                going, and build habits that hold up outside a spreadsheet.
              </p>
              <div className="hero-actions">
                <Link to="/login?mode=signup" className="btn btn-primary">
                  Start tracking free
                </Link>
                <Link to="/login" className="btn btn-ghost">
                  I have an account
                </Link>
              </div>
            </div>

            {/* Signature element: hero-scale nutrition label */}
            <div className="hero-label" aria-hidden="true">
              <div className="hero-label-title">Daily Fuel Facts</div>
              <div className="hero-label-rule thick" />
              <div className="hero-label-row">
                <span>Calories</span>
                <span className="mono-num">1,840</span>
              </div>
              <div className="hero-label-rule" />
              <div className="hero-label-row small">
                <span>Protein</span>
                <span className="mono-num">132g</span>
              </div>
              <div className="hero-label-row small">
                <span>Carbs</span>
                <span className="mono-num">190g</span>
              </div>
              <div className="hero-label-row small">
                <span>Fat</span>
                <span className="mono-num">58g</span>
              </div>
              <div className="hero-label-rule thick" />
              <div className="hero-label-row small muted">
                <span>Logged today</span>
                <span className="mono-num">6 meals</span>
              </div>
            </div>
          </div>
        </section>

        <section className="features">
          <div className="container">
            <h2 className="features-heading">Everything on the label, none of the guesswork</h2>
            <div className="features-grid">
              <div className="feature">
                <p className="eyebrow">01 — Log</p>
                <h3>Search real food data</h3>
                <p>
                  Pull verified nutrition data as you type and log a meal before your
                  coffee gets cold.
                </p>
              </div>
              <div className="feature">
                <p className="eyebrow">02 — See</p>
                <h3>Read your day at a glance</h3>
                <p>
                  Calories, protein, carbs, and fat laid out like a label you actually
                  want to read.
                </p>
              </div>
              <div className="feature">
                <p className="eyebrow">03 — Adjust</p>
                <h3>Stay honest, not restrictive</h3>
                <p>
                  Set a goal, see how today compares, and adjust tomorrow — no shame,
                  just data.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} NutriFuel. Built for a CS full-stack project.</p>
        </div>
      </footer>
    </>
  );
}
