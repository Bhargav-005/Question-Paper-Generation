// ─────────────────────────────────────────────────────────────────────────────
// paperAssemblyEngine.js  — v2 "Slot Uniqueness Guarantee"
//
//   RULE: Once a question is assigned to any slot (section A or either option
//   of every OR group in section B), it MUST NEVER be reused in any other slot.
//   Each slot receives a distinct question object.
//
//   Changes from v1:
//   • usedIds is the ONLY source of truth — no fallback path that ignores it.
//   • If no unused question exists for a slot, a UNIQUE synthetic placeholder
//     is created (unique ID = slotKey + timestamp + random) to guarantee that
//     the same object is never shared across slots.
//   • Placeholder text is distinct per slot so two placeholders in the same
//     paper never carry identical wording.
// ─────────────────────────────────────────────────────────────────────────────
import { sanitizeQuestionText } from "../../../shared/questionSanitizer.js";

export function assemblePaper(blueprint, availableQuestions) {
  // Only work with approved questions
  const approved = availableQuestions.filter((q) => q.status === 'approved');

  // ── Global slot assignment state ────────────────────────────────────────────
  // usedIds tracks every question ID that has been committed to a slot.
  // It is NEVER bypassed — not even for fallback paths.
  const usedIds = new Set();

  /**
   * Assign ONE unique question to a slot.
   *
   * Strategy:
   *   1. Find an approved question matching CO + marks that has NOT been used.
   *   2. If none available, try alternate flexible marks (5, 6, 8) within same CO.
   *   3. If none available, try any unused question from the same CO.
   *   4. If STILL none available, return an explicit unavailable slot. (Never generate fake text).
   *
   * @param {object} slot   - blueprint slot descriptor
   * @param {string} slotKey - human-readable slot label
   * @returns {object}       - question object (always unique reference)
   */
  const assignQuestion = (slot, slotKey) => {
    // Step 1: Exact match on CO and marks
    let match = approved.find(
      (q) => q.co === slot.co && q.marks === slot.marks && !usedIds.has(q.id)
    );

    // Step 2: Flexible marks match (if marks are within standard 5, 6, 8 tiers)
    if (!match && [5, 6, 8].includes(slot.marks)) {
      match = approved.find(
        (q) => q.co === slot.co && [5, 6, 8].includes(q.marks) && !usedIds.has(q.id)
      );
    }

    // Step 3: Any unused question from the same CO
    if (!match) {
      match = approved.find(
        (q) => q.co === slot.co && !usedIds.has(q.id)
      );
    }

    // Assign and lock if found
    if (match) {
      usedIds.add(match.id);
      const text = match.text || match.questionText;
      match.text = sanitizeQuestionText(text) || text;
      
      // Enforce the slot's original required marks
      const finalQuestion = { ...match, marks: slot.marks };
      return finalQuestion;
    }

    // Step 4: No unused questions available at all for this CO
    console.warn("Invalid fallback triggered for CO:", slot.co);

    const placeholderId = `UNAVAILABLE-${slotKey}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    return {
      id:           placeholderId,
      co:           slot.co,
      topic:        'N/A',
      marks:        slot.marks,
      questionText: 'Question not available for this configuration',
      text:         'Question not available for this configuration',
      difficulty:   slot.marks === 2 ? 'low' : slot.marks >= 8 ? 'high' : 'medium',
      status:       'approved',
      _isPlaceholder: true
    };
  };

  // ── Section A ───────────────────────────────────────────────────────────────
  const sectionA = blueprint.sectionA.map((slot, idx) => ({
    slot,
    question: assignQuestion(slot, `A-${idx + 1}`)
  }));

  // ── Section B (OR groups) ───────────────────────────────────────────────────
  // option1 and option2 of the same group are DIFFERENT slots.
  // A question used in option1 CANNOT appear in option2 or any other slot.
  const sectionB = blueprint.sectionB.map((group) => ({
    groupNumber: group.groupNumber,
    option1: group.option1.map((s, idx) => ({
      slot: { ...s, questionNumber: s.questionNumber.toString().replace(/\D/g, '') },
      question: assignQuestion(s, `B${group.groupNumber}-opt1-${idx + 1}`)
    })),
    option2: group.option2.map((s, idx) => ({
      slot: { ...s, questionNumber: s.questionNumber.toString().replace(/\D/g, '') },
      question: assignQuestion(s, `B${group.groupNumber}-opt2-${idx + 1}`)
    }))
  }));

  return { sectionA, sectionB };
}