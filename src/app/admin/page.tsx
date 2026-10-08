export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-text-primary">
          Admin <span className="gradient-text">Dashboard</span>
        </h1>
        <p className="text-sm text-text-secondary">
          Manage users, events, and platform metrics.
        </p>
      </div>

      {/* Placeholder cards for Phase 7 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: "—", icon: "👥" },
          { label: "Total Events", value: "—", icon: "📍" },
          { label: "New Signups (Today)", value: "—", icon: "📈" },
          { label: "Reports Pending", value: "—", icon: "🚩" },
        ].map((card) => (
          <div
            key={card.label}
            className="glass rounded-[var(--radius-lg)] p-5 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                {card.label}
              </span>
              <span className="text-lg">{card.icon}</span>
            </div>
            <p className="text-2xl font-bold text-text-primary">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-[var(--radius-lg)] p-8 text-center">
        <p className="text-text-muted text-sm">
          Full admin dashboard (user management, moderation, metrics) will be built in Phase 7.
        </p>
      </div>
    </div>
  );
}
