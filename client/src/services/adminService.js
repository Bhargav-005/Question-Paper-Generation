const API_BASE_URL = "";

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const adminService = {
  async getDashboardData() {
    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch dashboard data');
    const data = await response.json();
    return data.data;
  },

  async getUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/admin/users?${query}`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    const data = await response.json();
    return data.data;
  },

  async getDepartments() {
    const response = await fetch(`${API_BASE_URL}/api/admin/departments`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch departments');
    const data = await response.json();
    return data.data;
  },

  async getUserById(id) {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch user details');
    const data = await response.json();
    return data.data;
  },

  async createUser(userData) {
    const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create user');
    return data;
  },

  async updateUser(id, userData) {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userData) // Mapping standard: fullName, department (ID), role, status
    });
    if (!response.ok) throw new Error('Failed to update user');
    return await response.json();
  },

  async resetPassword(id) {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}/reset-password`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to reset password');
    return await response.json();
  },

  async updateStatus(id, status) {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update status');
    return await response.json();
  },

  async createDepartment(name) {
    const response = await fetch(`${API_BASE_URL}/api/admin/departments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create department');
    return data;
  },

  async getAuditLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/admin/audit-logs?${query}`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch audit logs');
    const data = await response.json();
    return data.data;
  },

  async exportAuditLogs() {
    const response = await fetch(`${API_BASE_URL}/api/admin/audit-logs/export`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to export audit logs');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  }
};
