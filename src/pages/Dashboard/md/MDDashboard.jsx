import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const configureAxios = () => {
  const token = localStorage.getItem('auth_token');
  if (token) axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
};

function StatCard({ label, value, color, bg }) {
  return (
    <div style={{ background: bg, borderRadius: 12, padding: '20px 24px', border: '1px solid ' + color + '30', flex: 1 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: color, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 36, fontWeight: 800, color: color }}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  var cfg = {
    'Submitted':   { color: '#6B7280', bg: '#F3F4F6' },
    'Reviewed':    { color: '#3B82F6', bg: '#DBEAFE' },
    'Assigned':    { color: '#8B5CF6', bg: '#EDE9FE' },
    'In Progress': { color: '#F59E0B', bg: '#FEF3C7' },
    'Completed':   { color: '#10B981', bg: '#D1FAE5' },
    'Rejected':    { color: '#EF4444', bg: '#FEE2E2' },
  };
  var c = cfg[status] || cfg['Submitted'];
  return (
    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: c.color, background: c.bg }}>
      {status}
    </span>
  );
}

function ReportStatusBadge({ status }) {
  var cfg = {
    'Submitted': { color: '#1D4ED8', bg: '#EFF6FF' },
    'Reviewed':  { color: '#B45309', bg: '#FFFBEB' },
    'Actioned':  { color: '#15803D', bg: '#F0FDF4' },
  };
  var c = cfg[status] || cfg['Submitted'];
  return (
    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: c.color, background: c.bg }}>
      {status}
    </span>
  );
}

