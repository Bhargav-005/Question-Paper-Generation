/**
 * courseService.ts
 *
 * Real API-backed course service.
 * Previously used localStorage (mock) — now calls actual backend endpoints.
 */



export class CourseServiceError extends Error {
  constructor(message, code) {
    super(message);this.message = message;this.code = code;
    this.name = 'CourseServiceError';
  }
}

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${getToken()}`
});

async function handleResponse(res) {
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new CourseServiceError(
      json.message || json.error || "Request failed",
      String(res.status)
    );
  }
  return json;
}

export const courseService = {

  /**
   * Create or resume a paper (upsert).
   * If same subject_code + semester + exam_type exists as DRAFT, returns that paper.
   * Otherwise creates a new one.
   * Returns { id: paper_id } so CourseSetup.tsx can store it in sessionStorage.
   */
  async createCourse(input) {
    const res = await fetch("/api/papers/start", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        subject_code: input.subject_code,
        subject_name: input.subject_name,
        semester: input.semester,
        exam_type: input.exam_type,
        academic_year: input.academic_year,
        department: input.department,
        regulation: input.regulation
      })
    });

    const json = await handleResponse(res);
    // paperStart returns { data: { paper_id, ... } }
    return { id: json.data.paper_id };
  },

  /**
   * Get all papers for the logged-in faculty.
   */
  async getUserCourses() {
    const res = await fetch("/api/papers", {
      headers: authHeaders()
    });
    const json = await handleResponse(res);
    return json.data || [];
  },

  /**
   * Get a single paper by ID.
   */
  async getCourseById(id) {
    const res = await fetch(`/api/papers/${id}`, {
      headers: authHeaders()
    });
    if (res.status === 404) return null;
    const json = await handleResponse(res);
    return json.data || null;
  },

  /**
   * Update course context fields for an existing paper.
   */
  async updateCourse(paperId, updates) {
    const res = await fetch(`/api/course-context/${paperId}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(updates)
    });
    const json = await handleResponse(res);
    return json.data || updates;
  },

  /**
   * Delete — not yet implemented on backend.
   */
  async deleteCourse(id) {
    console.warn("deleteCourse not yet implemented on backend for id:", id);
  }
};

/**
 * Save course context (Step 1 form data) for a given paperId.
 */
export async function saveCourseSetup(paperId, payload) {
  const res = await fetch(`/api/course-context/${paperId}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });
  return res.json();
}

/**
 * Load course context for pre-filling Step 1 form on revisit.
 */
export async function getCourseSetup(paperId) {
  const res = await fetch(`/api/course-context/${paperId}`, {
    method: "GET",
    headers: authHeaders()
  });
  return res.json();
}