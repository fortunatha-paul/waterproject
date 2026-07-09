import React from 'react';

export default function MDReportViewer({ report, onClose }) {
  if (!report) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
      <div style={{ width: '90%', maxWidth: 900, background: '#fff', borderRadius: 12, overflow: 'auto', maxHeight: '90vh', boxShadow: '0 20px 60px rgba(2,6,23,0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid #eef2f7' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{report.title}</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Report by {report.inspector ? report.inspector.name : 'Inspector'} — {report.visit_date}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Close</button>
          </div>
        </div>

        <div style={{ padding: 20, display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase' }}>Area Visited</div>
              <div style={{ fontSize: 14, color: '#111827' }}>{report.area_visited || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase' }}>Related Request</div>
              <div style={{ fontSize: 14, color: '#0f172a' }}>{report.request ? `REQ-${report.request.id}` : '—'}</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase' }}>Findings</div>
            <div style={{ fontSize: 14, color: '#374151', whiteSpace: 'pre-wrap' }}>{report.findings || '—'}</div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase' }}>Work Done</div>
            <div style={{ fontSize: 14, color: '#374151', whiteSpace: 'pre-wrap' }}>{report.work_done || '—'}</div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase' }}>Recommendations</div>
            <div style={{ fontSize: 14, color: '#374151', whiteSpace: 'pre-wrap' }}>{report.recommendations || '—'}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase' }}>Water Supply</div>
              <div style={{ fontSize: 14, color: '#374151' }}>{report.water_supply_status || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase' }}>Pipe Condition</div>
              <div style={{ fontSize: 14, color: '#374151' }}>{report.pipe_condition || '—'}</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase' }}>Estimated Cost</div>
            <div style={{ fontSize: 14, color: '#374151' }}>{report.estimated_cost ? `Tsh ${report.estimated_cost}` : '—'}</div>
          </div>

          {report.images && report.images.length > 0 && (
            <div>
              <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase' }}>Images</div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                {report.images.map((img, idx) => (
                  <a key={idx} href={img} target="_blank" rel="noreferrer" style={{ display: 'inline-block' }}>
                    <img src={img} alt={`img-${idx}`} style={{ width: 140, height: 90, objectFit: 'cover', borderRadius: 8, border: '1px solid #E5E7EB' }} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
