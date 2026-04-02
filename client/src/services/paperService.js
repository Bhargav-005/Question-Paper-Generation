

const API_BASE_URL = ""; // Assuming same origin

export const paperService = {
  /**
   * Fetch all papers for the current authenticated user
   */
  async getUserPapers() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/papers`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired. Please login again.');
      }
      const data = await response.json();
      throw new Error(data.message || 'Failed to fetch papers');
    }

    const data = await response.json();
    return data.data || [];
  },

  /**
   * Create a new paper
   */
  async createPaper(paper) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/papers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(paper)
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to create paper");
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Get paper by ID
   */
  async getPaperById(id) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/papers/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to fetch paper");
    }

    const data = await response.json();
    return data.data;
  }
};