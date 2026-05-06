import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';
import DashboardStateManager from '../../../utils/dashboardState';

const API_URL = 'http://localhost:8000/api';

// Configure axios with auth token
const configureAxios = () => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

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
    'Completed': { color: '#10B981', bg: '#D1FAE5' },
    'Uncomplete': { color: '#F59E0B', bg: '#FEF3C7' }
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
          <option value="Uncomplete">Uncomplete</option>
          <option value="Completed">Completed</option>
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

export default function InspectorDashboard() {
  const { user, logout } = useAuth();
  const [serviceRequests, setServiceRequests] = useState([]);
  const [selectedServiceRequest, setSelectedServiceRequest] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(true);

  // Initialize dashboard state manager
  const [stateManager] = useState(() => new DashboardStateManager('inspector'));

  // Calculate derived values
  const total = serviceRequests.length;
  const uncomplete = serviceRequests.filter(i => i.status !== 'Completed').length;
  const completed = serviceRequests.filter(i => i.status === 'Completed').length;

  // Load on component mount and restore state
  useEffect(() => {
    configureAxios();

    // Restore saved state if exists
    const savedState = stateManager.loadState();
    if (savedState) {
      setServiceRequests(savedState.serviceRequests || []);
      setSelectedServiceRequest(savedState.selectedServiceRequest || null);
      setSuccessMsg(savedState.successMsg || '');
      setLoading(savedState.loading !== undefined ? savedState.loading : false);
    }

    // Always fetch fresh data
    fetchServiceRequests();
  }, [stateManager]);

  const fetchServiceRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/requests`);
      // Transform API data to match frontend structure
      const transformedRequests = response.data.map(request => ({
        id: `REQ-${request.id}`,
        propertyId: `PROP-${request.id}`,
        propertyAddress: request.location,
        inspectionType: request.serve_type,
        date: request.deadline || new Date().toISOString().split('T')[0],
        status: request.status === 'Completed' ? 'Completed' : 'Uncomplete',
        inspector: request.assigned_staff,
        priority: request.priority || 'Medium',
        estimatedDuration: '2 hours',
        notes: request.description,
        description: request.description,
        comments: request.comments,
        timeline: request.timeline
      }));
      setServiceRequests(transformedRequests);
    } catch (error) {
      console.error('Error fetching service requests:', error);
      setSuccessMsg('Error loading service requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateServiceRequest = (id, status, notes) => {
    setServiceRequests(prev => prev.map(req =>
      req.id === id ? { ...req, status, notes } : req
    ));
    setSuccessMsg('Service request updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Save state whenever important values change
  useEffect(() => {
    const currentState = {
      serviceRequests,
      selectedServiceRequest,
      successMsg,
      loading
    };
    stateManager.saveState(currentState);
  }, [serviceRequests, selectedServiceRequest, successMsg, loading, stateManager]);

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
              {user?.name || 'Inspector'}
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
              {inProgress}
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
            Inspector Dashboard
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

        {/* Loading State */}
        {loading ? (
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            padding: '60px', background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 32,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 40, height: 40, border: '4px solid #f3f3f3',
                borderTop: '4px solid #3B82F6', borderRadius: '50%',
                animation: 'spin 1s linear infinite', margin: '0 auto 16px'
              }}></div>
              <div style={{ fontSize: 14, color: '#ffffff', fontWeight: 700 }}>
                {uncomplete}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 32,
            }}>
              <SummaryCard icon="" label="Total Requests" value={total} color="#6366F1" trend={{ type: 'up', value: 12 }} />
              <SummaryCard icon="" label="Uncomplete" value={uncomplete} color="#F59E0B" />
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
                    Assigned Services
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
                  <div style={{
                    padding: '12px', borderRadius: 8, border: '1px solid #f0f0f0',
                    marginBottom: 12, background: '#FAFAFA',
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>
                      No reports available
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
