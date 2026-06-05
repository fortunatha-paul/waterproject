import React, { useState } from 'react';

const SERVICE_TYPES = ['New Connection', 'Repair', 'Complaint', 'Billing Issue', 'Meter Replacement', 'Remove Sewage Water','No Water Supply', 'Other'];

export default function NewRequestForm({ onClose, onSubmit }) {
  const [form, setForm] = useState({ serviceType: '', description: '', location: '', image: null });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
          setForm((prev) => ({ ...prev, location: loc }));
        },
        () => setForm((prev) => ({ ...prev, location: 'Location unavailable' }))
      );
    }
  };

  const validate = () => {
    const e = {};
    if (!form.serviceType) e.serviceType = 'Please select a service type';
    if (!form.description.trim()) e.description = 'Please describe your issue';
    if (!form.location.trim()) e.location = 'Please provide a location';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    onSubmit(form);
    setSubmitting(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 32, maxWidth: 520, width: '100%',
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', margin: 0 }}>New Request</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 24, cursor: 'pointer',
            color: '#9CA3AF', padding: 0, lineHeight: 1,
          }}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Service Type *
            </label>
            <select name="serviceType" value={form.serviceType} onChange={handleChange} style={{
              width: '100%', padding: '10px 12px', borderRadius: 8,
              border: errors.serviceType ? '1px solid #EF4444' : '1px solid #D1D5DB',
              fontSize: 14, color: form.serviceType ? '#111827' : '#9CA3AF',
              background: '#fff', boxSizing: 'border-box', outline: 'none',
            }}>
              <option value="">Select service type</option>
              {SERVICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.serviceType && <span style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.serviceType}</span>}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Describe Issue *
            </label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4}
              placeholder="Describe your issue in detail..." style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: errors.description ? '1px solid #EF4444' : '1px solid #D1D5DB',
                fontSize: 14, resize: 'vertical', fontFamily: 'inherit',
                boxSizing: 'border-box', outline: 'none',
              }} />
            {errors.description && <span style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.description}</span>}
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Location *
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input name="location" value={form.location} onChange={handleChange}
                placeholder="Enter location or use auto-detect" style={{
                  flex: 1, padding: '10px 12px', borderRadius: 8,
                  border: errors.location ? '1px solid #EF4444' : '1px solid #D1D5DB',
                  fontSize: 14, boxSizing: 'border-box', outline: 'none',
                }} />
              <button type="button" onClick={handleGetLocation} style={{
                padding: '10px 16px', borderRadius: 8, border: '1px solid #3B82F6',
                background: '#EFF6FF', color: '#3B82F6', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}>
                Auto Detect
              </button>
            </div>
            {errors.location && <span style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.location}</span>}
          </div>

          <button type="submit" disabled={submitting} style={{
            width: '100%', padding: '12px 24px', borderRadius: 10, border: 'none',
            background: submitting ? '#93C5FD' : '#3B82F6', color: '#fff',
            fontSize: 15, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}>
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
