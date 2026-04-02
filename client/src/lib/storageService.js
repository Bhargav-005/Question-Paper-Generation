export const storageService = {
  resetWorkflow(paperId) {
    if (!paperId) {
      // Even if paperId is null, we should clean up the active paper pointer
      localStorage.removeItem("qgen_active_paper");
      sessionStorage.removeItem("active_paper_id");
      return;
    }

    const keysToRemove = [
    `qgen_syllabus_${paperId}`,
    `qgen_cos_${paperId}`,
    `qgen_mapping_status_${paperId}`,
    `qgen_mapping_selections_${paperId}`,
    `qgen_generated_questions_${paperId}`,
    `qgen_blueprint_${paperId}`,
    `qgen_active_paper`,
    // Legacy or loosely named keys from previous steps
    `qgen_mapping_${paperId}`,
    `qgen_questions_${paperId}`];


    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    // Also clear the session markers
    localStorage.removeItem("qgen_active_paper");
    sessionStorage.removeItem("active_paper_id");
    sessionStorage.removeItem("active_course_id");
    sessionStorage.removeItem("mappingData");
  }
};