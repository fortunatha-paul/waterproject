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

function DetailRow({ label, value }) {
  return (
    <div style={{ background: '#fff', padding: 14, borderRadius: 10, border: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: '#1f2937' }}>{value}</div>
    </div>
  );
}

function ReportCard({ report, onViewReport, onMarkReviewed, onMarkActioned }) {
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16 }}>
        <DetailRow label="Inspector" value={report.inspector?.name || 'N/A'} />
        <DetailRow label="Visit Date" value={report.visit_date || 'N/A'} />
        <DetailRow label="Area Visited" value={report.area_visited || 'N/A'} />
        <DetailRow label="Submitted" value={new Date(report.created_at).toLocaleDateString()} />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <button
          onClick={() => onViewReport(report)}
          style={{
            padding: '10px 16px', borderRadius: 8, border: 'none',
            background: '#3B82F6', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}
        >
          View Report
        </button>
        {report.status === 'Submitted' && (
          <button
            onClick={() => onMarkReviewed(report.id)}
            style={{
              padding: '10px 16px', borderRadius: 8, border: 'none',
              background: '#FFFBEB', color: '#B45309', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Mark Reviewed
          </button>
        )}
        <button
          onClick={() => onMarkActioned(report.id)}
          style={{
            padding: '10px 16px', borderRadius: 8, border: 'none',
            background: '#F0FDF4', color: '#15803D', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Mark Actioned
        </button>
      </div>
    </div>
  );
}

function ReportDetail({ report, onBack, onMarkReviewed, onMarkActioned }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      <button
        onClick={onBack}
        style={{
          marginBottom: 20,
          padding: '10px 16px',
          borderRadius: 8,
          border: '1px solid #d1d5db',
          background: '#f9fafb',
          color: '#374151',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        ← Back to report list
      </button>

      <div style={{ display: 'grid', gap: 18 }}>
        <div>
          <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
            Report Details
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1f2937', margin: 0 }}>{report.title}</h2>
          <div style={{ marginTop: 6, fontSize: 13, color: '#6b7280' }}>
            Report #{report.id} · Submitted {new Date(report.created_at).toLocaleDateString()}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <DetailRow label="Inspector" value={report.inspector?.name || 'N/A'} />
          <DetailRow label="Visit Date" value={report.visit_date || 'N/A'} />
          <DetailRow label="Water Supply" value={report.water_supply_status || 'N/A'} />
          <DetailRow label="Pipe Condition" value={report.pipe_condition || 'N/A'} />
          <DetailRow label="Sewage Issue" value={report.sewage_issue ? 'Yes' : 'No'} />
          {report.request && <DetailRow label="Request" value={`REQ-${report.request.id}`} />}
        </div>

        <div style={{ padding: '18px', background: '#F9FAFB', borderRadius: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1E40AF', marginBottom: 8 }}>Findings</div>
          <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{report.findings}</div>
        </div>

        <div style={{ padding: '18px', background: '#F9FAFB', borderRadius: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1E40AF', marginBottom: 8 }}>Work Done</div>
          <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{report.work_done}</div>
        </div>

        <div style={{ padding: '18px', background: '#F9FAFB', borderRadius: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1E40AF', marginBottom: 8 }}>Recommendations</div>
          <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{report.recommendations}</div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {report.status === 'Submitted' && (
            <button
              onClick={() => onMarkReviewed(report.id)}
              style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#FFFBEB', color: '#B45309', fontWeight: 700, cursor: 'pointer' }}
            >
              Mark Reviewed
            </button>
          )}
          <button
            onClick={() => onMarkActioned(report.id)}
            style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#F0FDF4', color: '#15803D', fontWeight: 700, cursor: 'pointer' }}
          >
            Mark Actioned
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DepartmentReportsView({ serveTypes, departmentName }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState(null);
  const [viewingReport, setViewingReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      configureAxios();
      const response = await axios.get(API_URL + '/inspector-reports');
      const filtered = response.data.filter((report) => {
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
      await axios.patch(API_URL + '/inspector-reports/' + reportId, { status: 'Reviewed' });
      await fetchReports();
    } catch (err) {
      alert('Failed to update report status');
    }
  };

  const handleMarkActioned = async (reportId) => {
    try {
      configureAxios();
      await axios.patch(API_URL + '/inspector-reports/' + reportId, { status: 'Actioned' });
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

  const handleViewReport = (report) => {
    setViewingReport(report);
  };

  const handleBackToList = () => {
    setViewingReport(null);
  };

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

      {!loading && reports.length > 0 && !viewingReport && (
        <>
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid #e5e7eb', paddingBottom: 16, flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('all')}
              style={tabButtonStyle(activeTab === 'all')}
            >
              All ({reports.length})
            </button>
            <button
              onClick={() => setActiveTab('new')}
              style={tabButtonStyle(activeTab === 'new')}
            >
              New ({reports.filter((r) => r.status === 'Submitted').length})
            </button>
            <button
              onClick={() => setActiveTab('reviewed')}
              style={tabButtonStyle(activeTab === 'reviewed')}
            >
              Reviewed ({reports.filter((r) => r.status === 'Reviewed').length})
            </button>
            <button
              onClick={() => setActiveTab('actioned')}
              style={tabButtonStyle(activeTab === 'actioned')}
            >
              Actioned ({reports.filter((r) => r.status === 'Actioned').length})
            </button>
          </div>
          <div>
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onViewReport={handleViewReport}
                onMarkReviewed={handleMarkReviewed}
                onMarkActioned={handleMarkActioned}
              />
            ))}
          </div>
        </>
      )}

      {viewingReport && (
        <ReportDetail
          report={viewingReport}
          onBack={handleBackToList}
          onMarkReviewed={handleMarkReviewed}
          onMarkActioned={handleMarkActioned}
        />
      )}
    </div>
  );
}

function tabButtonStyle(active) {
  return {
    padding: '8px 16px',
    borderRadius: 8,
    border: 'none',
    background: active ? '#3B82F6' : '#F3F4F6',
    color: active ? '#fff' : '#6B7280',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  };
}
