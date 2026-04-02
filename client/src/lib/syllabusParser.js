











/**
 * Intelligent Academic Syllabus Parser.
 * Handles messy pasted text, structures subtopics, and prevents data loss.
 */
export const syllabusParser = {
  /**
   * Main entry point for parsing a unit syllabus.
   */
  parseUnit(raw) {
    if (!raw.trim()) return [];

    // Step 1: Normalize broken formatting
    let text = raw.
    replace(/-\s*\n/g, "-") // fix dash line breaks
    .replace(/\n+/g, " ") // collapse new lines
    .replace(/\s+/g, " ") // collapse spaces
    .trim();

    // Step 2 & 3: Convert separators into structured split marker "|"
    text = text.
    replace(/\s*[-–—]\s*/g, "|").
    replace(/\s*[;]\s*/g, "|").
    replace(/\|+/g, "|");

    // Step 4: Layered Splitting (Pipe -> Comma -> Sentence Break)
    const fragments = [];
    const pipeSplit = text.split("|").map((s) => s.trim()).filter(Boolean);

    pipeSplit.forEach((part) => {
      const commaSplit = part.split(",").map((s) => s.trim()).filter(Boolean);
      commaSplit.forEach((segment) => {
        const sentenceSplit = segment.split(/\.\s+/).map((s) => s.trim()).filter(Boolean);
        fragments.push(...sentenceSplit);
      });
    });

    const tree = [];
    const subtopicConnectors = [
    "role of", "phases of", "structure of", "working of",
    "types of", "model of", "overview of", "applications of",
    "limitations of", "comparison", "advantages", "disadvantages",
    "importance of", "architecture of", "classification of",
    "need for", "evolution of", "principles of"];


    fragments.forEach((fragment) => {
      // Further split by capitalization transitions if they seem merged
      const segmented = fragment.
      replace(/([a-z])([A-Z][a-z])/g, "$1|$2").
      split("|").
      map((s) => s.trim()).
      filter((s) => s.length > 0);

      segmented.forEach((token) => {
        let cleaned = token.
        replace(/^[\d.•*\-–]+\s*/, "") // leading bullets
        .replace(/[,;.]\s*$/, "") // trailing punctuation
        .trim();

        if (!cleaned) return;

        cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        const lowerCleaned = cleaned.toLowerCase();
        const isConnector = subtopicConnectors.some((c) => lowerCleaned.includes(c));

        if (isConnector && tree.length > 0) {
          tree[tree.length - 1].subtopics.push(cleaned);
        } else {
          tree.push({ title: cleaned, subtopics: [] });
        }
      });
    });

    // Alphabetical sort for predictable mapping consistency within the tree
    tree.forEach((t) => t.subtopics.sort((a, b) => a.localeCompare(b)));
    return tree.sort((a, b) => a.title.localeCompare(b.title));
  },

  /**
   * Splits a unit's parsed topics into two sections for structural mapping.
   */
  splitIntoSections(parsed) {
    if (parsed.length === 0) return { s1: [], s2: [] };
    if (parsed.length === 1) return { s1: parsed, s2: [] };

    const mid = Math.ceil(parsed.length / 2);
    return {
      s1: parsed.slice(0, mid),
      s2: parsed.slice(mid)
    };
  },

  /**
   * Flattens a ParsedTopic tree into a single text area string for UI hydration.
   */
  formatForUI(sections) {
    const lines = [];
    const allTopics = [...sections.s1, ...sections.s2];

    allTopics.forEach((t) => {
      lines.push(t.title);
      if (t.subtopics && t.subtopics.length > 0) {
        t.subtopics.forEach((st) => lines.push(`  - ${st}`));
      }
    });

    return lines.join("\n");
  },

  /**
   * Flattens a block of ParsedTopics into a array of simple strings for mapping consumption.
   * Includes both parents and children for 100% coverage.
   */
  flattenTopics(topics) {
    const flat = [];
    topics.forEach((t) => {
      flat.push(t.title);
      if (t.subtopics) {
        flat.push(...t.subtopics);
      }
    });
    // Sort alphabetically as requested for professional UI consistency
    return Array.from(new Set(flat)).sort((a, b) => a.localeCompare(b));
  }
};