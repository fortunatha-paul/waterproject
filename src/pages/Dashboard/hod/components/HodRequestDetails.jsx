import React, { useState, useEffect } from 'react';
import { api } from '../../../../utils/api';
import axios from 'axios';
import StatusBadge from '../../Custome Service/components/StatusBadge';
import AssignTaskModal from '../../Custome Service/components/AssignTaskModal';

const API_URL = 'http://localhost:8000/api';

const configureAxios = () => {
  const token = localStorage.getItem('auth_token');
  if (token) axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
};

export default function HodRequestDetails({ request, onBack, onAssign, onStatusChange, onRequestUpdated }) {
  const [fresh, setFresh] = useState(request);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchFresh = async () => {
      try {
        const reqId = request.id && request.id.toString().includes('REQ-')
          ? request.id.replace('REQ-', '')
          : request.id;
        const data = await api.getRequest(reqId);
        if (mounted && data) setFresh(data);
      } catch (err) {
        if (mounted) setFresh(request);
      }
    };
    fetchFresh();
    return () => { mounted = false; };
  }, [request]);

  const shownRequest = fresh || request;
  if (!shownRequest) return null;

  const reqId = request.id && request.id.toString().includes('REQ-')
    ? request.id.replace('REQ-', '')
    : request.id;

  const isFormRequired = shownRequest.serviceType === 'New Connection' || 
                         shownRequest.serve_type === 'New Connection' ||
                         shownRequest.serviceType === 'Remove Sewage Water' || 
                         shownRequest.serve_type === 'Remove Sewage Water';

  const canApprove = shownRequest.status === 'Reviewed' || shownRequest.status === 'Submitted';
  const canReject  = shownRequest.status === 'Reviewed' || shownRequest.status === 'Submitted';

  const handleApprove = async () => {
    try {
      setSaving(true);
      configureAxios();
      await axios.put(API_URL + '/requests/' + reqId, {
        status: 'Approved',
        timeline: [
          ...(Array.isArray(shownRequest.timeline) ? shownRequest.timeline : []),
          { date: new Date().toISOString().split('T')[0], event: 'Request Approved by HOD', by: 'HOD' }
        ]
      });
      setSuccessMsg('Request approved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      if (onRequestUpdated) await onRequestUpdated();
      const data = await api.getRequest(reqId);
      if (data) setFresh(data);
    } catch (err) {
      alert('Failed to approve request.');
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }
    try {
      setSaving(true);
      configureAxios();
      await axios.put(API_URL + '/requests/' + reqId, {
        status: 'Rejected',
        rejection_reason: rejectionReason,
        timeline: [
          ...(Array.isArray(shownRequest.timeline) ? shownRequest.timeline : []),
          { date: new Date().toISOString().split('T')[0], event: 'Request Rejected by HOD: ' + rejectionReason, by: 'HOD' }
        ]
      });
      setShowRejectModal(false);
      setRejectionReason('');
      setSuccessMsg('Request rejected.');
      setTimeout(() => setSuccessMsg(''), 3000);
      if (onRequestUpdated) await onRequestUpdated();
      const data = await api.getRequest(reqId);
      if (data) setFresh(data);
    } catch (err) {
      alert('Failed to reject request.');
    } finally {
      setSaving(false);
    }
  };

  const timeline = Array.isArray(shownRequest.timeline) ? shownRequest.timeline : [
    { date: shownRequest.date || new Date().toISOString().split('T')[0], event: 'Request Submitted', by: shownRequest.customerName || 'Customer' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', padding: '24px 32px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* Back Button */}
        <button onClick={onBack} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151', marginBottom: 20 }}>
          ← Back to Dashboard
        </button>

        {/* Success Message */}
        {successMsg && (
          <div style={{ background: '#D1FAE5', color: '#065F46', padding: '12px 20px', borderRadius: 10, marginBottom: 20, fontSize: 14, fontWeight: 500, border: '1px solid #A7F3D0' }}>
            {successMsg}
          </div>
        )}

        {/* Header */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: '24px 28px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', marginBottom: 6 }}>
              {request.id} — {request.serviceType}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <StatusBadge type="status" value={shownRequest.status} />
              <StatusBadge type="priority" value={request.priority} />
              <span style={{ fontSize: 13, color: '#6b7280' }}>Submitted: {request.date}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {canApprove && (
              <button onClick={handleApprove} disabled={saving} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: saving ? '#9CA3AF' : '#10B981', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
                ✅ Approve
              </button>
            )}
            {canReject && (
              <button onClick={() => setShowRejectModal(true)} disabled={saving} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: saving ? '#9CA3AF' : '#EF4444', color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
                ❌ Reject
              </button>
            )}
            {shownRequest.status === 'Approved' && (
              <button onClick={() => setShowAssignModal(true)} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#8B5CF6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                👷 Assign Inspector
              </button>
            )}
          </div>
        </div>

        {/* Rejection reason */}
        {shownRequest.status === 'Rejected' && shownRequest.rejection_reason && (
          <div style={{ background: '#FEE2E2', borderRadius: 10, padding: '16px 20px', marginBottom: 20, border: '1px solid #FCA5A5' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#991B1B', marginBottom: 4 }}>Rejection Reason:</div>
            <div style={{ fontSize: 14, color: '#7F1D1D' }}>{shownRequest.rejection_reason}</div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Customer Info */}
            <Section title="Customer Information">
              <InfoRow label="Name"     value={request.customerName} />
              <InfoRow label="Email"    value={request.customerEmail || 'N/A'} />
              <InfoRow label="Phone"    value={request.customerPhone || 'N/A'} />
              <InfoRow label="Location" value={request.location} />
            </Section>

            {/* Problem Description */}
            <Section title="Problem Description">
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, margin: 0 }}>{request.description}</p>
            </Section>

            {/* PDF Application Form */}
            {isFormRequired && (
              <Section title="Application Form (PDF)">
                {shownRequest.application_form ? (
                  <div>
                    <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>
                      Customer has uploaded an application form. Click below to view it.
                    </div>
                    <a
                      href={'http://localhost:8000/uploads/forms/' + shownRequest.application_form}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, background: '#EFF6FF', color: '#1D4ED8', fontSize: 14, fontWeight: 700, textDecoration: 'none', border: '1px solid #BFDBFE' }}
                    >
                      📄 View Application Form (PDF)
                    </a>
                  </div>
                ) : (
                  <div style={{ padding: '16px', background: '#FEF3C7', borderRadius: 8, border: '1px solid #FDE68A', fontSize: 13, color: '#92400E', fontWeight: 600 }}>
                    ⚠️ Customer has not uploaded an application form yet
                  </div>
                )}
              </Section>
            )}
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Assigned Inspector */}
            <Section title="Assigned Inspector">
              {shownRequest.assignedStaff ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#1E40AF' }}>
                    {shownRequest.assignedStaff[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>{shownRequest.assignedStaff}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Inspector</div>
                  </div>
                </div>
              ) : (
                <span style={{ fontSize: 13, color: '#F59E0B', fontWeight: 500 }}>No inspector assigned yet</span>
              )}
              {shownRequest.deadline && <InfoRow label="Deadline" value={shownRequest.deadline} />}
            </Section>

            {/* Timeline */}
            <Section title="Timeline">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative', paddingLeft: 20 }}>
                <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, background: '#E5E7EB' }} />
                {timeline.map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14, position: 'relative' }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: i === timeline.length - 1 ? '#3B82F6' : '#D1D5DB', border: '2px solid #fff', boxShadow: '0 0 0 2px ' + (i === timeline.length - 1 ? '#3B82F6' : '#D1D5DB'), flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>{t.event}</div>
                      <div style={{ fontSize: 12, color: '#9CA3AF' }}>{t.date} · by {t.by}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 480, width: '100%', margin: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', margin: '0 0 8px' }}>Reject Request</h3>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 20px' }}>Please provide a reason — the customer will see this message.</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Application form is incomplete, ID number is missing..."
              style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, minHeight: 100, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 16 }}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowRejectModal(false); setRejectionReason(''); }} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
                Cancel
              </button>
              <button onClick={handleReject} disabled={saving} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: saving ? '#9CA3AF' : '#EF4444', color: '#fff', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <AssignTaskModal
          request={request}
          onClose={() => setShowAssignModal(false)}
          onSave={async (updated) => {
            setShowAssignModal(false);
            if (onRequestUpdated) await onRequestUpdated();
            const data = await api.getRequest(reqId);
            if (data) setFresh(data);
          }}
        />
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '20px 22px' }}>
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