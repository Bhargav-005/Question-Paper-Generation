import { syllabusParser } from "./syllabusParser";











export function autoMapCOs(blocks) {
  // Helper to get unique flattened topics for a specific filter
  const getTopics = (unit, section) => {
    const filtered = blocks.filter((b) =>
    b.unit === unit && (section === undefined || b.section === section)
    );
    const flat = filtered.flatMap((b) => syllabusParser.flattenTopics(b.topics));
    return Array.from(new Set(flat));
  };

  return {
    // CO1: Standard Unit 1 Section 1
    CO1: getTopics(1, 1),

    // CO2: Unit 1 Section 2 + Unit 2 Section 1 (Transition)
    CO2: Array.from(new Set([
    ...getTopics(1, 2),
    ...getTopics(2, 1)]
    )),

    // CO3: Unit 2 Section 2
    CO3: getTopics(2, 2),

    // CO4: Unit 3 Section 1
    CO4: getTopics(3, 1),

    // CO5: Unit 3 Section 2 + Unit 4 Section 1 (Transition)
    CO5: Array.from(new Set([
    ...getTopics(3, 2),
    ...getTopics(4, 1)]
    )),

    // CO6: Unit 4 Section 2
    CO6: getTopics(4, 2)
  };
}