import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';
import MDReportViewer from './components/MDReportViewer';

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
  const [users, setUsers] = useState([]);
  const [viewReport, setViewReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [userFormVisible, setUserFormVisible] = useState(false);
  const [userFormMode, setUserFormMode] = useState('add');
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: '',
    nida: '',
    house_number: '',
    district: '',
    ward: '',
    role: 'customer',
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Requests');

  useEffect(function() {
    configureAxios();
    fetchAll();
  }, []);

  const fetchAll = async function() {
    try {
      setLoading(true);
      const [reqRes, repRes, userRes] = await Promise.all([
        axios.get(API_URL + '/requests'),
        axios.get(API_URL + '/inspector-reports'),
        axios.get(API_URL + '/users'),
      ]);
      setRequests(Array.isArray(reqRes.data) ? reqRes.data : []);
      setReports(Array.isArray(repRes.data) ? repRes.data : []);
      setUsers(Array.isArray(userRes.data) ? userRes.data : []);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async function() {
    try {
      const userRes = await axios.get(API_URL + '/users');
      setUsers(Array.isArray(userRes.data) ? userRes.data : []);
    } catch(err) {
      console.error(err);
    }
  };

  const openAddUser = function() {
    setSelectedUser(null);
    setUserFormMode('add');
    setUserFormData({
      name: '',
      email: '',
      password: '',
      phone_number: '',
      nida: '',
      house_number: '',
      district: '',
      ward: '',
      role: 'customer',
    });
    setUserFormVisible(true);
  };

  const openEditUser = function(user) {
    setSelectedUser(user);
    setUserFormMode('edit');
    setUserFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      phone_number: user.phone_number || '',
      nida: user.nida || '',
      house_number: user.house_number || '',
      district: user.district || '',
      ward: user.ward || '',
      role: user.role || 'customer',
    });
    setUserFormVisible(true);
  };

  const closeUserForm = function() {
    setSelectedUser(null);
    setUserFormVisible(false);
  };

  const handleUserFormChange = function(field, value) {
    setUserFormData(prev => ({ ...prev, [field]: value }));
  };

  const submitUserForm = async function(event) {
    event.preventDefault();

    try {
      if (userFormMode === 'add') {
        await axios.post(API_URL + '/users', userFormData);
      } else if (userFormMode === 'edit' && selectedUser) {
        await axios.put(API_URL + '/users/' + selectedUser.id, {
          name: userFormData.name,
          email: userFormData.email,
          phone_number: userFormData.phone_number,
          nida: userFormData.nida,
          house_number: userFormData.house_number,
          district: userFormData.district,
          ward: userFormData.ward,
          role: userFormData.role,
        });
      }
      await fetchUsers();
      setUserFormVisible(false);
    } catch (err) {
      console.error(err);
      alert('Unable to save user. Please check the form and try again.');
    }
  };

  const handleDeleteUser = async function(user) {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axios.delete(API_URL + '/users/' + user.id);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Unable to delete user.');
    }
  };

  const handleResetPassword = async function(user) {
    const password = window.prompt('Enter new password for ' + user.name + ':');
    if (!password) return;
    try {
      await axios.put(API_URL + '/users/' + user.id + '/reset-password', { password });
      alert('Password reset successfully.');
    } catch (err) {
      console.error(err);
      alert('Unable to reset password.');
    }
  };

  // Department filter config
  const deptConfig = {
    'All':              { types: null,          label: 'All Departments' },
    'HOD Sanitation':   { types: ['New Connection', 'Remove Sewage Water'], label: 'HOD Sanitation' },
    'Customer Service': { types: ['Repair', 'Meter Replacement', 'Complaint', 'No Water Supply', 'Other'], label: 'Customer Service' },
    //'Finance':          { types: ['Billing Issue'], label: 'Finance' },
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

      {/* Tabs header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '0 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1f2937' }}>Water Project Management</div>
            <div style={{ fontSize: 13, color: '#6B7280' }}>Manage users, requests, and reports in a single dashboard.</div>
          </div>
          <button onClick={fetchAll} style={{ padding: '10px 18px', border: '1px solid #D1D5DB', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
            🔄 Refresh
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, padding: '10px 0 18px' }}>
          {['Requests', 'Users', 'Reports'].map(function(tab) {
            return (
              <button key={tab} onClick={function() { setActiveTab(tab); }}
                style={{ padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  background: activeTab === tab ? '#1e40af' : '#F3F4F6',
                  color: activeTab === tab ? '#fff' : '#374151',
                }}>
                {tab}
              </button>
            );
          })}
        </div>
      </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>

        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#6B7280' }}>Loading data...</div>
        ) : (
          <>
            {/* User Management Section */}
            {activeTab === 'Users' && (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: 28 }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', margin: 0 }}>User Management</h2>
                </div>
                <button onClick={openAddUser} style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid #D1D5DB', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>
                  + Add New User
                </button>
              </div>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: '24px' }}>
                <StatCard label="Total Users" value={users.length} color="#1D4ED8" bg="#EFF6FF" />
                <StatCard label="Inspectors" value={users.filter(u => u.role === 'inspector').length} color="#8B5CF6" bg="#EDE9FE" />
                <StatCard label="Customers" value={users.filter(u => u.role === 'customer').length} color="#10B981" bg="#D1FAE5" />
                <StatCard label="Staff" value={users.filter(u => ['customer_service', 'hod_sanitation'].includes(u.role)).length} color="#F59E0B" bg="#FEF3C7" />
              </div>

              <div style={{ padding: '0 24px 24px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {['All', 'customer', 'inspector', 'customer_service', 'hod_sanitation'].map(function(role) {
                  const label = role === 'All' ? 'All Roles' : role === 'customer_service' ? 'Customer Service' : role === 'hod_sanitation' ? 'HOD Sanitation' : role.toUpperCase();
                  return (
                    <button key={role} onClick={function() { setRoleFilter(role); }}
                      style={{ padding: '8px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                        background: roleFilter === role ? '#1e40af' : '#F3F4F6',
                        color: roleFilter === role ? '#fff' : '#374151',
                      }}>
                      {label}
                    </button>
                  );
                })}
              </div>

              {userFormVisible && (
                <div style={{ padding: '0 24px 24px' }}>
                  <form onSubmit={submitUserForm} style={{ display: 'grid', gap: 16, background: '#F8FAFC', borderRadius: 12, padding: 20, border: '1px solid #E5E7EB' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#334155' }}>
                        Name
                        <input value={userFormData.name} onChange={function(e) { handleUserFormChange('name', e.target.value); }} placeholder="Full name" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #CBD5E1' }} required />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#334155' }}>
                        Email
                        <input value={userFormData.email} onChange={function(e) { handleUserFormChange('email', e.target.value); }} placeholder="Email address" type="email" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #CBD5E1' }} required disabled={userFormMode === 'edit' && selectedUser && selectedUser.role === 'hod_sanitation'} />
                        {userFormMode === 'edit' && selectedUser && selectedUser.role === 'hod_sanitation' && (
                          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>
                            Departmental account — email cannot be changed here.
                          </div>
                        )}
                      </label>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#334155' }}>
                        Phone Number
                        <input value={userFormData.phone_number} onChange={function(e) { handleUserFormChange('phone_number', e.target.value); }} placeholder="Phone number" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #CBD5E1' }} />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#334155' }}>
                        NIDA
                        <input value={userFormData.nida} onChange={function(e) { handleUserFormChange('nida', e.target.value); }} placeholder="NIDA number" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #CBD5E1' }} />
                      </label>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#334155' }}>
                        House Number
                        <input value={userFormData.house_number} onChange={function(e) { handleUserFormChange('house_number', e.target.value); }} placeholder="House number" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #CBD5E1' }} required />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#334155' }}>
                        District
                        <input value={userFormData.district} onChange={function(e) { handleUserFormChange('district', e.target.value); }} placeholder="District" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #CBD5E1' }} required />
                      </label>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#334155' }}>
                        Ward
                        <input value={userFormData.ward} onChange={function(e) { handleUserFormChange('ward', e.target.value); }} placeholder="Ward" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #CBD5E1' }} required />
                      </label>
                    </div>
                    {userFormMode === 'add' && (
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#334155' }}>
                        Password
                        <input value={userFormData.password} onChange={function(e) { handleUserFormChange('password', e.target.value); }} placeholder="Password" type="password" style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #CBD5E1' }} required />
                      </label>
                    )}
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#334155' }}>
                      Role
                      <select value={userFormData.role} onChange={function(e) { handleUserFormChange('role', e.target.value); }} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #CBD5E1' }} disabled={userFormMode === 'edit' && selectedUser && selectedUser.role === 'hod_sanitation'}>
                        <option value="customer">Customer</option>
                        <option value="customer_service">Customer Service</option>
                        <option value="inspector">Inspector</option>
                        <option value="hod_sanitation">HOD Sanitation</option>
                      </select>
                    </label>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <button type="button" onClick={closeUserForm} style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid #D1D5DB', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>
                        Cancel
                      </button>
                      <button type="submit" style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: '#1e40af', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                        {userFormMode === 'add' ? 'Create User' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div style={{ overflowX: 'auto', padding: '0 24px 24px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB' }}>
                      {['Name', 'Email', 'Role', 'Phone', 'NIDA', 'Actions'].map(function(h) {
                        return <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', borderBottom: '1px solid #E5E7EB' }}>{h}</th>;
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(function(u) {
                      return roleFilter === 'All' ? true : u.role === roleFilter;
                    }).map(function(u) {
                      const roleLabel = u.role === 'customer_service' ? 'Customer Service' : u.role === 'hod_sanitation' ? 'HOD Sanitation' : u.role === 'md' ? 'MD' : u.role.charAt(0).toUpperCase() + u.role.slice(1);
                      return (
                        <tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: '#111827' }}>{u.name}</td>
                          <td style={{ padding: '14px 16px', fontSize: 14, color: '#374151' }}>{u.email}</td>
                          <td style={{ padding: '14px 16px', fontSize: 14, color: '#374151' }}>{roleLabel}</td>
                          <td style={{ padding: '14px 16px', fontSize: 14, color: '#374151' }}>{u.phone_number || '-'}</td>
                          <td style={{ padding: '14px 16px', fontSize: 14, color: '#374151' }}>{u.nida || '-'}</td>
                          <td style={{ padding: '14px 16px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button type="button" onClick={function() { openEditUser(u); }} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', background: '#fff', color: '#1f2937', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                              Edit
                            </button>
                            <button type="button" onClick={function() { if (u.role === 'hod_sanitation') { alert('Cannot reset password for departmental HOD account.'); return; } handleResetPassword(u); }} disabled={u.role === 'hod_sanitation'} title={u.role === 'hod_sanitation' ? 'Departmental HOD password cannot be reset here' : ''} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', background: u.role === 'hod_sanitation' ? '#f3f4f6' : '#F8FAFC', color: '#1f2937', cursor: u.role === 'hod_sanitation' ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600 }}>
                              Reset
                            </button>
                            <button type="button" onClick={function() { handleDeleteUser(u); }} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #FCAEAB', background: '#FEF2F2', color: '#B91C1C', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            )}

            {/* Requests Section */}
            {activeTab === 'Requests' && (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: 28 }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1f2937', margin: 0 }}>
                  All Requests — {filteredRequests.length} total
                </h2>
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

              {/* Request stat cards (shown only in Requests tab) */}
              <div style={{ display: 'flex', gap: 16, margin: '16px 24px', flexWrap: 'wrap' }}>
                <StatCard label="Total Requests" value={total} color="#1D4ED8" bg="#EFF6FF" />
                <StatCard label="New (Submitted)" value={submitted} color="#6B7280" bg="#F3F4F6" />
                <StatCard label="In Progress" value={inProgress} color="#F59E0B" bg="#FEF3C7" />
                <StatCard label="Completed" value={completed} color="#10B981" bg="#D1FAE5" />
                <StatCard label="Total Reports" value={reports.length} color="#8B5CF6" bg="#EDE9FE" />
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

            {/* Reports Section */}
            {activeTab === 'Reports' && (
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
                        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button onClick={function() { setViewReport(rep); }} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', background: '#fff', color: '#1f2937', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>View Report</button>
                          {rep.status !== 'Actioned' && (
                            <button onClick={async function() { try { await axios.put(API_URL + '/inspector-reports/' + rep.id, { status: 'Reviewed' }); await fetchAll(); } catch(err){ console.error(err); alert('Unable to mark reviewed'); } }} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#374151', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Mark Reviewed</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            )}
            {viewReport && <MDReportViewer report={viewReport} onClose={function() { setViewReport(null); }} />}
          </>
        )}
      </div>
    </div>
  );
}