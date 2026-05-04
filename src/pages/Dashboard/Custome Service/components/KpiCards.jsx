import React from 'react';

const cardConfig = [
  { key: 'total', icon: '📥', label: 'Total Requests', color: '#6366F1', bg: '#EEF2FF' },
  { key: 'pending', icon: '⏳', label: 'Pending Requests', color: '#F59E0B', bg: '#FFFBEB' },
  { key: 'inProgress', icon: '🔧', label: 'In Progress', color: '#3B82F6', bg: '#EFF6FF' },
  { key: 'completed', icon: '✅', label: 'Completed', color: '#10B981', bg: '#ECFDF5' },
  { key: 'urgent', icon: '🚨', label: 'Urgent / High Priority', color: '#EF4444', bg: '#FEF2F2' },
];

export default function KpiCards({ stats }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
      {cardConfig.map((c) => (
        <div
          key={c.key}
          style={{
            flex: '1 1 180px',
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #f0f0f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            padding: '20px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'default',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
          }}
        >
          <div style={{
            width: 46, height: 46, borderRadius: 12,
            background: c.bg, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 22,
          }}>
            {c.icon}
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, marginBottom: 2 }}>
              {c.label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#000000' }}>
              {stats[c.key] ?? 0}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
