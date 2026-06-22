import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../utils/api';
import KpiCards from '../Custome Service/components/KpiCards';
import RequestsTable from '../Custome Service/components/RequestsTable';
import HodRequestDetails from './components/HodRequestDetails';
import AssignTaskModal from '../Custome Service/components/AssignTaskModal';
import DepartmentReportsView from '../components/DepartmentReportsView';
import DashboardStateManager from '../../../utils/dashboardState';

const HodDashboard = () => {
    const { user, logout } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [assignModalRequest, setAssignModalRequest] = useState(null);
    const [activeTab, setActiveTab] = useState('requests');

    const [stateManager] = useState(() => new DashboardStateManager('hod'));

    useEffect(() => {
        const savedState = stateManager.loadState();
        if (savedState) {
            setRequests(savedState.requests || []);
            setLoading(savedState.loading !== undefined ? savedState.loading : false);
            setSelectedRequest(savedState.selectedRequest || null);
            setAssignModalRequest(savedState.assignModalRequest || null);
        }
        fetchRequests();
    }, [stateManager]);

    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.getRequests();
            const transformedRequests = data.map(request => ({
                id: `REQ-${request.id}`,
                rawId: request.id,
                customerName: request.user?.name || 'Unknown',
                customerEmail: request.user?.email || 'N/A',
                customerPhone: request.user?.phone_number || 'N/A',
                serviceType: request.serve_type || 'General',
                date: new Date(request.created_at).toISOString().split('T')[0],
                status: request.status || 'Submitted',
                priority: request.priority || 'Medium',
                description: request.description,
                location: request.location,
                assignedStaff: request.assigned_staff,
                deadline: request.deadline,
                application_form: request.application_form || null,
                rejection_reason: request.rejection_reason || null,
                images: [],
                comments: Array.isArray(request.comments) ? request.comments : [],
                timeline: Array.isArray(request.timeline) ? request.timeline : [{
                    date: new Date(request.created_at).toISOString().split('T')[0],
                    event: 'Request Submitted',
                    by: request.user?.name || 'Customer'
                }],
            }));
            setRequests(transformedRequests);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const stats = {
        total:      requests.length,
        pending:    requests.filter((r) => r.status === 'Submitted' || r.status === 'Reviewed').length,
        inProgress: requests.filter((r) => r.status === 'In Progress').length,
        completed:  requests.filter((r) => r.status === 'Completed').length,
        urgent:     requests.filter((r) => r.priority === 'Urgent' || r.priority === 'High').length,
    };

    const handleView = (req) => {
        const fresh = requests.find((r) => r.id === req.id) || req;
        setSelectedRequest(fresh);
    };

    const handleAssign = (req) => {
        const fresh = requests.find((r) => r.id === req.id) || req;
        setAssignModalRequest(fresh);
    };

    const handleUpdate = (req) => {
        const fresh = requests.find((r) => r.id === req.id) || req;
        setAssignModalRequest(fresh);
    };

    const handleSaveAssignment = async (updatedReq) => {
        setRequests((prev) => prev.map((r) => (r.id === updatedReq.id ? updatedReq : r)));
        if (selectedRequest && selectedRequest.id === updatedReq.id) {
            setSelectedRequest(updatedReq);
        }
        await fetchRequests();
    };

    useEffect(() => {
        stateManager.saveState({ requests, loading, selectedRequest, assignModalRequest });
    }, [requests, loading, selectedRequest, assignModalRequest, stateManager]);

    if (selectedRequest) {
        return (
            <HodRequestDetails
                request={selectedRequest}
                onBack={() => { setSelectedRequest(null); fetchRequests(); }}
                onAssign={(req) => setAssignModalRequest(req)}
                onStatusChange={(req) => setAssignModalRequest(req)}
                onRequestUpdated={fetchRequests}
            />
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
                padding: '20px 48px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', flexWrap: 'wrap', gap: 16, position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(59,130,246,0.15) 0%, transparent 50%)', pointerEvents: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>💧</div>
                    <div>
                        <div style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>HOD Portal</div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{user?.name || 'Staff'} — Water Service Management</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
                    <div style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.08)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)' }}>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Role</div>
                        <div style={{ fontSize: 13, color: '#93C5FD', fontWeight: 600 }}>Head of Department</div>
                    </div>
                    <button onClick={logout} style={{ padding: '10px 22px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                        🚪 Logout
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ background: '#fff', borderBottom: '2px solid #E5E7EB', padding: '0 48px', display: 'flex' }}>
                <button onClick={() => setActiveTab('requests')} style={{ padding: '16px 28px', border: 'none', borderBottom: activeTab === 'requests' ? '3px solid #1e40af' : '3px solid transparent', background: 'transparent', fontSize: 15, fontWeight: activeTab === 'requests' ? 700 : 500, color: activeTab === 'requests' ? '#1e40af' : '#6B7280', cursor: 'pointer' }}>
                    Requests
                </button>
                <button onClick={() => setActiveTab('reports')} style={{ padding: '16px 28px', border: 'none', borderBottom: activeTab === 'reports' ? '3px solid #1e40af' : '3px solid transparent', background: 'transparent', fontSize: 15, fontWeight: activeTab === 'reports' ? 700 : 500, color: activeTab === 'reports' ? '#1e40af' : '#6B7280', cursor: 'pointer' }}>
                    Inspector Reports
                </button>
            </div>

            {activeTab === 'reports' && (
                <DepartmentReportsView
                    serveTypes={['New Connection', 'Remove Sewage Water']}
                    departmentName="HOD Sanitation"
                />
            )}

            {activeTab === 'requests' && (
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>
                    <div style={{ marginBottom: 24 }}>
                        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', margin: 0 }}>Service Dashboard</h1>
                        <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0' }}>Manage and track all sanitation and new connection requests</p>
                    </div>
                    <KpiCards stats={stats} />
                    <RequestsTable
                        requests={requests}
                        loading={loading}
                        onView={handleView}
                        onAssign={handleAssign}
                        onUpdate={handleUpdate}
                        statusOptions={['All', 'Submitted', 'Reviewed', 'Approved', 'Rejected', 'Assigned', 'In Progress', 'Completed']}
                        serviceTypeOptions={['All', 'New Connection', 'Remove Sewage Water']}
                    />
                </div>
            )}

            {assignModalRequest && (
                <AssignTaskModal
                    request={assignModalRequest}
                    onClose={() => setAssignModalRequest(null)}
                    onSave={handleSaveAssignment}
                />
            )}
        </div>
    );
};

export default HodDashboard;