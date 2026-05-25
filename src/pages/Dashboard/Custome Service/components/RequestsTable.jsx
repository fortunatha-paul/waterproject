import React, { useState } from 'react';
import StatusBadge from './StatusBadge';

const FILTER_FIELDS = [
  { key: 'status', label: 'Status', options: ['All', 'Pending', 'In Progress', 'Completed', 'Rejected'] },
  { key: 'serviceType', label: 'Service Type', options: ['All', 'Meter Repair', 'Meter Replacement', 'No Water Supply'] },
  { key: 'location', label: 'Location', options: ['All', 'Block B, Sector 14', 'House 45, Lane 7', 'Flat 302, Tower A', 'Shop 12, Market Road', 'House 78, Sector 22', 'Block C, Sector 9'] },
];

export default function RequestsTable({ requests, onView, onAssign, onUpdate }) {
  const [filters, setFilters] = useState({ status: 'All', serviceType: 'All', location: 'All', dateFrom: '', dateTo: '', search: '' });
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filtered = requests
    .filter((r) => {
      if (filters.status !== 'All' && r.status !== filters.status) return false;
      if (filters.serviceType !== 'All' && r.serviceType !== filters.serviceType) return false;
      if (filters.location !== 'All' && r.location !== filters.location) return false;
      if (filters.dateFrom && r.date < filters.dateFrom) return false;
      if (filters.dateTo && r.date > filters.dateTo) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        return (
          r.id.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q) ||
          r.serviceType.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      if (sortField === 'date') { aVal = new Date(aVal); bVal = new Date(bVal); }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }) => (
    <span style={{ marginLeft: 4, fontSize: 10, opacity: sortField === field ? 1 : 0.3 }}>
      {sortField === field && sortDir === 'asc' ? '▲' : '▼'}
    </span>
  );

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
      {/* Filters Bar */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by ID, name, location..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          style={{
            flex: '1 1 220px', padding: '8px 12px', borderRadius: 8,
            border: '1px solid #d1d5db', fontSize: 13, outline: 'none',
          }}
        />
        {FILTER_FIELDS.map((f) => (
          <select
            key={f.key}
            value={filters[f.key]}
            onChange={(e) => handleFilterChange(f.key, e.target.value)}
            style={{
              padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db',
              fontSize: 13, background: '#fff', cursor: 'pointer', minWidth: 130,
              color: '#374151', appearance: 'auto', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            {f.options.map((o) => <option key={o} value={o}>{o === 'All' ? `${f.label}: All` : o}</option>)}
          </select>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="date" value={filters.dateFrom} onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 12 }}
          />
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>to</span>
          <input type="date" value={filters.dateTo} onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 12 }}
          />
        </div>
        <button
          onClick={() => setFilters({ status: 'All', serviceType: 'All', location: 'All', dateFrom: '', dateTo: '', search: '' })}
          style={{
            padding: '8px 14px', borderRadius: 8, border: '1px solid #d1d5db',
            background: '#F9FAFB', fontSize: 13, cursor: 'pointer', color: '#6b7280',
          }}
        >
          Clear
        </button>
      </div>

      {/* Table Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1f2937', margin: 0 }}>
          All Requests
        </h2>
        <span style={{ fontSize: 13, color: '#9CA3AF' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              {[
                { field: 'id', label: 'Request ID' },
                { field: 'customerName', label: 'Customer Name' },
                { field: 'serviceType', label: 'Service Type' },
                { field: 'location', label: 'Location' },
                { field: 'date', label: 'Date Submitted' },
                { field: 'status', label: 'Status' },
                { field: 'priority', label: 'Priority' },
                { field: 'assignedStaff', label: 'Assigned Staff' },
              ].map((col) => (
                <th
                  key={col.field}
                  onClick={() => toggleSort(col.field)}
                  style={{
                    padding: '12px 16px', textAlign: 'left', fontSize: 12,
                    fontWeight: 600, color: '#6b7280', textTransform: 'uppercase',
                    letterSpacing: '0.5px', borderBottom: '1px solid #E5E7EB',
                    cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
                  }}
                >
                  {col.label} <SortIcon field={col.field} />
                </th>
              ))}
              <th style={{
                padding: '12px 16px', textAlign: 'left', fontSize: 12,
                fontWeight: 600, color: '#6b7280', textTransform: 'uppercase',
                letterSpacing: '0.5px', borderBottom: '1px solid #E5E7EB',
              }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '40px 20px', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
                  No requests found matching your filters.
                </td>
              </tr>
            ) : (
              filtered.map((req) => (
                <tr
                  key={req.id}
                  style={{ borderBottom: '1px solid #f0f0f0', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FAFB')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#1f2937' }}>{req.id}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151' }}>{req.customerName}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151' }}>{req.serviceType}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>{req.location}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>{req.date}</td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge type="status" value={req.status} /></td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge type="priority" value={req.priority} /></td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: req.assignedStaff ? '#374151' : '#9CA3AF' }}>
                    {req.assignedStaff || 'Unassigned'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => onView(req)} style={actionBtnStyle('#3B82F6', '#EFF6FF')}>View</button>
                      <button onClick={() => onAssign(req)} style={actionBtnStyle('#8B5CF6', '#F5F3FF')}>Assign</button>
                      <button onClick={() => onUpdate(req)} style={actionBtnStyle('#F59E0B', '#FFFBEB')}>Update</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const actionBtnStyle = (color, bg) => ({
  padding: '5px 10px', borderRadius: 6, border: `1px solid ${color}`,
  background: bg, color, fontSize: 12, fontWeight: 600,
  cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
});
