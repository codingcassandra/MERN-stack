export default function StatCard({ label, value, unit, meta, accent }) {
  return (
    <div className={`stat-card${accent ? ` accent-${accent}` : ""}`}>
      <p className="stat-card-label">{label}</p>
      <span className="stat-card-value">
        {value}
        {unit && <small> {unit}</small>}
      </span>
      {meta && <p className="stat-card-meta">{meta}</p>}
    </div>
  );
}
