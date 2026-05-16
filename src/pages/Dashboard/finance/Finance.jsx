import React, { useState, useEffect } from 'react';
import { api } from '../../../utils/api';

const PAYMENT_STATUS_STYLES = {
    Unpaid: { bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' },
    Pending: { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' },
    Paid: { bg: '#D1FAE5', color: '#065F46', border: '#A7F3D0' },
    Overdue: { bg: '#FEE2E2', color: '#7F1D1D', border: '#FCA5A5' },
};

const STATUS_STYLES = {
    Pending: { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' },
    'In Progress': { bg: '#DBEAFE', color: '#1E40AF', border: '#BFDBFE' },
    Completed: { bg: '#D1FAE5', color: '#065F46', border: '#A7F3D0' },
    Rejected: { bg: '#FEE2E2', color: '#991B1B', border: '#FECACA' },
    Resolved: { bg: '#D1FAE5', color: '#065F46', border: '#A7F3D0' },
};

export default function Finance() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ paymentStatus: 'All', status: 'All', search: '' });
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updateForm, setUpdateForm] = useState({ amount: '', payment_status: '' });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await api.getRequests();
            setRequests(data);
            setError(null);
        } catch (err) {
            setError('Failed to load financial requests');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const filteredRequests = requests.filter((r) => {
        if (filters.paymentStatus !== 'All' && r.payment_status !== filters.paymentStatus) return false;
        if (filters.status !== 'All' && r.status !== filters.status) return false;
        if (filters.search) {
            const q = filters.search.toLowerCase();
            return (
                r.id.toString().includes(q) ||
                (r.user && r.user.name && r.user.name.toLowerCase().includes(q)) ||
                r.location.toLowerCase().includes(q)
            );
        }
        return true;
    });

    const handleUpdateClick = (request) => {
        setSelectedRequest(request);
        setUpdateForm({
            amount: request.amount || '',
            payment_status: request.payment_status || 'Unpaid',
        });
        setShowUpdateModal(true);
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.updateRequest(selectedRequest.id, {
                amount: updateForm.amount ? parseFloat(updateForm.amount) : null,
                payment_status: updateForm.payment_status,
            });
            await fetchRequests();
            setShowUpdateModal(false);
            setSelectedRequest(null);
        } catch (err) {
            setError('Failed to update request');
            console.error(err);
        }
    };

    const PaymentStatusBadge = ({ value }) => {
        const s = PAYMENT_STATUS_STYLES[value] || { bg: '#F3F4F6', color: '#4B5563', border: '#E5E7EB' };
        return (
            <span style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                background: s.bg,
                color: s.color,
                border: `1px solid ${s.border}`,
            }}>
                {value}
            </span>
        );
    };

    const StatusBadge = ({ value }) => {
        const s = STATUS_STYLES[value] || { bg: '#F3F4F6', color: '#4B5563', border: '#E5E7EB' };
        return (
            <span style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                background: s.bg,
                color: s.color,
                border: `1px solid ${s.border}`,
            }}>
                {value}
            </span>
        );
    };

    const calculateStats = () => {
        const totalAmount = requests.reduce((sum, r) => sum + (r.amount || 0), 0);
        const paidAmount = requests
            .filter((r) => r.payment_status === 'Paid')
            .reduce((sum, r) => sum + (r.amount || 0), 0);
        const unpaidCount = requests.filter((r) => r.payment_status === 'Unpaid').length;
        const overdueCount = requests.filter((r) => r.payment_status === 'Overdue').length;

        return { totalAmount, paidAmount, unpaidCount, overdueCount };
    };

    const stats = calculateStats();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <div style={{ fontSize: 16, color: '#6B7280' }}>Loading financial requests...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <div style={{ fontSize: 16, color: '#EF4444' }}>{error}</div>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', background: '#F9FAFB', minHeight: '100vh' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1F2937', margin: 0 }}>
                        Finance Dashboard
                    </h1>
                    <p style={{ fontSize: 14, color: '#6B7280', marginTop: 8 }}>
                        Manage billing and payment-related requests
                    </p>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
                    {[
                        { label: 'Total Amount', value: `$${stats.totalAmount.toFixed(2)}`, color: '#3B82F6', bg: '#EFF6FF' },
                        { label: 'Paid Amount', value: `$${stats.paidAmount.toFixed(2)}`, color: '#10B981', bg: '#ECFDF5' },
                        { label: 'Unpaid Requests', value: stats.unpaidCount, color: '#F59E0B', bg: '#FFFBEB' },
                        { label: 'Overdue Requests', value: stats.overdueCount, color: '#EF4444', bg: '#FEF2F2' },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            style={{
                                background: '#fff',
                                borderRadius: 12,
                                padding: 20,
                                border: '1px solid #F0F0F0',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                            }}
                        >
                            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>{stat.label}</div>
                            <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: '16px 24px',
                    border: '1px solid #F0F0F0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    marginBottom: 24,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 12,
                    alignItems: 'center',
                }}>
                    <input
                        type="text"
                        placeholder="Search by ID, customer name, location..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        style={{
                            flex: '1 1 220px',
                            padding: '8px 12px',
                            borderRadius: 8,
                            border: '1px solid #D1D5DB',
                            fontSize: 13,
                            outline: 'none',
                        }}
                    />
                    <select
                        value={filters.paymentStatus}
                        onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: 8,
                            border: '1px solid #D1D5DB',
                            fontSize: 13,
                            background: '#fff',
                            cursor: 'pointer',
                            minWidth: 130,
                        }}
                    >
                        <option value="All">Payment Status: All</option>
                        <option value="Unpaid">Unpaid</option>
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Overdue">Overdue</option>
                    </select>
                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: 8,
                            border: '1px solid #D1D5DB',
                            fontSize: 13,
                            background: '#fff',
                            cursor: 'pointer',
                            minWidth: 130,
                        }}
                    >
                        <option value="All">Status: All</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                    <button
                        onClick={() => setFilters({ paymentStatus: 'All', status: 'All', search: '' })}
                        style={{
                            padding: '8px 14px',
                            borderRadius: 8,
                            border: '1px solid #D1D5DB',
                            background: '#F9FAFB',
                            fontSize: 13,
                            cursor: 'pointer',
                            color: '#6B7280',
                        }}
                    >
                        Clear
                    </button>
                </div>

                {/* Table */}
                <div style={{
                    background: '#fff',
                    borderRadius: 12,
                    border: '1px solid #F0F0F0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #F0F0F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1F2937', margin: 0 }}>
                            Billing Requests
                        </h2>
                        <span style={{ fontSize: 13, color: '#9CA3AF' }}>
                            {filteredRequests.length} result{filteredRequests.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1000 }}>
                            <thead>
                                <tr style={{ background: '#F9FAFB' }}>
                                    {[
                                        'Request ID',
                                        'Customer',
                                        'Location',
                                        'Description',
                                        'Amount',
                                        'Payment Status',
                                        'Request Status',
                                        'Date',
                                        'Actions',
                                    ].map((col) => (
                                        <th
                                            key={col}
                                            style={{
                                                padding: '12px 16px',
                                                textAlign: 'left',
                                                fontSize: 12,
                                                fontWeight: 600,
                                                color: '#6B7280',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                borderBottom: '1px solid #E5E7EB',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} style={{ padding: '40px 20px', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
                                            No billing requests found matching your filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRequests.map((req) => (
                                        <tr
                                            key={req.id}
                                            style={{ borderBottom: '1px solid #F0F0F0', transition: 'background 0.15s' }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FAFB')}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                        >
                                            <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#1F2937' }}>
                                                #{req.id}
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151' }}>
                                                {req.user ? req.user.name : 'Unknown'}
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B7280' }}>
                                                {req.location}
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: 13, color: '#374151', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {req.description}
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#1F2937' }}>
                                                {req.amount ? `$${req.amount.toFixed(2)}` : 'Not set'}
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <PaymentStatusBadge value={req.payment_status || 'Unpaid'} />
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <StatusBadge value={req.status} />
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B7280' }}>
                                                {new Date(req.created_at).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <button
                                                    onClick={() => handleUpdateClick(req)}
                                                    style={{
                                                        padding: '5px 10px',
                                                        borderRadius: 6,
                                                        border: '1px solid #3B82F6',
                                                        background: '#EFF6FF',
                                                        color: '#3B82F6',
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                    }}
                                                >
                                                    Update
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Update Modal */}
                {showUpdateModal && selectedRequest && (
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: 16,
                        }}
                        onClick={() => setShowUpdateModal(false)}
                    >
                        <div
                            style={{
                                background: '#fff',
                                borderRadius: 16,
                                padding: 32,
                                maxWidth: 480,
                                width: '100%',
                                boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1F2937', margin: 0 }}>
                                    Update Payment Details
                                </h2>
                                <button
                                    onClick={() => setShowUpdateModal(false)}
                                    style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#9CA3AF', padding: 0, lineHeight: 1 }}
                                >
                                    &times;
                                </button>
                            </div>

                            <form onSubmit={handleUpdateSubmit}>
                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                                        Amount ($)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={updateForm.amount}
                                        onChange={(e) => setUpdateForm({ ...updateForm, amount: e.target.value })}
                                        placeholder="Enter amount"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: 8,
                                            border: '1px solid #D1D5DB',
                                            fontSize: 14,
                                            boxSizing: 'border-box',
                                            outline: 'none',
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: 24 }}>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                                        Payment Status
                                    </label>
                                    <select
                                        value={updateForm.payment_status}
                                        onChange={(e) => setUpdateForm({ ...updateForm, payment_status: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: 8,
                                            border: '1px solid #D1D5DB',
                                            fontSize: 14,
                                            background: '#fff',
                                            boxSizing: 'border-box',
                                            outline: 'none',
                                        }}
                                    >
                                        <option value="Unpaid">Unpaid</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Overdue">Overdue</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    style={{
                                        width: '100%',
                                        padding: '12px 24px',
                                        borderRadius: 10,
                                        border: 'none',
                                        background: '#3B82F6',
                                        color: '#fff',
                                        fontSize: 15,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                    }}
                                >
                                    Update Request
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
