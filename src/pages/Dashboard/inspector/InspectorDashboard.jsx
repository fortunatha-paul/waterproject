import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Configure axios with auth token
const configureAxios = () => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

const MOCK_INSPECTIONS = [
  {
    id: 'INS-001',
    propertyId: 'PROP-456',
    propertyAddress: '123 Main St, Sector 14',
    inspectionType: 'New Connection',
    date: '2026-04-30',
    status: 'Scheduled',
    inspector: 'John Smith',
    priority: 'High',
    estimatedDuration: '2 hours',
    notes: 'New water connection installation verification'
  },
  {
    id: 'INS-002',
    propertyId: 'PROP-789',
    propertyAddress: '456 Oak Avenue, Sector 22',
    inspectionType: 'Repair Verification',
    date: '2026-04-29',
    status: 'In Progress',
    inspector: 'John Smith',
    priority: 'Medium',
    estimatedDuration: '1 hour',
    notes: 'Follow-up inspection on pipe repair'
  },
  {
    id: 'INS-003',
    propertyId: 'PROP-234',
    propertyAddress: '789 Pine Road, Sector 9',
    inspectionType: 'Complaint Resolution',
    date: '2026-04-28',
    status: 'Completed',
    inspector: 'John Smith',
    priority: 'Low',
    estimatedDuration: '45 minutes',
    notes: 'Water pressure issue resolved'
  },
  {
    id: 'INS-004',
    propertyId: 'PROP-567',
    propertyAddress: '321 Elm Street, Sector 15',
    inspectionType: 'Routine Inspection',
    date: '2026-04-27',
    status: 'Pending',
    inspector: 'John Smith',
    priority: 'Medium',
    estimatedDuration: '1.5 hours',
    notes: 'Annual system check'
  }
];

const MOCK_REPORTS = [
  { id: 'RPT-001', inspectionId: 'INS-003', title: 'Water Pressure Issue Report', date: '2026-04-28', status: 'Submitted' },
  { id: 'RPT-002', inspectionId: 'INS-002', title: 'Repair Verification Report', date: '2026-04-29', status: 'Draft' },
  { id: 'RPT-003', inspectionId: 'INS-001', title: 'New Connection Inspection', date: '2026-04-30', status: 'Pending' }
];

