import React from 'react';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';

export default function RequestDetails({ request, onBack }) {
  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <button onClick={onBack} style={{
        background: 'none', border: 'none', color: '#3B82F6', fontSize: 14,
        fontWeight: 600, cursor: 'pointer', padding: 0, marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        ← Back to Dashboard
      </button>

      <div style={{
        background: '#fff', borderRadius: 12, padding: 28, border: '1px solid #f0f0f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          flexWrap: 'wrap', gap: 12, marginBottom: 20,
        }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', margin: '0 0 4px' }}>
              {request.id}
            </h2>
            <span style={{ fontSize: 14, color: '#6b7280' }}>{request.serviceType}</span>
          </div>
          <StatusBadge status={request.status} />
        </div>

        <ProgressBar currentStage={request.stage} />

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 20, marginTop: 24, padding: '20px 0', borderTop: '1px solid #f0f0f0',
        }}>
          <div>
            <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Description</div>
            <div style={{ fontSize: 14, color: '#374151' }}>{request.description}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Location</div>
            <div style={{ fontSize: 14, color: '#374151' }}>{request.location}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Date Submitted</div>
            <div style={{ fontSize: 14, color: '#374151' }}>{request.date}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Assigned Technician</div>
            <div style={{ fontSize: 14, color: '#374151' }}>{request.technician || 'Not yet assigned'}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Expected Completion</div>
            <div style={{ fontSize: 14, color: '#374151' }}>{request.expectedCompletion || 'TBD'}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Inspector Status</div>
            <div style={{ marginTop: 4 }}>
              <StatusBadge status={request.inspectorStatus || 'Not Solved'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
