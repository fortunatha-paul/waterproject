
//import ReportsViewer from '../../components/ReportsViewer';
import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { api } from '../../../utils/api';

const API_URL = "http://localhost:8000/api";

function SummaryCard({ label, value, trend }) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 4,
        padding: "24px",
        border: "2px solid #d1d5db",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        position: "relative",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#9ca3af";
        e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#d1d5db";
        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
      }}
    >
      <div
        style={{
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: "12px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            fontSize: 14,
            color: "#374151",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "1px",
            fontFamily: "Georgia, serif",
          }}
        >
          {label}
        </div>
      </div>
      <div
        style={{
          fontSize: 36,
          fontWeight: 700,
          color: "#111827",
          lineHeight: 1,
          marginBottom: "12px",
          fontFamily: "Georgia, serif",
        }}
      >
        {value}
      </div>
      {trend && (
        <div
          style={{
            fontSize: 13,
            color: trend.type === "up" ? "#059669" : "#dc2626",
            fontWeight: 600,
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
          }}
        >
          {trend.type === "up" ? "↑" : "↓"} {trend.value}% from last month
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const statusConfig = {
    Pending: { color: "#6B7280", bg: "#F3F4F6" },
    "In Progress": { color: "#F59E0B", bg: "#FEF3C7" },
    Completed: { color: "#10B981", bg: "#D1FAE5" },
    Rejected: { color: "#EF4444", bg: "#FEE2E2" },
    Resolved: { color: "#10B981", bg: "#D1FAE5" },
    Submitted: { color: "#10B981", bg: "#D1FAE5" },
    Draft: { color: "#F59E0B", bg: "#FEF3C7" },
    Solved: { color: "#10B981", bg: "#D1FAE5" },
    "Not Solved": { color: "#F59E0B", bg: "#FEF3C7" },
  };

  const config = statusConfig[status] || { color: "#6B7280", bg: "#F3F4F6" };

  return (
    <span
      style={{
        padding: "4px 12px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.color}20`,
      }}
    >
      {status}
    </span>
  );
}

function InspectorTag({ inspectorName }) {
  return (
    <span
      style={{
        padding: "4px 8px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 600,
        color: inspectorName ? "#10B981" : "#9CA3AF",
        background: inspectorName ? "#D1FAE5" : "#F3F4F6",
      }}
    >
      {inspectorName || "Unassigned"}
    </span>
  );
}

function ServiceTypeTag({ serviceType }) {
  const typeConfig = {
    "New Connection": { color: "#3B82F6", bg: "#DBEAFE" },
    "Remove Sewage Water": { color: "#EF4444", bg: "#FEE2E2" },
    "Meter Repair": { color: "#06B6D4", bg: "#CFFAFE" },
    "Meter Replacement": { color: "#10B981", bg: "#D1FAE5" },
    "No Water Supply": { color: "#F97316", bg: "#FFEDD5" },
  };

  const config = typeConfig[serviceType] || { color: "#6B7280", bg: "#F3F4F6" };

  return (
    <span
      style={{
        padding: "6px 12px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.color}40`,
      }}
    >
      {serviceType}
    </span>
  );
}

function RequestDetailsModal({
  request,
  onBack,
  onUpdateStatus,
  inspectors,
  onAssignInspector,
}) {
  const [notes, setNotes] = useState(request.notes || "");
  const [status, setStatus] = useState(request.status || "Pending");
  const [selectedInspector, setSelectedInspector] = useState(
    request.assigned_inspector_id || "",
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [inspectorReport, setInspectorReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [showReportDetails, setShowReportDetails] = useState(false);

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      await onUpdateStatus(request.id, {
        status,
        comments: notes ? [notes] : [],
      });
      onBack();
    } catch (error) {
      console.error("Error updating request:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignInspector = async () => {
    if (!selectedInspector) {
      alert("Please select an inspector");
      return;
    }
    try {
      await onAssignInspector(request.id, selectedInspector);
      onBack();
    } catch (error) {
      console.error("Error assigning inspector:", error);
    }
  };

  useEffect(() => {
    let mounted = true;
    const fetchInspectorReport = async () => {
      if (!request?.id) return;
      try {
        setLoadingReport(true);
        const reqId = typeof request.id === 'string' && request.id.startsWith('REQ-') ? parseInt(request.id.replace('REQ-', ''), 10) : request.id;
        const reports = await api.getInspectorReports({ request_id: reqId });
        if (!mounted) return;
        const found = Array.isArray(reports) ? reports[0] : null;
        setInspectorReport(found || null);
      } catch (err) {
        console.warn('Error fetching inspector report', err);
        if (mounted) setInspectorReport(null);
      } finally {
        if (mounted) setLoadingReport(false);
      }
    };
    fetchInspectorReport();
    return () => { mounted = false; };
  }, [request?.id]);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: "32px",
        border: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h2
          style={{ fontSize: 20, fontWeight: 700, color: "#1f2937", margin: 0 }}
        >
          Request Details - REQ-{request.id}
        </h2>
        <button
          onClick={onBack}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            background: "#fff",
            color: "#6b7280",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          ← Back
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 20,
          marginBottom: 24,
        }}
      >
        <div>
          <label
            style={{
              fontSize: 12,
              color: "#6b7280",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Customer Name
          </label>
          <div style={{ fontSize: 16, color: "#1f2937", marginTop: 4 }}>
            {request.user?.name || "N/A"}
          </div>
        </div>
        <div>
          <label
            style={{
              fontSize: 12,
              color: "#6b7280",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Email
          </label>
          <div style={{ fontSize: 16, color: "#1f2937", marginTop: 4 }}>
            {request.user?.email || "N/A"}
          </div>
        </div>
        <div>
          <label
            style={{
              fontSize: 12,
              color: "#6b7280",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Phone
          </label>
          <div style={{ fontSize: 16, color: "#1f2937", marginTop: 4 }}>
            {request.user?.phone_number || "N/A"}
          </div>
        </div>
        <div>
          <label
            style={{
              fontSize: 12,
              color: "#6b7280",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Request Type
          </label>
          <div style={{ fontSize: 16, marginTop: 4 }}>
            <ServiceTypeTag serviceType={request.serve_type} />
          </div>
        </div>
        <div>
          <label
            style={{
              fontSize: 12,
              color: "#6b7280",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Location
          </label>
          <div style={{ fontSize: 16, color: "#1f2937", marginTop: 4 }}>
            {request.location || "N/A"}
          </div>
        </div>
        <div>
          <label
            style={{
              fontSize: 12,
              color: "#6b7280",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Submitted Date
          </label>
          <div style={{ fontSize: 16, color: "#1f2937", marginTop: 4 }}>
            {new Date(request.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {inspectorReport && (
        <div style={{ marginBottom: 24 }}>
          {!showReportDetails ? (
            <button
              onClick={() => setShowReportDetails(true)}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: 'none',
                background: '#3B82F6',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Show Inspector Report
            </button>
          ) : (
            <button
              onClick={() => setShowReportDetails(false)}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid #d1d5db',
                background: '#fff',
                color: '#374151',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Hide Inspector Report
            </button>
          )}
        </div>
      )}
      {showReportDetails && inspectorReport && (
        <div style={{ marginBottom: 24, background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '18px 20px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1f2937', margin: '0 0 12px' }}>Inspector Report</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Title</span><strong style={{ color: '#1f2937' }}>{inspectorReport.title}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Inspector</span><span style={{ color: '#1f2937' }}>{inspectorReport.inspector?.name || 'Unknown'}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Visit Date</span><span style={{ color: '#1f2937' }}>{inspectorReport.visit_date}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Status</span><span style={{ color: '#1f2937' }}>{inspectorReport.status}</span></div>
            <div style={{ padding: '10px', background: '#F0F9FF', borderRadius: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1E40AF', marginBottom: 4 }}>Findings</div>
              <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{inspectorReport.findings}</div>
            </div>
            <div style={{ padding: '10px', background: '#F0F9FF', borderRadius: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1E40AF', marginBottom: 4 }}>Work Done</div>
              <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{inspectorReport.work_done}</div>
            </div>
            <div style={{ padding: '10px', background: '#F0F9FF', borderRadius: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1E40AF', marginBottom: 4 }}>Recommendations</div>
              <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{inspectorReport.recommendations}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <label
          style={{
            fontSize: 12,
            color: "#6b7280",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            display: "block",
            marginBottom: 8,
          }}
        >
          Description
        </label>
        <div
          style={{
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: 12,
            fontSize: 14,
            color: "#1f2937",
            whiteSpace: "pre-wrap",
            minHeight: 80,
          }}
        >
          {request.description || "No description provided"}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 20,
          marginBottom: 24,
        }}
      >
        <div>
          <label
            style={{
              fontSize: 12,
              color: "#6b7280",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              display: "block",
              marginBottom: 8,
            }}
          >
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              fontSize: 14,
              color: "#1f2937",
              background: "#fff",
              fontFamily: "inherit",
            }}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label
            style={{
              fontSize: 12,
              color: "#6b7280",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              display: "block",
              marginBottom: 8,
            }}
          >
            Assign Inspector
          </label>
          <select
            value={selectedInspector}
            onChange={(e) => setSelectedInspector(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              fontSize: 14,
              color: "#1f2937",
              background: "#fff",
              fontFamily: "inherit",
            }}
          >
            <option value="">Select an Inspector</option>
            {inspectors &&
              inspectors.map((inspector) => (
                <option key={inspector.id} value={inspector.id}>
                  {inspector.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label
          style={{
            fontSize: 12,
            color: "#6b7280",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            display: "block",
            marginBottom: 8,
          }}
        >
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this request..."
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            fontSize: 14,
            color: "#1f2937",
            fontFamily: "inherit",
            minHeight: 100,
            resize: "vertical",
          }}
        />
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          style={{
            padding: "10px 24px",
            borderRadius: 8,
            border: "none",
            background: "#3B82F6",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: isUpdating ? "not-allowed" : "pointer",
            opacity: isUpdating ? 0.6 : 1,
            transition: "all 0.2s",
          }}
        >
          {isUpdating ? "Saving..." : "Update Status"}
        </button>
        <button
          onClick={handleAssignInspector}
          style={{
            padding: "10px 24px",
            borderRadius: 8,
            border: "none",
            background: "#10B981",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          Assign Inspector
        </button>
        <button
          onClick={onBack}
          style={{
            padding: "10px 24px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            background: "#fff",
            color: "#6b7280",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function HODSanitation() {
  const { user, logout } = useAuth();
  const [requests, setRequests] = useState([]);
  const [inspectors, setInspectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterType, setFilterType] = useState("All");
  //badiliko
  //const [activeTab, setActiveTab] = useState('requests');
  const [filterStatus, setFilterStatus] = useState("All");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");

      const response = await fetch(`${API_URL}/requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch requests");

      const data = await response.json();
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInspectors = async () => {
    try {
      const token = localStorage.getItem("auth_token");

      const response = await fetch(`${API_URL}/inspectors`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch inspectors");

      const data = await response.json();
      setInspectors(data || []);
    } catch (error) {
      console.error("Error fetching inspectors:", error);
      setInspectors([]);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      await fetchRequests();
      await fetchInspectors();
    };

    if (isMounted) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpdateRequest = async (id, updates) => {
    try {
      const token = localStorage.getItem("auth_token");

      const response = await fetch(`${API_URL}/requests/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error("Failed to update request");

      const updatedRequest = await response.json();
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? updatedRequest : r)),
      );

      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest(updatedRequest);
      }
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  const handleAssignInspector = async (requestId, inspectorId) => {
    try {
      const token = localStorage.getItem("auth_token");

      const response = await fetch(
        `${API_URL}/requests/${requestId}/assign-inspector`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ inspector_id: inspectorId }),
        },
      );

      if (!response.ok) throw new Error("Failed to assign inspector");

      const updatedRequest = await response.json();
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? updatedRequest : r)),
      );

      if (selectedRequest && selectedRequest.id === requestId) {
        setSelectedRequest(updatedRequest);
      }
      alert("Inspector assigned successfully");
    } catch (error) {
      console.error("Error assigning inspector:", error);
      alert("Failed to assign inspector");
    }
  };

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    const typeMatch = filterType === "All" || req.serve_type === filterType;
    const statusMatch = filterStatus === "All" || req.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const stats = {
    total: requests.length,
    newConnections: requests.filter((r) => r.serve_type === "New Connection").length,

    completed: requests.filter((r) => r.status === "Completed").length,
  };

  if (selectedRequest) {
    return (
      <div style={{ padding: 32, background: "#f3f4f6", minHeight: "100vh" }}>
        <RequestDetailsModal
          request={selectedRequest}
          onBack={() => setSelectedRequest(null)}
          onUpdateStatus={handleUpdateRequest}
          inspectors={inspectors}
          onAssignInspector={handleAssignInspector}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 32, background: "#f3f4f6", minHeight: "100vh" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#1f2937",
              margin: 0,
              marginBottom: 8,
              fontFamily: "Georgia, serif",
            }}
          >
            HOD Sanitation Dashboard
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#6b7280",
              margin: 0,
              fontFamily: "Georgia, serif",
            }}
          >
            Welcome back, {user?.name}. Manage water connection and sewerage
            requests.
          </p>
        </div>
        <button
          onClick={logout}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            background: "#EF4444",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          Logout
        </button>
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}
      >
        <SummaryCard label="Total Requests" value={stats.total} />
        <SummaryCard
          label="New Connections"
          value={stats.newConnections}
          color="#3B82F6"
        />
        <SummaryCard
          label="Remove Sewage Water"
          value={stats.removeSewageRequests}
          color="#EF4444"
        />
        <SummaryCard label="Pending" value={stats.pending} color="#F59E0B" />
        <SummaryCard
          label="In Progress"
          value={stats.inProgress}
          color="#3B82F6"
        />
        <SummaryCard
          label="Completed"
          value={stats.completed}
          color="#10B981"
        />
      </div>

      {/* Filters */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          border: "1px solid #e5e7eb",
          display: "flex",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <label
            style={{
              fontSize: 12,
              color: "#6b7280",
              fontWeight: 600,
              textTransform: "uppercase",
              display: "block",
              marginBottom: 4,
            }}
          >
            Request Type
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              fontSize: 14,
              background: "#fff",
              fontFamily: "inherit",
            }}
          >
            <option value="All">All Types</option>
            <option value="New Connection">New Connection</option>
            <option value="Remove Sewage Water">Remove Sewage Water</option>
          </select>
        </div>
        <div>
          <label
            style={{
              fontSize: 12,
              color: "#6b7280",
              fontWeight: 600,
              textTransform: "uppercase",
              display: "block",
              marginBottom: 4,
            }}
          >
            Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              fontSize: 14,
              background: "#fff",
              fontFamily: "inherit",
            }}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
            Loading requests...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>
            No requests found matching the selected filters.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f9fafb",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  <th
                    style={{
                      padding: 16,
                      textAlign: "left",
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      color: "#6b7280",
                    }}
                  >
                    Request ID
                  </th>
                  <th
                    style={{
                      padding: 16,
                      textAlign: "left",
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      color: "#6b7280",
                    }}
                  >
                    Customer
                  </th>
                  <th
                    style={{
                      padding: 16,
                      textAlign: "left",
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      color: "#6b7280",
                    }}
                  >
                    Type
                  </th>
                  <th
                    style={{
                      padding: 16,
                      textAlign: "left",
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      color: "#6b7280",
                    }}
                  >
                    Location
                  </th>
                  <th
                    style={{
                      padding: 16,
                      textAlign: "left",
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      color: "#6b7280",
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      padding: 16,
                      textAlign: "left",
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      color: "#6b7280",
                    }}
                  >
                    Assigned Inspector
                  </th>
                  <th
                    style={{
                      padding: 16,
                      textAlign: "left",
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      color: "#6b7280",
                    }}
                  >
                    Date
                  </th>
                  <th
                    style={{
                      padding: 16,
                      textAlign: "left",
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      color: "#6b7280",
                    }}
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    style={{
                      borderBottom: "1px solid #e5e7eb",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f9fafb")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#fff")
                    }
                  >
                    <td
                      style={{
                        padding: 16,
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#1f2937",
                      }}
                    >
                      REQ-{req.id}
                    </td>
                    <td style={{ padding: 16, fontSize: 14, color: "#1f2937" }}>
                      {req.user?.name || "N/A"}
                    </td>
                    <td style={{ padding: 16, fontSize: 14 }}>
                      <ServiceTypeTag serviceType={req.serve_type} />
                    </td>
                    <td style={{ padding: 16, fontSize: 14, color: "#1f2937" }}>
                      {req.location || "N/A"}
                    </td>
                    <td style={{ padding: 16 }}>
                      <StatusBadge status={req.status || "Pending"} />
                    </td>
                    <td style={{ padding: 16 }}>
                      <InspectorTag
                        inspectorName={req.assigned_staff || null}
                      />
                    </td>
                    <td style={{ padding: 16, fontSize: 14, color: "#1f2937" }}>
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: 16 }}>
                      <button
                        onClick={() => setSelectedRequest(req)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 6,
                          border: "1px solid #3B82F6",
                          background: "#DBEAFE",
                          color: "#3B82F6",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default HODSanitation;