function SummaryCard({ icon, label, value, color, trend }) {
  return (
    <div style={{
      background: '#ffffff',
      borderRadius: 4,
      padding: '24px',
      border: '2px solid #d1d5db',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'relative',
      transition: 'all 0.3s ease',
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#9ca3af';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#d1d5db';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      }}>
      <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', marginBottom: '16px' }}>
        <div style={{
          fontSize: 14,
          color: '#374151',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          fontFamily: 'Georgia, serif'
        }}>
          {label}
        </div>
      </div>
      <div style={{ fontSize: 36, fontWeight: 700, color: '#111827', lineHeight: 1, marginBottom: '12px', fontFamily: 'Georgia, serif' }}>
        {value}
      </div>
      {trend && (
        <div style={{
          fontSize: 13,
          color: trend.type === 'up' ? '#059669' : '#dc2626',
          fontWeight: 600,
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic'
        }}>
          {trend.type === 'up' ? '↑' : '↓'} {trend.value}% from last month
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const statusConfig = {
    'Scheduled': { color: '#3B82F6', bg: '#EFF6FF' },
    'In Progress': { color: '#F59E0B', bg: '#FEF3C7' },
    'Completed': { color: '#10B981', bg: '#D1FAE5' },
    'Pending': { color: '#6B7280', bg: '#F3F4F6' },
    'Submitted': { color: '#10B981', bg: '#D1FAE5' },
    'Draft': { color: '#F59E0B', bg: '#FEF3C7' }
  };

  const config = statusConfig[status] || { color: '#6B7280', bg: '#F3F4F6' };

  return (
    <span style={{
      padding: '4px 12px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      color: config.color,
      background: config.bg,
      border: `1px solid ${config.color}20`,
    }}>
      {status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const priorityConfig = {
    'High': { color: '#EF4444', bg: '#FEE2E2' },
    'Medium': { color: '#F59E0B', bg: '#FEF3C7' },
    'Low': { color: '#10B981', bg: '#D1FAE5' }
  };

  const config = priorityConfig[priority] || priorityConfig['Medium'];

  return (
    <span style={{
      padding: '4px 8px',
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 600,
      color: config.color,
      background: config.bg,
    }}>
      {priority}
    </span>
  );
}

function ServiceRequestDetails({ inspection, onBack, onUpdateStatus }) {
  const [notes, setNotes] = useState(inspection.notes || '');
  const [status, setStatus] = useState(inspection.status);

  const handleUpdate = () => {
    onUpdateStatus(inspection.id, status, notes);
    onBack();
  };

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '32px', border: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', margin: 0 }}>
          Service Request Details - {inspection.id}
        </h2>
        <button onClick={onBack} style={{
          padding: '8px 16px', borderRadius: 8, border: '1px solid #d1d5db',
          background: '#fff', color: '#6b7280', fontSize: 14, fontWeight: 600,
          cursor: 'pointer', transition: 'all 0.2s',
        }}>
          ← Back
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 24 }}>
        <div>
          <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Property ID</label>
          <div style={{ fontSize: 16, color: '#1f2937', fontWeight: 600, marginTop: 4 }}>{inspection.propertyId}</div>
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Address</label>
          <div style={{ fontSize: 16, color: '#1f2937', marginTop: 4 }}>{inspection.propertyAddress}</div>
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</label>
          <div style={{ fontSize: 16, color: '#1f2937', marginTop: 4 }}>{inspection.inspectionType}</div>
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</label>
          <div style={{ fontSize: 16, color: '#1f2937', marginTop: 4 }}>{inspection.date}</div>
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Priority</label>
          <div style={{ marginTop: 4 }}><PriorityBadge priority={inspection.priority} /></div>
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Duration</label>
          <div style={{ fontSize: 16, color: '#1f2937', marginTop: 4 }}>{inspection.estimatedDuration}</div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{
            width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db',
            fontSize: 14, marginTop: 8, background: '#fff', color: '#1f2937',
          }}
        >
          <option value="Scheduled">Scheduled</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Service Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter service notes..."
          style={{
            width: '100%', padding: '12px', borderRadius: 8, border: '1px solid #d1d5db',
            fontSize: 14, marginTop: 8, minHeight: 120, resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button onClick={onBack} style={{
          padding: '10px 20px', borderRadius: 8, border: '1px solid #d1d5db',
          background: '#fff', color: '#6b7280', fontSize: 14, fontWeight: 600,
          cursor: 'pointer', transition: 'all 0.2s',
        }}>
          Cancel
        </button>
        <button onClick={handleUpdate} style={{
          padding: '10px 20px', borderRadius: 8, border: 'none',
          background: '#3B82F6', color: '#fff', fontSize: 14, fontWeight: 600,
          cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
        }}>
          Update Request
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [serviceRequests, setServiceRequests] = useState(MOCK_INSPECTIONS);
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [selectedServiceRequest, setSelectedServiceRequest] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Calculate derived values
  const total = serviceRequests.length;
  const scheduled = serviceRequests.filter(i => i.status === 'Scheduled').length;
  const inProgress = serviceRequests.filter(i => i.status === 'In Progress').length;
  const completed = serviceRequests.filter(i => i.status === 'Completed').length;

  // Load on component mount
  useEffect(() => {
    configureAxios();
  }, []);

  const handleUpdateServiceRequest = (id, status, notes) => {
    setServiceRequests(prev => prev.map(req =>
      req.id === id ? { ...req, status, notes } : req
    ));
    setSuccessMsg('Service request updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  if (selectedServiceRequest) {
    return (
      <div style={{ minHeight: '100vh', background: '#F9FAFB', padding: '24px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <ServiceRequestDetails
            inspection={selectedServiceRequest}
            onBack={() => setSelectedServiceRequest(null)}
            onUpdateStatus={handleUpdateServiceRequest}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #3730a3 100%)',
        padding: '24px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 20,
        position: 'relative',
        overflow: 'hidden',
      }}>
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
            color: '#1e40af',
            fontWeight: 800,
            fontSize: 20,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}>
            WI
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
              {user?.name || 'Admin'}
            </div>
            <div style={{
              fontSize: 14,
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 600,
              letterSpacing: '0.025em',
            }}>
              Water Administration Portal
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
              Active Cases
            </div>
            <div style={{
              fontSize: 14,
              color: '#ffffff',
              fontWeight: 700,
            }}>
              {inProgress + scheduled}
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
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            }}
          >
            <span style={{ fontSize: 18 }}></span>
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>
        {/* Title Row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 16, marginBottom: 24,
        }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', margin: 0 }}>
            Admin Dashboard
          </h1>
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
          <SummaryCard icon="" label="Total Requests" value={total} color="#6366F1" trend={{ type: 'up', value: 12 }} />
          <SummaryCard icon="" label="Scheduled" value={scheduled} color="#F59E0B" />
          <SummaryCard icon="" label="In Progress" value={inProgress} color="#3B82F6" />
          <SummaryCard icon="" label="Completed" value={completed} color="#10B981" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          {/* Inspections Table */}
          <div style={{
            background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden',
          }}>
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid #f0f0f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1f2937', margin: 0 }}>
                Scheduled Services
              </h2>
              <span style={{ fontSize: 13, color: '#9CA3AF' }}>
                {serviceRequests.length} service request{serviceRequests.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    {['ID', 'Property', 'Type', 'Date', 'Priority', 'Status', 'Action'].map((h) => (
                      <th key={h} style={{
                        padding: '12px 16px', textAlign: 'left', fontSize: 12,
                        fontWeight: 600, color: '#6b7280', textTransform: 'uppercase',
                        letterSpacing: '0.5px', borderBottom: '1px solid #E5E7EB',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {serviceRequests.map((request) => (
                    <tr key={request.id} style={{ borderBottom: '1px solid #f0f0f0', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
                        {request.id}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: 14, color: '#374151', fontWeight: 600 }}>{request.propertyId}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{request.propertyAddress}</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 14, color: '#374151' }}>
                        {request.inspectionType}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 14, color: '#6b7280' }}>
                        {request.date}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <PriorityBadge priority={request.priority} />
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <StatusBadge status={request.status} />
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button onClick={() => setSelectedServiceRequest(request)} style={{
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

          {/* Recent Reports */}
          <div style={{
            background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden',
          }}>
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid #f0f0f0',
            }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1f2937', margin: 0 }}>
                Recent Reports
              </h2>
            </div>
            <div style={{ padding: '16px' }}>
              {reports.map((report) => (
                <div key={report.id} style={{
                  padding: '12px', borderRadius: 8, border: '1px solid #f0f0f0',
                  marginBottom: 12, background: '#FAFAFA',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#FAFAFA'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
                      {report.title}
                    </div>
                    <StatusBadge status={report.status} />
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                    ID: {report.id}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    Date: {report.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}