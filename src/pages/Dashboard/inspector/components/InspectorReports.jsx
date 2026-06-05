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
    Reviewed:  { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
    Actioned:  { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
  };
  const c = cfg[status] || cfg.Submitted;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: c.bg, color: c.color, border: '1px solid ' + c.border }}>
      {status}
    </span>
  );
}

function FieldGroup({ label, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{label}</label>
      {children}
      {error && <span style={{ fontSize: 12, color: '#EF4444' }}>{error}</span>}
    </div>
  );
}

function getInputStyle(hasError) {
  return {
    width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 14, outline: 'none',
    boxSizing: 'border-box', color: '#1f2937', background: '#fff',
    border: '1.5px solid ' + (hasError ? '#EF4444' : '#D1D5DB'),
  };
}

function ReportDetail({ report, onBack, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Delete this report?')) return;
    try {
      setDeleting(true);
      configureAxios();
      await axios.delete(API_URL + '/inspector-reports/' + report.id);
      onDelete(report.id);
      onBack();
    } catch (err) {
      alert('Failed to delete report.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button onClick={onBack} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #D1D5DB', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
          Back to Reports
        </button>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <ReportStatusBadge status={report.status} />
          {report.status === 'Submitted' && (
            <button onClick={handleDelete} disabled={deleting} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#FEE2E2', color: '#991B1B', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', borderRadius: 14, padding: '28px 32px', marginBottom: 20, color: '#fff' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
          INSPECTION REPORT #{report.id}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>{report.title}</div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Area Visited</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#93C5FD' }}>{report.area_visited}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Visit Date</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#93C5FD' }}>{report.visit_date}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Inspector</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#93C5FD' }}>{report.inspector ? report.inspector.name : 'N/A'}</div>
          </div>
          {report.request_id && (
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Linked Request</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#93C5FD' }}>REQ-{report.request_id}</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#374151', marginBottom: 10, textTransform: 'uppercase' }}>Findings on Site</div>
          <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: 0 }}>{report.findings}</p>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#374151', marginBottom: 10, textTransform: 'uppercase' }}>Work Done</div>
          <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: 0 }}>{report.work_done}</p>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#374151', marginBottom: 10, textTransform: 'uppercase' }}>Recommendations</div>
          <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: 0 }}>{report.recommendations}</p>
        </div>
      </div>
    </div>
  );
}

