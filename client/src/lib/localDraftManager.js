


















const SYLLABUS_KEY_PREFIX = 'qgen_syllabus_';
const CO_KEY_PREFIX = 'qgen_cos_';

export const localDraftManager = {
  saveSyllabus(paperId, blocks) {
    if (!paperId) return;
    localStorage.setItem(`${SYLLABUS_KEY_PREFIX}${paperId}`, JSON.stringify(blocks));
  },

  getSyllabus(paperId) {
    if (!paperId) return [];
    let raw = localStorage.getItem(`${SYLLABUS_KEY_PREFIX}${paperId}`);

    if (!raw) {
      raw = localStorage.getItem(`app_syllabus_${paperId}`);
    }

    if (!raw) return [];

    try {
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) return [];

      // Check if topics are old string format
      const needsMigration = data.length > 0 && data.some((b) =>
      b.topics && b.topics.length > 0 && typeof b.topics[0] === 'string'
      );

      if (needsMigration) {
        const migrated = data.map((b) => ({
          ...b,
          topics: b.topics.map((t) => ({ title: t, subtopics: [] }))
        }));
        this.saveSyllabus(paperId, migrated);
        return migrated;
      }

      // Ensure all 8 blocks exist
      const blocks = data;
      if (blocks.length < 8) {
        const completeBlocks = [];
        [1, 2, 3, 4].forEach((u) => {
          for (let s of [1, 2]) {
            const existing = blocks.find((b) => b.unit === u && b.section === s);
            completeBlocks.push(existing || { unit: u, section: s, topics: [] });
          }
        });
        return completeBlocks;
      }

      return blocks;
    } catch (e) {
      console.error("Failed to parse syllabus data", e);
      return [];
    }
  },

  saveCOs(paperId, cos) {
    if (!paperId) return;
    localStorage.setItem(`${CO_KEY_PREFIX}${paperId}`, JSON.stringify(cos));
  },

  getCOs(paperId) {
    if (!paperId) return [];
    let raw = localStorage.getItem(`${CO_KEY_PREFIX}${paperId}`);

    // Legacy recovery
    if (!raw) {
      raw = localStorage.getItem(`app_outcomes_${paperId}`);
    }

    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  },

  clearDraft(paperId) {
    if (!paperId) return;
    localStorage.removeItem(`${SYLLABUS_KEY_PREFIX}${paperId}`);
    localStorage.removeItem(`${CO_KEY_PREFIX}${paperId}`);
  }
};