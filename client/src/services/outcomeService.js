

const OUTCOMES_KEY_PREFIX = 'app_outcomes_';

// Helper to get outcomes for a course from localStorage
const getLocalOutcomes = (courseId) => {
  const data = localStorage.getItem(`${OUTCOMES_KEY_PREFIX}${courseId}`);
  return data ? JSON.parse(data) : [];
};

export const outcomeService = {
  /**
   * Save course outcomes to the backend API and local storage
   */
  async saveOutcomes(paperId, outcomes) {
    const token = localStorage.getItem("token");

    // Still save locally for quick retrieval/persistence if needed
    localStorage.setItem(`${OUTCOMES_KEY_PREFIX}${paperId}`, JSON.stringify(outcomes));

    const res = await fetch(`/api/outcomes/${paperId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ outcomes })
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.message || "Failed to save outcomes to server");
    }
    return result;
  },

  /**
   * Get outcomes for a course from the backend API
   */
  async getOutcomes(paperId) {
    const token = localStorage.getItem("token");

    const res = await fetch(`/api/outcomes/${paperId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const result = await res.json();

    // Update local storage with fresh data from DB
    if (result.success && result.data) {
      localStorage.setItem(`${OUTCOMES_KEY_PREFIX}${paperId}`, JSON.stringify(result.data));
    }

    return result;
  }
};

/**
 * Named exports for compatibility
 */
export async function saveOutcomes(paperId, outcomes) {
  return outcomeService.saveOutcomes(paperId, outcomes);
}

export async function getOutcomes(paperId) {
  return outcomeService.getOutcomes(paperId);
}