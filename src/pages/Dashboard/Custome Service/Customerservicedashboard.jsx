import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../utils/api';
import KpiCards from './components/KpiCards';
import RequestsTable from './components/RequestsTable';
import RequestDetails from './components/RequestDetails';
import AssignTaskModal from './components/AssignTaskModal';

const CustomerServiceDashboard = () => {
    const { user, logout } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [assignModalRequest, setAssignModalRequest] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await api.getRequests();

            // Transform backend data to match frontend structure
            const transformedRequests = data.map(request => ({
                id: `REQ-${request.id}`,
                customerName: request.user?.name || 'Unknown',
                customerEmail: request.user?.email || 'N/A',
                customerPhone: request.user?.phone_number || 'N/A',
                serviceType: request.serve_type || 'General',
                date: new Date(request.created_at).toISOString().split('T')[0],
                status: request.status || 'Pending',
                priority: request.priority || 'Medium',
                description: request.description,
                location: request.location,
                assignedStaff: request.assigned_staff,
                deadline: request.deadline,
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
    };

    const stats = {
        total: requests.length,
        pending: requests.filter((r) => r.status === 'Pending').length,
        inProgress: requests.filter((r) => r.status === 'In Progress').length,
        completed: requests.filter((r) => r.status === 'Completed').length,
        urgent: requests.filter((r) => r.priority === 'Urgent' || r.priority === 'High').length,
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
        // Update local state immediately for responsive UI
        setRequests((prev) => prev.map((r) => (r.id === updatedReq.id ? updatedReq : r)));
        if (selectedRequest && selectedRequest.id === updatedReq.id) {
            setSelectedRequest(updatedReq);
        }

        // Refresh data from server to ensure consistency
        await fetchRequests();
    };

    const handleStatusChange = (req) => {
        setAssignModalRequest(req);
    };

    if (selectedRequest) {
        return (
            <RequestDetails
                request={selectedRequest}
                onBack={() => setSelectedRequest(null)}
                onAssign={(req) => setAssignModalRequest(req)}
                onStatusChange={(req) => setAssignModalRequest(req)}
            />
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
                padding: '20px 48px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16,
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(59,130,246,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59,130,246,0.1) 0%, transparent 50%)',
                    pointerEvents: 'none',
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 14,
                        background: 'rgba(59, 130, 246, 0.2)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22,
                    }}>
                        💧
                    </div>
                    <div>
                        <div style={{ fontSize: 17, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
                            Customer Service Portal
                        </div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                            {user?.name || 'Staff'} — Water Service Management
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
                    <div style={{
                        padding: '6px 14px', background: 'rgba(255,255,255,0.08)',
                        borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)',
                    }}>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Role</div>
                        <div style={{ fontSize: 13, color: '#93C5FD', fontWeight: 600 }}>Customer Service</div>
                    </div>
                    <button
                        onClick={logout}
                        style={{
                            padding: '10px 22px', borderRadius: 10,
                            border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)',
                            color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}
                    >
                        🚪 Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>
                {/* Title */}
                <div style={{ marginBottom: 24 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', margin: 0 }}>
                        Service Dashboard
                    </h1>
                    <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0' }}>
                        Manage and track all customer service requests
                    </p>
                </div>

                {/* KPI Cards */}
                <KpiCards stats={stats} />

                {/* Requests Table */}
                <RequestsTable
                    requests={requests}
                    loading={loading}
                    onView={handleView}
                    onAssign={handleAssign}
                    onUpdate={handleUpdate}
                />
            </div>

            {/* Assign Task Modal */}
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

export default CustomerServiceDashboard;