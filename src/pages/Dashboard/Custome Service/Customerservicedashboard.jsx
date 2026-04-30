import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import KpiCards from './components/KpiCards';
import RequestsTable from './components/RequestsTable';
import RequestDetails from './components/RequestDetails';
import AssignTaskModal from './components/AssignTaskModal';

const MOCK_REQUESTS = [
    {
        id: 'REQ-001', customerName: 'Aarav Sharma', customerEmail: 'aarav@email.com', customerPhone: '+91-98765-43210',
        serviceType: 'New Connection', date: '2026-04-28', status: 'Pending', priority: 'Medium',
        description: 'Need a new water connection for residential unit B-12. The building has 4 floors and requires separate metering for each floor.',
        location: 'Block B, Sector 14', assignedStaff: null, deadline: null,
        images: ['pipe_leak.jpg', 'meter_photo.jpg'],
        comments: [{ text: 'Customer called twice for follow-up', by: 'Reception', date: '2026-04-29' }],
        timeline: [{ date: '2026-04-28', event: 'Request Submitted', by: 'Aarav Sharma' }],
    },
    {
        id: 'REQ-002', customerName: 'Meena Patel', customerEmail: 'meena@email.com', customerPhone: '+91-87654-32109',
        serviceType: 'Repair', date: '2026-04-25', status: 'In Progress', priority: 'High',
        description: 'Leaking pipe near the kitchen area causing water wastage. Leak has been ongoing for 3 days and is getting worse.',
        location: 'House 45, Lane 7', assignedStaff: 'Rajesh Kumar', deadline: '2026-05-03',
        images: ['kitchen_leak.jpg'],
        comments: [
            { text: 'Technician dispatched', by: 'Staff', date: '2026-04-26' },
            { text: 'Parts ordered, waiting for delivery', by: 'Rajesh Kumar', date: '2026-04-27' },
        ],
        timeline: [
            { date: '2026-04-25', event: 'Request Submitted', by: 'Meena Patel' },
            { date: '2026-04-26', event: 'Assigned to Rajesh Kumar', by: 'Staff' },
            { date: '2026-04-26', event: 'Status changed to In Progress', by: 'Staff' },
        ],
    },
    {
        id: 'REQ-003', customerName: 'Rohit Deshmukh', customerEmail: 'rohit@email.com', customerPhone: '+91-76543-21098',
        serviceType: 'Complaint', date: '2026-04-20', status: 'Completed', priority: 'Low',
        description: 'Low water pressure during morning hours. Issue resolved after valve adjustment.',
        location: 'Flat 302, Tower A', assignedStaff: 'Sunil Mehta', deadline: '2026-04-27',
        images: [],
        comments: [{ text: 'Valve adjusted, pressure restored', by: 'Sunil Mehta', date: '2026-04-26' }],
        timeline: [
            { date: '2026-04-20', event: 'Request Submitted', by: 'Rohit Deshmukh' },
            { date: '2026-04-21', event: 'Assigned to Sunil Mehta', by: 'Staff' },
            { date: '2026-04-22', event: 'Status changed to In Progress', by: 'Sunil Mehta' },
            { date: '2026-04-26', event: 'Request Completed', by: 'Sunil Mehta' },
        ],
    },
    {
        id: 'REQ-004', customerName: 'Kavita Nair', customerEmail: 'kavita@email.com', customerPhone: '+91-65432-10987',
        serviceType: 'New Connection', date: '2026-04-18', status: 'Rejected', priority: 'Medium',
        description: 'Request for commercial connection in residential zone. Not permitted as per zoning regulations.',
        location: 'Shop 12, Market Road', assignedStaff: null, deadline: null,
        images: ['zoning_map.jpg'],
        comments: [{ text: 'Rejected due to zoning restrictions', by: 'Staff', date: '2026-04-19' }],
        timeline: [
            { date: '2026-04-18', event: 'Request Submitted', by: 'Kavita Nair' },
            { date: '2026-04-19', event: 'Status changed to Rejected', by: 'Staff' },
        ],
    },
    {
        id: 'REQ-005', customerName: 'Suresh Iyer', customerEmail: 'suresh@email.com', customerPhone: '+91-54321-09876',
        serviceType: 'Repair', date: '2026-04-15', status: 'Completed', priority: 'Medium',
        description: 'Broken water meter needs replacement. Meter was non-functional for 2 weeks.',
        location: 'House 78, Sector 22', assignedStaff: 'Anil Sharma', deadline: '2026-04-22',
        images: ['broken_meter.jpg', 'new_meter.jpg'],
        comments: [],
        timeline: [
            { date: '2026-04-15', event: 'Request Submitted', by: 'Suresh Iyer' },
            { date: '2026-04-16', event: 'Assigned to Anil Sharma', by: 'Staff' },
            { date: '2026-04-17', event: 'Status changed to In Progress', by: 'Anil Sharma' },
            { date: '2026-04-21', event: 'Request Completed', by: 'Anil Sharma' },
        ],
    },
    {
        id: 'REQ-006', customerName: 'Deepa Reddy', customerEmail: 'deepa@email.com', customerPhone: '+91-43210-98765',
        serviceType: 'Complaint', date: '2026-04-12', status: 'In Progress', priority: 'Urgent',
        description: 'Dirty water supply for the past 3 days. Multiple residents affected. Health hazard — immediate attention required.',
        location: 'Block C, Sector 9', assignedStaff: 'Vikram Singh', deadline: '2026-05-01',
        images: ['dirty_water_1.jpg', 'dirty_water_2.jpg', 'filter_comparison.jpg'],
        comments: [
            { text: 'Water sample collected for testing', by: 'Vikram Singh', date: '2026-04-13' },
            { text: 'Contamination source identified — treatment plant issue', by: 'Vikram Singh', date: '2026-04-14' },
        ],
        timeline: [
            { date: '2026-04-12', event: 'Request Submitted', by: 'Deepa Reddy' },
            { date: '2026-04-12', event: 'Priority escalated to Urgent', by: 'Staff' },
            { date: '2026-04-12', event: 'Assigned to Vikram Singh', by: 'Staff' },
            { date: '2026-04-13', event: 'Status changed to In Progress', by: 'Vikram Singh' },
        ],
    },
    {
        id: 'REQ-007', customerName: 'Manoj Gupta', customerEmail: 'manoj@email.com', customerPhone: '+91-32109-87654',
        serviceType: 'Maintenance', date: '2026-04-10', status: 'Pending', priority: 'Low',
        description: 'Annual maintenance check for water pipeline in apartment complex. 24 units need inspection.',
        location: 'Block B, Sector 14', assignedStaff: null, deadline: null,
        images: [],
        comments: [],
        timeline: [{ date: '2026-04-10', event: 'Request Submitted', by: 'Manoj Gupta' }],
    },
    {
        id: 'REQ-008', customerName: 'Priti Joshi', customerEmail: 'priti@email.com', customerPhone: '+91-21098-76543',
        serviceType: 'Billing', date: '2026-04-08', status: 'Pending', priority: 'Medium',
        description: 'Incorrect billing amount on last month\'s water bill. Charged for 2x actual usage.',
        location: 'Flat 302, Tower A', assignedStaff: null, deadline: null,
        images: ['bill_copy.jpg'],
        comments: [{ text: 'Customer provided bill copy as evidence', by: 'Reception', date: '2026-04-09' }],
        timeline: [
            { date: '2026-04-08', event: 'Request Submitted', by: 'Priti Joshi' },
        ],
    },
    {
        id: 'REQ-009', customerName: 'Vijay Malhotra', customerEmail: 'vijay@email.com', customerPhone: '+91-10987-65432',
        serviceType: 'Repair', date: '2026-04-05', status: 'In Progress', priority: 'High',
        description: 'Main supply valve stuck in open position. Cannot shut off water supply to building. Risk of flooding.',
        location: 'House 78, Sector 22', assignedStaff: 'Priya Patel', deadline: '2026-04-10',
        images: ['valve_stuck.jpg'],
        comments: [{ text: 'Replacement valve ordered', by: 'Priya Patel', date: '2026-04-06' }],
        timeline: [
            { date: '2026-04-05', event: 'Request Submitted', by: 'Vijay Malhotra' },
            { date: '2026-04-05', event: 'Assigned to Priya Patel', by: 'Staff' },
            { date: '2026-04-06', event: 'Status changed to In Progress', by: 'Priya Patel' },
        ],
    },
    {
        id: 'REQ-010', customerName: 'Lakshmi Krishnan', customerEmail: 'lakshmi@email.com', customerPhone: '+91-09876-54321',
        serviceType: 'Complaint', date: '2026-04-03', status: 'Pending', priority: 'High',
        description: 'No water supply for 2 days in entire apartment wing. 15 families affected.',
        location: 'Block C, Sector 9', assignedStaff: null, deadline: null,
        images: [],
        comments: [{ text: 'Multiple complaints received from same wing', by: 'Reception', date: '2026-04-04' }],
        timeline: [{ date: '2026-04-03', event: 'Request Submitted', by: 'Lakshmi Krishnan' }],
    },
];

const CustomerServiceDashboard = () => {
    const { user, logout } = useAuth();
    const [requests, setRequests] = useState(MOCK_REQUESTS);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [assignModalRequest, setAssignModalRequest] = useState(null);

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

    const handleSaveAssignment = (updatedReq) => {
        setRequests((prev) => prev.map((r) => (r.id === updatedReq.id ? updatedReq : r)));
        if (selectedRequest && selectedRequest.id === updatedReq.id) {
            setSelectedRequest(updatedReq);
        }
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