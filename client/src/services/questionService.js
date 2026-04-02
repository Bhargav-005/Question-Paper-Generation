// client/src/services/questionService.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || '';



























export const questionService = {
  /**
   * Generate questions for a single requirement
   */
  async generateQuestions(params)








  {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/questions/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate questions');
    }

    const data = await response.json();
    return data.questions;
  },

  /**
   * Generate complete question paper
   */
  async generateQuestionPaper(
  blueprint,
  coMappings,
  syllabusTopics)
  {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/questions/generate-paper`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        blueprint,
        coMappings,
        syllabusTopics
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate question paper');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Check API health
   */
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      const data = await response.json();
      return {
        success: data.success === true,
        aiService: data.aiService
      };
    } catch (error) {
      return { success: false };
    }
  }
};