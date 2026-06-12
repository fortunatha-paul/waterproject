import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const configureAxios = () => {
  const token = localStorage.getItem('auth_token');
  if (token) axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
};

function ReportStatusBadge({ status }) {
  const cfg = {
    Submitted: { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
    Reviewed: { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
    Actioned: { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
  };
  const c = cfg[status] || cfg.Submitted;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '4px 12px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 700,
        background: c.bg,
        color: c.color,
        border: '1px solid ' + c.border,
      }}
    >
      {status}
    </span>
  );
}

function ReportCard({ report, onMarkReviewed, onMarkActioned }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: 20,
        border: '1px solid #e5e7eb',
        marginBottom: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>
            REPORT #{report.id}
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1F2937', margin: '0 0 8px 0' }}>
            {report.title}
          </h3>
          {report.request && (
            <div style={{ fontSize: 13, color: '#3B82F6', fontWeight: 600 }}>
              Linked to REQ-{report.request.id}
            </div>
          )}
        </div>
        <ReportStatusBadge status={report.status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #e5e7eb' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', marginBottom: 4 }}>
            Inspector
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>
            {report.inspector?.name || 'N/A'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', marginBottom: 4 }}>
            Visit Date
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>
            {report.visit_date}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', marginBottom: 4 }}>
            Area Visited
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>
            {report.area_visited}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', marginBottom: 4 }}>
            Submitted
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>
            {new Date(report.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 }}>
          Findings
        </div>
        <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, background: '#F9FAFB', padding: 12, borderRadius: 8 }}>
          {report.findings}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 }}>
          Work Done
        </div>
        <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, background: '#F9FAFB', padding: 12, borderRadius: 8 }}>
          {report.work_done}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 }}>
          Recommendations
        </div>
        <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, background: '#F9FAFB', padding: 12, borderRadius: 8 }}>
          {report.recommendations}
        </div>
      </div>

      {report.water_supply_status && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #e5e7eb' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', marginBottom: 4 }}>
              Water Supply
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>
              {report.water_supply_status}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', marginBottom: 4 }}>
              Pipe Condition
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>
              {report.pipe_condition}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', marginBottom: 4 }}>
              Sewage Issue
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: report.sewage_issue ? '#EF4444' : '#10B981' }}>
              {report.sewage_issue ? 'Yes' : 'No'}
            </div>
          </div>
        </div>
      )}

      {report.status === 'Submitted' && (
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => onMarkReviewed(report.id)}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: 8,
              border: 'none',
              background: '#FFFBEB',
              color: '#B45309',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => (e.target.style.background = '#FEF3C7')}
            onMouseLeave={(e) => (e.target.style.background = '#FFFBEB')}
          >
            Mark as Reviewed
          </button>
          <button
            onClick={() => onMarkActioned(report.id)}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: 8,
              border: 'none',
              background: '#F0FDF4',
              color: '#15803D',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => (e.target.style.background = '#DCFCE7')}
            onMouseLeave={(e) => (e.target.style.background = '#F0FDF4')}
          >
            Mark as Actioned
          </button>
        </div>
      )}
    </div>
  );
}

export default function DepartmentReportsView({ serveTypes, departmentName }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      configureAxios();
      const response = await axios.get(API_URL + '/inspector-reports');
      
      // Filter reports by request serve_type
      const filtered = response.data.filter(report => {
        if (!report.request) return true;
        return serveTypes.includes(report.request.serve_type);
      });
      
      setReports(filtered);
      setError(null);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReviewed = async (reportId) => {
    try {
      configureAxios();
      await axios.patch(API_URL + '/inspector-reports/' + reportId, {
        status: 'Reviewed',
      });
      // Refresh reports
      await fetchReports();
    } catch (err) {
      alert('Failed to update report status');
    }
  };

  const handleMarkActioned = async (reportId) => {
    try {
      configureAxios();
      await axios.patch(API_URL + '/inspector-reports/' + reportId, {
        status: 'Actioned',
      });
      // Refresh reports
      await fetchReports();
    } catch (err) {
      alert('Failed to update report status');
    }
  };

  const filteredReports =
    activeTab === 'all'
      ? reports
      : activeTab === 'new'
      ? reports.filter((r) => r.status === 'Submitted')
      : activeTab === 'reviewed'
      ? reports.filter((r) => r.status === 'Reviewed')
      : reports.filter((r) => r.status === 'Actioned');

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb', marginTop: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', margin: '0 0 16px 0' }}>
          Inspector Reports
        </h2>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
          Reports from inspectors for {departmentName} service requests
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '32px', color: '#6B7280', fontSize: 14 }}>
          Loading reports...
        </div>
      )}

      {error && (
        <div
          style={{
            background: '#FEE2E2',
            color: '#991B1B',
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {!loading && reports.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px', color: '#6B7280', fontSize: 14 }}>
          No reports yet
        </div>
      )}

      {!loading && reports.length > 0 && (
        <>
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid #e5e7eb', paddingBottom: 16 }}>
            <button
              onClick={() => setActiveTab('all')}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: activeTab === 'all' ? '#3B82F6' : '#F3F4F6',
                color: activeTab === 'all' ? '#fff' : '#6B7280',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              All ({reports.length})
            </button>
            <button
              onClick={() => setActiveTab('new')}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: activeTab === 'new' ? '#3B82F6' : '#F3F4F6',
                color: activeTab === 'new' ? '#fff' : '#6B7280',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              New ({reports.filter((r) => r.status === 'Submitted').length})
            </button>
            <button
              onClick={() => setActiveTab('reviewed')}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: activeTab === 'reviewed' ? '#3B82F6' : '#F3F4F6',
                color: activeTab === 'reviewed' ? '#fff' : '#6B7280',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reviewed ({reports.filter((r) => r.status === 'Reviewed').length})
            </button>
            <button
              onClick={() => setActiveTab('actioned')}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: activeTab === 'actioned' ? '#3B82F6' : '#F3F4F6',
                color: activeTab === 'actioned' ? '#fff' : '#6B7280',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Actioned ({reports.filter((r) => r.status === 'Actioned').length})
            </button>
          </div>

          <div>
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onMarkReviewed={handleMarkReviewed}
                onMarkActioned={handleMarkActioned}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
