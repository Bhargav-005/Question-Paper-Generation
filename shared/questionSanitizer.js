/**
 * Sanitizes question text by removing internal metadata, slot identifiers, 
 * CO references, marks, and extra prefixes.
 * 
 * @param {string} qText - The question text to sanitize
 * @returns {string|null} - Sanitized text or null if discarded
 */
export function sanitizeQuestionText(qText) {
  if (!qText || typeof qText !== "string") return qText;

  let cleaned = qText;

  // 1. REMOVE SLOT IDENTIFIERS: [Slot B2-opt1-2]
  cleaned = cleaned.replace(/\[[^\]]*\]/g, "");

  // 2. REMOVE MARKS FROM TEXT: (6 marks), (8 marks), (10 mark)
  cleaned = cleaned.replace(/\(\s*\d+\s*marks?\s*\)/gi, "");

  // 3. REMOVE CO REFERENCES INSIDE TEXT: CO2, CO5
  // Note: ONLY inside question text, NOT metadata fields.
  cleaned = cleaned.replace(/\bCO\d+\b/g, "");

  // 4. REMOVE EXTRA PREFIXES
  const prefixes = ["Slot", "Auto-generated", "Fallback", "Question", "Q"];
  prefixes.forEach(p => {
    // Regex for prefix (case insensitive, possibly followed by colon/space/dash)
    const regex = new RegExp(`^\\s*${p}\\s*(:|-)?\\s*`, "i");
    cleaned = cleaned.replace(regex, "");
  });

  // 5. CLEAN SPACING
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // Ensure proper sentence casing (Capitalize first letter)
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    // Ensure it ends with a punctuation mark
    if (!/[.!?]$/.test(cleaned)) {
      cleaned += ".";
    }
  }

  // 6. FINAL VALIDATION
  // After cleaning, if result is empty or too short → discard
  // Ensure it is a valid academic question (threshold of 10 chars)
  if (!cleaned || cleaned.length < 10) return null;

  return cleaned;
}
