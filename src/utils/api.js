const API_BASE_URL = 'http://localhost:8000/api';

// Get auth token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: getAuthHeaders(),
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// API methods
export const api = {
  // Requests
  getRequests: () => apiRequest('/requests'),
  getRequest: (id) => apiRequest(`/requests/${id}`),
  createRequest: (requestData) => apiRequest('/requests', {
    method: 'POST',
    body: JSON.stringify(requestData)
  }),
  updateRequest: (id, requestData) => apiRequest(`/requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(requestData)
  }),
  deleteRequest: (id) => apiRequest(`/requests/${id}`, {
    method: 'DELETE'
  }),

  // User
  getCurrentUser: () => apiRequest('/user'),
};
