import React from 'react';

export default function SummaryCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '20px 24px',
      display: 'flex', alignItems: 'center', gap: 16,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0',
      flex: '1 1 200px', minWidth: 200,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: color + '18', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 22, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1.1 }}>{value}</div>
      </div>
    </div>
  );
}
