import { useEffect, useState } from "react";

/**
 * Circular progress ring showing calories consumed vs. daily goal.
 * Fill animates in on mount (respects prefers-reduced-motion via CSS).
 */
export default function CalorieRing({ consumed = 0, goal = 2000, size = 180 }) {
  const [animatedPct, setAnimatedPct] = useState(0);
  const pct = Math.min(consumed / goal, 1);
  const remaining = Math.max(goal - consumed, 0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimatedPct(pct));
    return () => cancelAnimationFrame(id);
  }, [pct]);

  const stroke = 14;
  const radius = size / 2 - stroke;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - animatedPct);

  return (
    <div className="calorie-ring-wrap">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${consumed} of ${goal} calories consumed today, ${remaining} remaining`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(247,245,238,0.15)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--lime)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.9s ease" }}
        />
      </svg>
      <div className="calorie-ring-figures">
        <span className="big mono-num">{consumed.toLocaleString()}</span>
        <span className="label">of {goal.toLocaleString()} kcal</span>
      </div>
    </div>
  );
}
