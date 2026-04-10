export default function StatsCard({ label, value, icon }) {
  return (
    <div className="stats-card">
      <div className="stats-card-icon">
        {icon}
      </div>
      <div className="stats-card-label">{label}</div>
      <div className="stats-card-value">{value}</div>
    </div>
  );
}