export function ReportForm({ requestId, requestInfo, onSave, onCancel }) {
  const [title, setTitle] = useState(requestInfo ? 'Inspection Report - ' + requestInfo : '');
  const [areaVisited, setAreaVisited] = useState('');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [findings, setFindings] = useState('');
  const [workDone, setWorkDone] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!areaVisited.trim()) e.areaVisited = 'Area is required';
    if (!visitDate) e.visitDate = 'Visit date is required';
    if (!findings.trim()) e.findings = 'Findings are required';
    if (!workDone.trim()) e.workDone = 'Work done is required';
    if (!recommendations.trim()) e.recommendations = 'Recommendations are required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      configureAxios();
      const payload = {
        title,
        area_visited: areaVisited,
        visit_date: visitDate,
        request_id: requestId || null,
        findings,
        work_done: workDone,
        recommendations,
        water_supply_status: 'Normal',
        pipe_condition: 'Good',
        sewage_issue: false,
      };
      const res = await axios.post(API_URL + '/inspector-reports', payload);
      onSave(res.data);
    } catch (err) {
      alert('Failed to save report. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 32, border: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>Write Inspection Report</h2>
          {requestId && (
            <div style={{ fontSize: 13, color: '#3B82F6', fontWeight: 600, marginTop: 4 }}>
              Linked to REQ-{requestId}
            </div>
          )}
          <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>
            This report will be visible to HOD Sanitation, Customer Service, and Finance
          </p>
        </div>
        <button onClick={onCancel} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #D1D5DB', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
          Cancel
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <FieldGroup label="Report Title" error={errors.title}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Inspection of Kinondoni Ward 3" style={getInputStyle(errors.title)} />
          </FieldGroup>
          <FieldGroup label="Area Visited" error={errors.areaVisited}>
            <input value={areaVisited} onChange={(e) => setAreaVisited(e.target.value)} placeholder="e.g. Kinondoni Ward 3, Block B" style={getInputStyle(errors.areaVisited)} />
          </FieldGroup>
        </div>

        <FieldGroup label="Visit Date" error={errors.visitDate}>
          <input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} style={getInputStyle(errors.visitDate)} />
        </FieldGroup>

        <FieldGroup label="Findings on Site" error={errors.findings}>
          <textarea value={findings} onChange={(e) => setFindings(e.target.value)}
            placeholder="Describe what you found at the site..."
            style={Object.assign({}, getInputStyle(errors.findings), { minHeight: 100, resize: 'vertical', fontFamily: 'inherit' })} />
        </FieldGroup>

        <FieldGroup label="Work Done" error={errors.workDone}>
          <textarea value={workDone} onChange={(e) => setWorkDone(e.target.value)}
            placeholder="Describe what work was done during this visit..."
            style={Object.assign({}, getInputStyle(errors.workDone), { minHeight: 100, resize: 'vertical', fontFamily: 'inherit' })} />
        </FieldGroup>

        <FieldGroup label="Recommendations" error={errors.recommendations}>
          <textarea value={recommendations} onChange={(e) => setRecommendations(e.target.value)}
            placeholder="Recommendations for HOD Sanitation, Customer Service, and Finance..."
            style={Object.assign({}, getInputStyle(errors.recommendations), { minHeight: 100, resize: 'vertical', fontFamily: 'inherit' })} />
        </FieldGroup>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={onCancel} style={{ padding: '12px 24px', borderRadius: 10, border: '1px solid #D1D5DB', background: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', color: '#374151' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving} style={{
            padding: '12px 32px', borderRadius: 10, border: 'none',
            background: saving ? '#9CA3AF' : '#1D4ED8',
            color: '#fff', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
          }}>
            {saving ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InspectorReports({ user }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    configureAxios();
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL + '/inspector-reports');
      setReports(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  if (view === 'detail' && selected) {
    return (
      <div style={{ padding: '28px 32px' }}>
        <ReportDetail report={selected} onBack={() => setView('list')} onDelete={handleDelete} />
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>Inspection Reports</h1>
        <p style={{ fontSize: 14, color: '#6B7280', margin: '4px 0 0' }}>Reports submitted after field visits</p>
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#6B7280' }}>Loading reports...</div>
      ) : reports.length === 0 ? (
        <div style={{ padding: 64, textAlign: 'center', background: '#F9FAFB', borderRadius: 14, border: '2px dashed #E5E7EB' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#374151', marginBottom: 4 }}>No reports yet</div>
          <div style={{ fontSize: 13, color: '#9CA3AF' }}>Open a service request and click Write Report</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reports.map((rep) => (
            <div key={rep.id}
              onClick={() => { setSelected(rep); setView('detail'); }}
              style={{ background: '#fff', borderRadius: 12, padding: '18px 22px', border: '1px solid #E5E7EB', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{rep.title}</div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, color: '#6B7280' }}>Area: {rep.area_visited}</span>
                    <span style={{ fontSize: 13, color: '#6B7280' }}>Date: {rep.visit_date}</span>
                    {rep.request_id && <span style={{ fontSize: 13, color: '#3B82F6', fontWeight: 600 }}>REQ-{rep.request_id}</span>}
                  </div>
                </div>
                <ReportStatusBadge status={rep.status} />
              </div>
              <div style={{ marginTop: 10, fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>
                {rep.findings && rep.findings.length > 140 ? rep.findings.slice(0, 140) + '...' : rep.findings}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}