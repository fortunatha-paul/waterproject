import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';
import DashboardStateManager from '../../../utils/dashboardState';
import { ReportForm } from './components/InspectorReports';

const API_URL = 'http://localhost:8000/api';

const configureAxios = () => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
  }
};

function SummaryCard({ label, value }) {
  return (
    <div style={{
      background: '#ffffff', borderRadius: 4, padding: '24px',
      border: '2px solid #d1d5db', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }}>
      <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', marginBottom: '16px' }}>
        <div style={{ fontSize: 14, color: '#374151', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'Georgia, serif' }}>
          {label}
        </div>
      </div>
      <div style={{ fontSize: 36, fontWeight: 700, color: '#111827', fontFamily: 'Georgia, serif' }}>
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const statusConfig = {
    'Pending':      { color: '#6B7280', bg: '#F3F4F6' },
    'Submitted':    { color: '#3B82F6', bg: '#DBEAFE' },
    'Approved':     { color: '#3B82F6', bg: '#DBEAFE' },
    'Assigned':     { color: '#8B5CF6', bg: '#EDE9FE' },
    'In Progress':  { color: '#F59E0B', bg: '#FEF3C7' },
    'Completed':    { color: '#10B981', bg: '#D1FAE5' },
    'Rejected':     { color: '#EF4444', bg: '#FEE2E2' },
    'Solved':       { color: '#10B981', bg: '#D1FAE5' },
    'Not Solved':   { color: '#F59E0B', bg: '#FEF3C7' },
  };
  const config = statusConfig[status] || { color: '#6B7280', bg: '#F3F4F6' };
  return (
    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: config.color, background: config.bg }}>
      {status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const cfg = {
    'High':   { color: '#EF4444', bg: '#FEE2E2' },
    'Medium': { color: '#F59E0B', bg: '#FEF3C7' },
    'Low':    { color: '#10B981', bg: '#D1FAE5' },
    'Urgent': { color: '#DC2626', bg: '#FEE2E2' },
  };
  const config = cfg[priority] || cfg['Medium'];
  return (
    <span style={{ padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, color: config.color, background: config.bg }}>
      {priority}
    </span>
  );
}

function ServiceRequestDetails({ inspection, onBack, onUpdateStatus, onWriteReport }) {
  const [notes, setNotes] = useState(inspection.notes || '');
  const [inspectorStatus, setInspectorStatus] = useState(inspection.inspectorStatus || 'Not Solved');

  const handleUpdate = () => {
    onUpdateStatus(inspection.id, inspectorStatus, notes);
    onBack();
  };

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '32px', border: '1px solid #e5e7eb' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', margin: 0 }}>
          Service Request Details - {inspection.id}
        </h2>
        <button onClick={onBack} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', color: '#6b7280', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Back
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 24 }}>
        <div>
          <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer Name</label>
          <div style={{ fontSize: 16, color: '#1f2937', marginTop: 4 }}>{inspection.user ? inspection.user.name : 'N/A'}</div>
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone Number</label>
          <div style={{ fontSize: 16, color: '#1f2937', marginTop: 4 }}>{inspection.user ? inspection.user.phone_number : 'N/A'}</div>
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
          <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Priority</label>
          <div style={{ marginTop: 4 }}><PriorityBadge priority={inspection.priority} /></div>
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Status</label>
          <div style={{ marginTop: 4 }}><StatusBadge status={inspection.status} /></div>
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>House Number</label>
          <div style={{ fontSize: 16, color: '#1f2937', marginTop: 4 }}>{inspection.user ? inspection.user.house_number : 'N/A'}</div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Inspector Status</label>
        <select value={inspectorStatus} onChange={(e) => setInspectorStatus(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, marginTop: 8, background: '#fff', color: '#1f2937' }}>
          <option value="Not Solved">Not Solved</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Solved">Solved</option>
        </select>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Service Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter service notes..."
          style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, marginTop: 8, minHeight: 120, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button onClick={onBack} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', color: '#6b7280', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Cancel
        </button>
        <button onClick={() => onWriteReport(inspection)} style={{
          padding: '10px 20px', borderRadius: 8, border: 'none',
          background: '#059669', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(5,150,105,0.3)',
        }}>
          Write Report
        </button>
        <button onClick={handleUpdate} style={{
          padding: '10px 20px', borderRadius: 8, border: 'none',
          background: '#3B82F6', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
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
  const [writingReportFor, setWritingReportFor] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const [stateManager] = useState(() => new DashboardStateManager('inspector'));

  const total     = serviceRequests.length;
  const notSolved = serviceRequests.filter(i => i.inspectorStatus !== 'Solved').length;
  const solved    = serviceRequests.filter(i => i.inspectorStatus === 'Solved').length;

  useEffect(() => {
    configureAxios();
    const savedState = stateManager.loadState();
    if (savedState) {
      setServiceRequests(savedState.serviceRequests || []);
      setLoading(savedState.loading !== undefined ? savedState.loading : false);
    }
    fetchServiceRequests();
  }, [stateManager]);

  const fetchServiceRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL + '/requests');
      const transformed = response.data.map(function(request) {
        return {
          id:              'REQ-' + request.id,
          rawId:           request.id,
          propertyId:      'PROP-' + request.id,
          propertyAddress: request.location,
          inspectionType:  request.serve_type,
          date:            request.deadline || new Date().toISOString().split('T')[0],
          status:          request.status,
          inspectorStatus: request.inspectorStatus || 'Not Solved',
          inspector:       request.assigned_staff,
          priority:        request.priority || 'Medium',
          notes:           request.description,
          description:     request.description,
          comments:        request.comments,
          timeline:        request.timeline,
          user:            request.user,
        };
      });
      setServiceRequests(transformed);
    } catch (error) {
      console.error('Error fetching service requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateServiceRequest = async (id, inspectorStatus, notes) => {
    try {
      const requestId = id.replace('REQ-', '');
      await axios.put(API_URL + '/requests/' + requestId, { inspectorStatus, description: notes });
      setServiceRequests(function(prev) {
        return prev.map(function(req) {
          return req.id === id ? Object.assign({}, req, { inspectorStatus, notes }) : req;
        });
      });
      setSuccessMsg('Service request updated successfully!');
      setTimeout(function() { setSuccessMsg(''); }, 3000);
    } catch (error) {
      console.error('Error updating service request:', error);
    }
  };

  const handleReportSaved = function(newReport) {
    setWritingReportFor(null);
    setSelectedServiceRequest(null);
    setSuccessMsg('Report submitted successfully!');
    setTimeout(function() { setSuccessMsg(''); }, 3000);
  };

  useEffect(() => {
    stateManager.saveState({ serviceRequests, selectedServiceRequest, successMsg, loading });
  }, [serviceRequests, selectedServiceRequest, successMsg, loading, stateManager]);

  if (writingReportFor) {
    return (
      <div style={{ minHeight: '100vh', background: '#F9FAFB', padding: '24px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <ReportForm
            requestId={writingReportFor.rawId}
            requestInfo={writingReportFor.inspectionType + ' - ' + writingReportFor.propertyAddress}
            onSave={handleReportSaved}
            onCancel={function() { setWritingReportFor(null); }}
          />
        </div>
      </div>
    );
  }

  if (selectedServiceRequest) {
    return (
      <div style={{ minHeight: '100vh', background: '#F9FAFB', padding: '24px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <ServiceRequestDetails
            inspection={selectedServiceRequest}
            onBack={function() { setSelectedServiceRequest(null); }}
            onUpdateStatus={handleUpdateServiceRequest}
            onWriteReport={function(inspection) { setWritingReportFor(inspection); }}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #3730a3 100%)',
        padding: '24px 48px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 52, height: 52, borderRadius: '16px', background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e40af', fontWeight: 800, fontSize: 20 }}>
            WI
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginBottom: 4 }}>
              {user ? user.name : 'Inspector'}
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
              Water Administration Portal
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Active Cases</div>
            <div style={{ fontSize: 14, color: '#ffffff', fontWeight: 700 }}>{notSolved}</div>
          </div>
          <button onClick={logout} style={{ padding: '12px 28px', borderRadius: '14px', border: '2px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)', color: '#ffffff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>

        {successMsg !== '' && (
          <div style={{ background: '#D1FAE5', color: '#065F46', padding: '12px 20px', borderRadius: 10, marginBottom: 20, fontSize: 14, fontWeight: 500, border: '1px solid #A7F3D0' }}>
            {successMsg}
          </div>
        )}

        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#6B7280' }}>Loading requests...</div>
        ) : (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
              <SummaryCard label="Total Requests" value={total} />
              <SummaryCard label="Not Solved"     value={notSolved} />
              <SummaryCard label="Solved"         value={solved} />
            </div>

            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1f2937', margin: 0 }}>Assigned Service Requests</h2>
                <span style={{ fontSize: 13, color: '#9CA3AF' }}>{serviceRequests.length} request(s)</span>
              </div>

              {serviceRequests.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', color: '#6B7280' }}>No requests assigned to you yet.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                    <thead>
                      <tr style={{ background: '#F9FAFB' }}>
                        {['ID', 'Property', 'Type', 'Priority', 'Status', 'Inspector Status', 'Action'].map(function(h) {
                          return (
                            <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #E5E7EB' }}>
                              {h}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {serviceRequests.map(function(request) {
                        return (
                          <tr key={request.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: '#1f2937' }}>{request.id}</td>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ fontSize: 14, color: '#374151', fontWeight: 600 }}>{request.propertyId}</div>
                              <div style={{ fontSize: 12, color: '#6b7280' }}>{request.propertyAddress}</div>
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: 14, color: '#374151' }}>{request.inspectionType}</td>
                            <td style={{ padding: '14px 16px' }}><PriorityBadge priority={request.priority} /></td>
                            <td style={{ padding: '14px 16px' }}><StatusBadge status={request.status} /></td>
                            <td style={{ padding: '14px 16px' }}><StatusBadge status={request.inspectorStatus} /></td>
                            <td style={{ padding: '14px 16px' }}>
                              <button onClick={function() { setSelectedServiceRequest(request); }} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #3B82F6', background: '#EFF6FF', color: '#3B82F6', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                                View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
