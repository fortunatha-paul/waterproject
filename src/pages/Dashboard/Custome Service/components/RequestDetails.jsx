import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import AssignTaskModal from './AssignTaskModal';

export default function RequestDetails({ request, onBack, onAssign, onStatusChange }) {
  const [newComment, setNewComment] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);

  if (!request) return null;

  const timeline = Array.isArray(request.timeline) ? request.timeline : [
    { date: request.date, event: 'Request Submitted', by: request.customerName },
    ...(request.assignedStaff ? [{ date: request.date, event: 'Assigned to ' + request.assignedStaff, by: 'System' }] : []),
    ...(request.status === 'Completed' ? [{ date: request.completedDate || '—', event: 'Request Completed', by: request.assignedStaff || 'System' }] : []),
  ];

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    if (onAssign) {
      onAssign({ ...request, comments: [...(request.comments || []), { text: newComment, by: 'Staff', date: new Date().toISOString().split('T')[0] }] });
    }
    setNewComment('');
  };

  const handleAssignClick = () => {
    setShowAssignModal(true);
  };

  const handleAssignSave = (updatedRequest) => {
    if (onAssign) {
      onAssign(updatedRequest);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', padding: '24px 32px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Back Button */}
        <button onClick={onBack} style={{
          padding: '8px 16px', borderRadius: 8, border: '1px solid #d1d5db',
          background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          color: '#374151', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6,
        }}>
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div style={{
          background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: '24px 28px', marginBottom: 20,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', marginBottom: 6 }}>
              {request.id} — {request.serviceType}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <StatusBadge type="status" value={request.status} />
              <StatusBadge type="priority" value={request.priority} />
              <span style={{ fontSize: 13, color: '#6b7280' }}>Submitted: {request.date}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleAssignClick} style={{
              padding: '8px 18px', borderRadius: 8, border: 'none',
              background: '#8B5CF6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              Assign / Edit
            </button>
            <button onClick={() => onStatusChange && onStatusChange(request)} style={{
              padding: '8px 18px', borderRadius: 8, border: 'none',
              background: '#3B82F6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              Update Status
            </button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Customer Info */}
            <Section title="Customer Information">
              <InfoRow label="Name" value={request.customerName} />
              <InfoRow label="Email" value={request.customerEmail || 'N/A'} />
              <InfoRow label="Phone" value={request.customerPhone || 'N/A'} />
              <InfoRow label="Location" value={request.location} />
            </Section>

            {/* Problem Description */}
            <Section title="Problem Description">
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, margin: 0 }}>
                {request.description}
              </p>
            </Section>

            {/* Uploaded Images */}
            <Section title="Uploaded Images">
              {request.images && request.images.length > 0 ? (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {request.images.map((img, i) => (
                    <div key={i} style={{
                      width: 100, height: 80, borderRadius: 8, background: '#E5E7EB',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, color: '#6b7280', border: '1px solid #d1d5db',
                    }}>
                      📷 {img}
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ fontSize: 13, color: '#9CA3AF' }}>No images uploaded</span>
              )}
            </Section>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Assigned Technician */}
            <Section title="Assigned Technician">
              {request.assignedStaff ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', background: '#DBEAFE',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 700, color: '#1E40AF',
                  }}>
                    {request.assignedStaff[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>{request.assignedStaff}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Technician</div>
                  </div>
                </div>
              ) : (
                <span style={{ fontSize: 13, color: '#F59E0B', fontWeight: 500 }}>No technician assigned yet</span>
              )}
              {request.deadline && (
                <InfoRow label="Deadline" value={request.deadline} />
              )}
            </Section>

            {/* Timeline */}
            <Section title="Timeline (Status History)">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative', paddingLeft: 20 }}>
                <div style={{
                  position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, background: '#E5E7EB',
                }} />
                {timeline.map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14, position: 'relative' }}>
                    <div style={{
                      width: 14, height: 14, borderRadius: '50%', background: i === timeline.length - 1 ? '#3B82F6' : '#D1D5DB',
                      border: '2px solid #fff', boxShadow: '0 0 0 2px ' + (i === timeline.length - 1 ? '#3B82F6' : '#D1D5DB'),
                      flexShrink: 0, marginTop: 2,
                    }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>{t.event}</div>
                      <div style={{ fontSize: 12, color: '#9CA3AF' }}>{t.date} · by {t.by}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Notes / Comments */}
            <Section title="Notes & Comments">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                {(request.comments || []).length === 0 ? (
                  <span style={{ fontSize: 13, color: '#9CA3AF' }}>No comments yet</span>
                ) : (
                  (request.comments || []).map((c, i) => (
                    <div key={i} style={{
                      padding: '10px 14px', background: '#F9FAFB', borderRadius: 8,
                      border: '1px solid #f0f0f0',
                    }}>
                      <div style={{ fontSize: 13, color: '#374151' }}>{c.text}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{c.by} · {c.date}</div>
                    </div>
                  ))
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 8,
                    border: '1px solid #d1d5db', fontSize: 13, outline: 'none',
                  }}
                />
                <button onClick={handleAddComment} style={{
                  padding: '8px 16px', borderRadius: 8, border: 'none',
                  background: '#3B82F6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>
                  Send
                </button>
              </div>
            </Section>
          </div>
        </div>
      </div>

      {/* Assign Task Modal */}
      {showAssignModal && (
        <AssignTaskModal
          request={request}
          onClose={() => setShowAssignModal(false)}
          onSave={handleAssignSave}
        />
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '20px 22px',
    }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1f2937', margin: '0 0 14px' }}>{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
      <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 13, color: '#1f2937', fontWeight: 600 }}>{value}</span>
    </div>
  );
}
