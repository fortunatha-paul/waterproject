import React from 'react';

const STATUS_COLORS = {
  Pending: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
  'In Progress': { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' },
  Completed: { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
  Rejected: { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
};

export default function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.Pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 600,
      background: c.bg, color: c.text,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}
