import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard | Bus Management' };

export default function DashboardPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page header */}
      <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
          Overview of your bus management system
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
        {[
          { label: 'Total Buses',   value: '—', icon: '🚌', color: 'var(--color-primary)' },
          { label: 'Active Drivers', value: '—', icon: '👤', color: 'var(--color-accent)' },
          { label: 'Routes',         value: '—', icon: '🗺️', color: 'var(--color-success)' },
          { label: 'Staff Members',  value: '—', icon: '🏢', color: 'var(--color-warning)' },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: 'var(--color-surface)',
              border: '1.5px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>{stat.icon}</div>
            <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: stat.color }}>
              {stat.value}
            </p>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Coming soon banner */}
      <div style={{
        background: 'var(--color-primary-light)',
        border: '1.5px solid var(--color-primary-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-primary)' }}>
          🚌 More features coming soon
        </p>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: '8px' }}>
          Bus routes, driver management, pass tracking and more will be added here.
        </p>
      </div>
    </div>
  );
}
