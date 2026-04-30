import React from 'react';

const statusStyles = {
  Pending: { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' },
  'In Progress': { bg: '#DBEAFE', color: '#1E40AF', border: '#BFDBFE' },
  Completed: { bg: '#D1FAE5', color: '#065F46', border: '#A7F3D0' },
  Rejected: { bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' },
  Resolved: { bg: '#D1FAE5', color: '#065F46', border: '#A7F3D0' },
};

const priorityStyles = {
  Low: { bg: '#E0E7FF', color: '#3730A3', border: '#C7D2FE' },
  Medium: { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' },
  High: { bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' },
  Urgent: { bg: '#FEE2E2', color: '#7F1D1D', border: '#FCA5A5' },
};

export default function StatusBadge({ type = 'status', value }) {
  const styles = type === 'priority' ? priorityStyles : statusStyles;
  const s = styles[value] || { bg: '#F3F4F6', color: '#4B5563', border: '#E5E7EB' };

  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: 6,
      fontSize: 12,
      fontWeight: 600,
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
    }}>
      {value}
    </span>
  );
}
