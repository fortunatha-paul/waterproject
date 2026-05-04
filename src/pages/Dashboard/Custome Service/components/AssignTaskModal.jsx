import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Configure axios with auth token
const configureAxios = () => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

const TECHNICIANS = [
  'Rajesh Kumar', 'Sunil Mehta', 'Anil Sharma', 'Vikram Singh',
  'Priya Patel', 'Amit Joshi', 'Neha Gupta', 'Suresh Rao',
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const STATUSES = ['Pending', 'In Progress', 'Completed', 'Rejected', 'Resolved'];

export default function AssignTaskModal({ request, onClose, onSave }) {
  const [assignedStaff, setAssignedStaff] = useState(request.assignedStaff || '');
  const [priority, setPriority] = useState(request.priority || 'Medium');
  const [deadline, setDeadline] = useState(request.deadline || '');
  const [status, setStatus] = useState(request.status || 'Pending');
  const [note, setNote] = useState('');

  const handleSave = async () => {
    try {
      configureAxios();

      // Extract the numeric ID from REQ-XXX format
      const requestId = request.id.includes('REQ-')
        ? request.id.replace('REQ-', '')
        : request.id;

      const updated = {
        assigned_staff: assignedStaff || null,
        priority,
        deadline: deadline || null,
        status,
      };

      if (note.trim()) {
        updated.comments = [
          ...(request.comments || []),
          { text: note, by: 'Staff', date: new Date().toISOString().split('T')[0] }
        ];
      }

      updated.timeline = [
        ...(request.timeline || []),
        { date: new Date().toISOString().split('T')[0], event: `Status changed to ${status}`, by: 'Staff' },
        ...(assignedStaff && assignedStaff !== request.assignedStaff ? [{ date: new Date().toISOString().split('T')[0], event: `Assigned to ${assignedStaff}`, by: 'Staff' }] : []),
      ];

      // Call API to update the request in database
      await axios.put(`${API_URL}/requests/${requestId}`, updated);

      // Transform the response to match frontend format
      const frontendUpdated = {
        ...request,
        assignedStaff: assignedStaff || null,
        priority,
        deadline: deadline || null,
        status,
        comments: updated.comments,
        timeline: updated.timeline,
      };

      onSave(frontendUpdated);
      onClose();
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Failed to update request. Please try again.');
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000, padding: 20,
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520,
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)', overflow: 'hidden',
        animation: 'slideInUp 0.3s ease-out',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #f0f0f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', margin: 0 }}>
            Assign & Manage — {request.id}
          </h2>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: 'none',
            background: '#F3F4F6', fontSize: 18, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280',
          }}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Assign Technician */}
          <FieldGroup label="Assign Technician">
            <select value={assignedStaff} onChange={(e) => setAssignedStaff(e.target.value)} style={selectStyle}>
              <option value="">— Select Technician —</option>
              {TECHNICIANS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </FieldGroup>

          {/* Priority */}
          <FieldGroup label="Priority">
            <div style={{ display: 'flex', gap: 8 }}>
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  style={priorityBtnStyle(priority === p, p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </FieldGroup>

          {/* Status */}
          <FieldGroup label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={selectStyle}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </FieldGroup>

          {/* Deadline */}
          <FieldGroup label="Deadline">
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              style={{ ...selectStyle, color: deadline ? '#1f2937' : '#9CA3AF' }}
            />
          </FieldGroup>

          {/* Note */}
          <FieldGroup label="Add Note (optional)">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about this assignment..."
              style={{
                ...selectStyle, minHeight: 70, resize: 'vertical', fontFamily: 'inherit',
              }}
            />
          </FieldGroup>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid #f0f0f0',
          display: 'flex', justifyContent: 'flex-end', gap: 10,
        }}>
          <button onClick={onClose} style={{
            padding: '10px 20px', borderRadius: 8, border: '1px solid #d1d5db',
            background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151',
          }}>
            Cancel
          </button>
          <button onClick={handleSave} style={{
            padding: '10px 24px', borderRadius: 8, border: 'none',
            background: '#3B82F6', color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', boxShadow: '0 4px 14px rgba(59,130,246,0.35)',
          }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldGroup({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const selectStyle = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  border: '1px solid #d1d5db', fontSize: 14, background: '#fff',
  outline: 'none', boxSizing: 'border-box',
};

const priorityColors = {
  Low: { active: '#6366F1', bg: '#EEF2FF' },
  Medium: { active: '#F59E0B', bg: '#FFFBEB' },
  High: { active: '#EF4444', bg: '#FEF2F2' },
  Urgent: { active: '#DC2626', bg: '#FEE2E2' },
};

function priorityBtnStyle(isActive, priority) {
  const c = priorityColors[priority] || { active: '#6b7280', bg: '#F3F4F6' };
  return {
    flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.2s',
    border: isActive ? `2px solid ${c.active}` : '2px solid #d1d5db',
    background: isActive ? c.bg : '#fff',
    color: isActive ? c.active : '#6b7280',
  };
}