export default function MDDashboard() {
  const { user, logout } = useAuth();
  const [requests, setRequests] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');
  const [deptFilter, setDeptFilter] = useState('All');

  useEffect(function() {
    configureAxios();
    fetchAll();
  }, []);

  const fetchAll = async function() {
    try {
      setLoading(true);
      const [reqRes, repRes] = await Promise.all([
        axios.get(API_URL + '/requests'),
        axios.get(API_URL + '/inspector-reports'),
      ]);
      setRequests(Array.isArray(reqRes.data) ? reqRes.data : []);
      setReports(Array.isArray(repRes.data) ? repRes.data : []);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Department filter config
  const deptConfig = {
    'All':              { types: null,          label: 'All Departments' },
    'HOD Sanitation':   { types: ['New Connection', 'Remove Sewage Water'], label: 'HOD Sanitation' },
    'Customer Service': { types: ['Repair', 'Meter Replacement', 'Complaint', 'No Water Supply', 'Other'], label: 'Customer Service' },
    'Finance':          { types: ['Billing Issue'], label: 'Finance' },
  };

  const filteredRequests = deptFilter === 'All'
    ? requests
    : requests.filter(function(r) {
        const types = deptConfig[deptFilter].types;
        return types && types.includes(r.serve_type);
      });

  // Stats
  const total      = requests.length;
  const inProgress = requests.filter(function(r) { return r.status === 'In Progress'; }).length;
  const completed  = requests.filter(function(r) { return r.status === 'Completed'; }).length;
  const submitted  = requests.filter(function(r) { return r.status === 'Submitted'; }).length;

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)', padding: '20px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
            💧
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>Managing Director Portal</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{user ? user.name : 'MD'} — AUWSA Water Service Management</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.08)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Role</div>
            <div style={{ fontSize: 13, color: '#93C5FD', fontWeight: 600 }}>Managing Director</div>
          </div>
          <button onClick={logout} style={{ padding: '10px 22px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: '#fff', borderBottom: '2px solid #E5E7EB', padding: '0 48px', display: 'flex' }}>
        {[['requests', '📋 All Requests'], ['reports', '📝 Inspector Reports']].map(function(tab) {
          return (
            <button key={tab[0]} onClick={function() { setActiveTab(tab[0]); }}
              style={{ padding: '16px 28px', border: 'none', borderBottom: activeTab === tab[0] ? '3px solid #1e40af' : '3px solid transparent', background: 'transparent', fontSize: 15, fontWeight: activeTab === tab[0] ? 700 : 500, color: activeTab === tab[0] ? '#1e40af' : '#6B7280', cursor: 'pointer' }}>
              {tab[1]}
            </button>
          );
        })}
        <button onClick={fetchAll} style={{ marginLeft: 'auto', padding: '10px 18px', border: '1px solid #D1D5DB', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151', alignSelf: 'center', marginRight: 8 }}>
          🔄 Refresh
        </button>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
          <StatCard label="Total Requests"    value={total}      color="#1D4ED8" bg="#EFF6FF" />
          <StatCard label="New (Submitted)"   value={submitted}  color="#6B7280" bg="#F3F4F6" />
          <StatCard label="In Progress"       value={inProgress} color="#F59E0B" bg="#FEF3C7" />
          <StatCard label="Completed"         value={completed}  color="#10B981" bg="#D1FAE5" />
          <StatCard label="Total Reports"     value={reports.length} color="#8B5CF6" bg="#EDE9FE" />
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#6B7280' }}>Loading data...</div>
        ) : (
          <>
            {/* REQUESTS TAB */}
            {activeTab === 'requests' && (
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1f2937', margin: 0 }}>
                    All Requests — {filteredRequests.length} total
                  </h2>
                  {/* Department Filter */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {Object.keys(deptConfig).map(function(dept) {
                      return (
                        <button key={dept} onClick={function() { setDeptFilter(dept); }}
                          style={{ padding: '7px 16px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            background: deptFilter === dept ? '#1e40af' : '#F3F4F6',
                            color: deptFilter === dept ? '#fff' : '#374151',
                          }}>
                          {dept}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {filteredRequests.length === 0 ? (
                  <div style={{ padding: 48, textAlign: 'center', color: '#6B7280' }}>No requests found</div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#F9FAFB' }}>
                          {['ID', 'Customer', 'Service Type', 'Department', 'Location', 'Status', 'Assigned To'].map(function(h) {
                            return <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', borderBottom: '1px solid #E5E7EB' }}>{h}</th>;
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRequests.map(function(req) {
                          // Determine department
                          var dept = 'Finance';
                          if (['New Connection', 'Remove Sewage Water'].includes(req.serve_type)) dept = 'HOD';
                          else if (['Repair', 'Meter Replacement', 'Complaint', 'No Water Supply', 'Other'].includes(req.serve_type)) dept = 'CS';

                          return (
                            <tr key={req.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                              <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: '#3B82F6' }}>REQ-{req.id}</td>
                              <td style={{ padding: '12px 16px', fontSize: 14, color: '#374151' }}>{req.user ? req.user.name : 'N/A'}</td>
                              <td style={{ padding: '12px 16px', fontSize: 14, color: '#374151' }}>{req.serve_type}</td>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                                  background: dept === 'HOD' ? '#EDE9FE' : dept === 'CS' ? '#DBEAFE' : '#D1FAE5',
                                  color: dept === 'HOD' ? '#5B21B6' : dept === 'CS' ? '#1E40AF' : '#065F46',
                                }}>
                                  {dept === 'HOD' ? 'HOD Sanitation' : dept === 'CS' ? 'Customer Service' : 'Finance'}
                                </span>
                              </td>
                              <td style={{ padding: '12px 16px', fontSize: 14, color: '#374151' }}>{req.location}</td>
                              <td style={{ padding: '12px 16px' }}><StatusBadge status={req.status || 'Submitted'} /></td>
                              <td style={{ padding: '12px 16px', fontSize: 14, color: '#374151' }}>{req.assigned_staff || <span style={{ color: '#9CA3AF' }}>Not assigned</span>}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* REPORTS TAB */}
            {activeTab === 'reports' && (
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB' }}>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1f2937', margin: 0 }}>
                    All Inspector Reports — {reports.length} total
                  </h2>
                </div>

                {reports.length === 0 ? (
                  <div style={{ padding: 48, textAlign: 'center', color: '#6B7280' }}>No reports yet</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {reports.map(function(rep) {
                      return (
                        <div key={rep.id} style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                            <div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{rep.title}</div>
                              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 13, color: '#6B7280' }}>👤 {rep.inspector ? rep.inspector.name : 'N/A'}</span>
                                <span style={{ fontSize: 13, color: '#6B7280' }}>📍 {rep.area_visited}</span>
                                <span style={{ fontSize: 13, color: '#6B7280' }}>📅 {rep.visit_date}</span>
                                {rep.request_id && <span style={{ fontSize: 13, color: '#3B82F6', fontWeight: 600 }}>REQ-{rep.request_id}</span>}
                              </div>
                            </div>
                            <ReportStatusBadge status={rep.status} />
                          </div>
                          <div style={{ marginTop: 8, fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>
                            {rep.findings && rep.findings.length > 150 ? rep.findings.slice(0, 150) + '...' : rep.findings}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}