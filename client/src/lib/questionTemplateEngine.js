









const TEMPLATES = {
  2: [
  "Define {topic}.",
  "What is {topic}?",
  "List the features of {topic}.",
  "State the purpose of {topic}.",
  "Write short notes on {topic}."],

  5: [
  "Explain {topic} with example.",
  "Describe the working of {topic}.",
  "Discuss {topic} in detail.",
  "Compare {topic} with related concept.",
  "Illustrate {topic} with diagram."],

  6: [
  "Analyze the construction of {topic}.",
  "Demonstrate the process of {topic}.",
  "Examine the structure of {topic}.",
  "Explain implementation steps of {topic}.",
  "Discuss limitations of {topic}."],

  8: [
  "Design and construct {topic} with suitable example.",
  "Elaborate the algorithm of {topic}.",
  "Explain {topic} with full working and diagram.",
  "Compare and evaluate {topic} in depth.",
  "Discuss optimization techniques in {topic}."]

};

const MARK_WEIGHTS = [2, 5, 6, 8];
const MARKS_COUNTS = {
  2: 5,
  5: 4,
  6: 3,
  8: 2
};

const DIFFICULTY_MAP = {
  2: "low",
  5: "medium",
  6: "medium",
  8: "high"
};

export function generateQuestionsForPaper(paperId) {
  const mappingStatusRaw    = localStorage.getItem(`qgen_mapping_status_${paperId}`);
  const mappingSelectionsRaw = localStorage.getItem(`qgen_mapping_selections_${paperId}`);

  if (!mappingStatusRaw || !mappingSelectionsRaw) {
    console.error('Missing mapping status or selections for generation');
    return [];
  }

  const statusMap      = JSON.parse(mappingStatusRaw);
  const selectionsMap  = JSON.parse(mappingSelectionsRaw);
  const approvedCOs    = Object.keys(statusMap).filter((co) => statusMap[co] === 'approved');
  const generatedQuestions = [];

  // ── Global uniqueness tracking ─────────────────────────────────────────────
  // Keyed on question text only — ensures the same wording never appears
  // in any two slots, including both sides of an OR pair in Section B.
  const usedTexts = new Set();

  approvedCOs.forEach((co) => {
    const topics = selectionsMap[co] || [];
    if (topics.length === 0) return;

    let qCounter      = 1;
    let topicIdx      = 0;
    let templateIdx   = 0;

    MARK_WEIGHTS.forEach((marks) => {
      const count = MARKS_COUNTS[marks];
      const templates = TEMPLATES[marks];

      // Cap search attempts to avoid an infinite loop when pool is exhausted
      const maxAttempts = templates.length * topics.length * 3;
      let generated = 0;
      let attempts  = 0;

      while (generated < count && attempts < maxAttempts) {
        attempts++;

        const topic    = topics[topicIdx % topics.length];
        const template = templates[templateIdx % templates.length];
        const text     = template.replace('{topic}', topic);

        if (!usedTexts.has(text)) {
          usedTexts.add(text);
          generatedQuestions.push({
            id:           `Q-${co}-${marks}-${qCounter++}`,
            co,
            topic,
            marks,
            questionText: text,
            difficulty:   DIFFICULTY_MAP[marks],
            status:       'generated'
          });
          generated++;
        }
        // Always advance indices — never retry the same combination
        topicIdx++;
        templateIdx++;
      }

      if (generated < count) {
        console.warn(
          `[QTE] Could only generate ${generated}/${count} unique questions for ${co} (${marks}M).` +
          ` Remaining slots skipped to preserve uniqueness.`
        );
      }
    });
  });

  localStorage.setItem(`qgen_generated_questions_${paperId}`, JSON.stringify(generatedQuestions));
  return generatedQuestions;
}

export function saveGeneratedQuestions(paperId, questions) {
  localStorage.setItem(`qgen_generated_questions_${paperId}`, JSON.stringify(questions));
}

export function getGeneratedQuestions(paperId) {
  const data = localStorage.getItem(`qgen_generated_questions_${paperId}`);
  return data ? JSON.parse(data) : [];
}