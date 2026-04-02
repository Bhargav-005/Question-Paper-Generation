






const SYLLABUS_KEY_PREFIX = 'app_syllabus_';

// Helper to get syllabus for a course
const getLocalSyllabus = (courseId) => {
  const data = localStorage.getItem(`${SYLLABUS_KEY_PREFIX}${courseId}`);
  return data ? JSON.parse(data) : [];
};

// Helper to save syllabus for a course
const saveLocalSyllabus = (courseId, units) => {
  localStorage.setItem(`${SYLLABUS_KEY_PREFIX}${courseId}`, JSON.stringify(units));
};

export const syllabusService = {
  /**
   * Save syllabus for a course (Units and Topics)
   * This will clear previous syllabus for the course and save new ones
   */
  async saveSyllabus(paperId, units) {
    const token = localStorage.getItem("token");

    const res = await fetch(`/api/syllabus/${paperId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ units })
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.message || "Failed to save syllabus to database.");
    }
    return result;
  },

  /**
   * Get full syllabus for a course from DB
   */
  async getSyllabus(paperId) {
    const token = localStorage.getItem("token");

    const res = await fetch(`/api/syllabus/${paperId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error("Failed to fetch syllabus from database.");
    }

    return await res.json();
  }
};

/**
 * Compatibility exports
 */
export async function saveSyllabus(paperId, units) {
  return syllabusService.saveSyllabus(paperId, units);
}

export async function getSyllabus(paperId) {
  return syllabusService.getSyllabus(paperId);
}