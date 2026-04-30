import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import SummaryCard from './components/SummaryCard';
import StatusBadge from './components/StatusBadge';
import NewRequestForm from './components/NewRequestForm';
import RequestDetails from './components/RequestDetails';

const MOCK_REQUESTS = [
  { id: 'REQ-001', serviceType: 'New Connection', date: '2026-04-28', status: 'Pending', description: 'Need a new water connection for residential unit B-12.', location: 'Block B, Sector 14', technician: null, expectedCompletion: null, stage: 0 },
  { id: 'REQ-002', serviceType: 'Repair', date: '2026-04-25', status: 'In Progress', description: 'Leaking pipe near the kitchen area causing water wastage.', location: 'House 45, Lane 7', technician: 'Rajesh Kumar', expectedCompletion: '2026-05-03', stage: 3 },
  { id: 'REQ-003', serviceType: 'Complaint', date: '2026-04-20', status: 'Completed', description: 'Low water pressure during morning hours.', location: 'Flat 302, Tower A', technician: 'Sunil Mehta', expectedCompletion: '2026-04-27', stage: 4 },
  { id: 'REQ-004', serviceType: 'New Connection', date: '2026-04-18', status: 'Rejected', description: 'Request for commercial connection in residential zone.', location: 'Shop 12, Market Road', technician: null, expectedCompletion: null, stage: 1 },
  { id: 'REQ-005', serviceType: 'Repair', date: '2026-04-15', status: 'Completed', description: 'Broken water meter needs replacement.', location: 'House 78, Sector 22', technician: 'Anil Sharma', expectedCompletion: '2026-04-22', stage: 4 },
  { id: 'REQ-006', serviceType: 'Complaint', date: '2026-04-12', status: 'In Progress', description: 'Dirty water supply for the past 3 days.', location: 'Block C, Sector 9', technician: 'Vikram Singh', expectedCompletion: '2026-05-01', stage: 3 },
];

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const total = requests.length;
  const pending = requests.filter((r) => r.status === 'Pending').length;
  const inProgress = requests.filter((r) => r.status === 'In Progress').length;
  const completed = requests.filter((r) => r.status === 'Completed').length;

  const handleNewRequest = (form) => {
    const newReq = {
      id: `REQ-${String(requests.length + 1).padStart(3, '0')}`,
      serviceType: form.serviceType,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      description: form.description,
      location: form.location,
      technician: null,
      expectedCompletion: null,
      stage: 0,
    };
    setRequests((prev) => [newReq, ...prev]);
    setShowForm(false);
    setSuccessMsg('Request submitted successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  if (selectedRequest) {
    return (
      <div style={{ minHeight: '100vh', background: '#F9FAFB', padding: '24px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <RequestDetails request={selectedRequest} onBack={() => setSelectedRequest(null)} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '24px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 20,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative overlay pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 52, height: 52,
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#667eea',
            fontWeight: 800,
            fontSize: 20,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div style={{
              fontSize: 18,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.05em',
              marginBottom: 4,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}>
              {user?.name || 'User'}
            </div>
            <div style={{
              fontSize: 14,
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 600,
              letterSpacing: '0.025em',
            }}>
              💧 Water Service Portal
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
          <div style={{
            padding: '8px 16px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{
              fontSize: 12,
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 500,
            }}>
              Account Status
            </div>
            <div style={{
              fontSize: 14,
              color: '#ffffff',
              fontWeight: 700,
            }}>
              Active
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              padding: '12px 28px',
              borderRadius: '14px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              color: '#ffffff',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              letterSpacing: '0.025em',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
          >
            <span style={{ fontSize: 18 }}>🚪</span>
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 32px' }}>
        {/* Title Row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 16, marginBottom: 24,
        }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', margin: 0 }}>
            My Dashboard
          </h1>
          <button onClick={() => setShowForm(true)} style={{
            padding: '12px 28px', borderRadius: 10, border: 'none',
            background: '#3B82F6', color: '#fff', fontSize: 15, fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 14px rgba(59,130,246,0.35)', transition: 'all 0.2s',
          }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>+</span> Make New Request
          </button>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div style={{
            background: '#D1FAE5', color: '#065F46', padding: '12px 20px',
            borderRadius: 10, marginBottom: 20, fontSize: 14, fontWeight: 500,
            border: '1px solid #A7F3D0',
          }}>
            {successMsg}
          </div>
        )}

        {/* Summary Cards */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 32,
        }}>
          <SummaryCard icon="📄" label="Total Requests" value={total} color="#6366F1" />
          <SummaryCard icon="⏳" label="Pending Requests" value={pending} color="#F59E0B" />
          <SummaryCard icon="🔧" label="In Progress" value={inProgress} color="#3B82F6" />
          <SummaryCard icon="✅" label="Completed" value={completed} color="#10B981" />
        </div>

        {/* Recent Requests */}
        <div style={{
          background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden',
        }}>
          <div style={{
            padding: '20px 24px', borderBottom: '1px solid #f0f0f0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1f2937', margin: 0 }}>
              Recent Requests
            </h2>
            <span style={{ fontSize: 13, color: '#9CA3AF' }}>
              {requests.length} request{requests.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  {['Request ID', 'Service Type', 'Date Submitted', 'Status', 'Action'].map((h) => (
                    <th key={h} style={{
                      padding: '12px 20px', textAlign: 'left', fontSize: 12,
                      fontWeight: 600, color: '#6b7280', textTransform: 'uppercase',
                      letterSpacing: '0.5px', borderBottom: '1px solid #E5E7EB',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid #f0f0f0', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
                      {req.id}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: '#374151' }}>
                      {req.serviceType}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: '#6b7280' }}>
                      {req.date}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <StatusBadge status={req.status} />
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <button onClick={() => setSelectedRequest(req)} style={{
                        padding: '6px 14px', borderRadius: 6, border: '1px solid #3B82F6',
                        background: '#EFF6FF', color: '#3B82F6', fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Request Modal */}
      {showForm && <NewRequestForm onClose={() => setShowForm(false)} onSubmit={handleNewRequest} />}
    </div>
  );
}