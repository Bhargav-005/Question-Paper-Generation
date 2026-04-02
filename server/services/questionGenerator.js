// server/services/questionGenerator.ts
// Deterministic Question Generator - Production Grade

/**
 * Bloom's Taxonomy and CO Action Mappings
 */
const CO_BLOOM_ACTIONS = {
  CO1: { level: 'Remember/Understand', actions: ['Define', 'List', 'Identify', 'State', 'Name', 'Recall'] },
  CO2: { level: 'Understand', actions: ['Explain', 'Describe', 'Summarize', 'Interpret', 'Clarify'] },
  CO3: { level: 'Apply', actions: ['Apply', 'Demonstrate', 'Illustrate', 'Show', 'Implement', 'Calculate'] },
  CO4: { level: 'Analyze', actions: ['Analyze', 'Examine', 'Differentiate', 'Compare', 'Contrast', 'Investigate'] },
  CO5: { level: 'Evaluate', actions: ['Evaluate', 'Assess', 'Justify', 'Validate', 'Critically analyze', 'Recommend'] },
  CO6: { level: 'Create', actions: ['Design', 'Develop', 'Construct', 'Create', 'Formulate', 'Propose'] }
};

/**
 * Topic Type Detection Logic
 */
function detectTopicType(topic) {
  const t = topic.toLowerCase();
  if (t.match(/\b(algorithm|method|process|flow|logic|sorting|searching|traversal|protocol|operation)\b/)) return 'process';
  if (t.match(/\b(architecture|model|structure|schema|layout|organization|hierarchy|topology|framework)\b/)) return 'structure';
  if (t.match(/\b(system|management|network|infrastructure|environment|platform|database|module)\b/)) return 'system';
  if (t.match(/\b(technique|approach|strategy|mechanism|paradigm|principle|rule|policy)\b/)) return 'method';
  return 'concept';
}

/**
 * Depth & Context Mapping based on Marks and Topic Type
 */
function getTopicContext(type, marks) {
  const contexts = {
    process: {
      2: ['working of', 'steps in', 'logic of'],
      5: ['detailed working of', 'operational flow of', 'step-by-step process of'],
      6: ['algorithmic structure of', 'procedural implementation of'],
      8: ['implementation strategies for', 'performance efficiency of']
    },
    structure: {
      2: ['components of', 'basic layout of', 'elements in'],
      5: ['internal structure of', 'functional architecture of', 'organizational hierarchy of'],
      6: ['schematic diagram and structure of', 'detailed design of'],
      8: ['architectural integrity of', 'design trade-offs in']
    },
    system: {
      2: ['role of', 'purpose of', 'features of'],
      5: ['management of', 'environmental setup for', 'infrastructure of'],
      6: ['functional requirements of', 'security framework of'],
      8: ['scalability and deployment of', 'system-level integration of']
    },
    method: {
      2: ['concept of', 'rule of', 'principle of'],
      5: ['methodology behind', 'core principle of', 'applied technique of'],
      6: ['theoretical framework of', 'comparative analysis of'],
      8: ['strategic significance of', 'validation of']
    },
    concept: {
      2: ['notion of', 'basics of', 'fundamentals of'],
      5: ['conceptual overview of', 'theoretical aspects of', 'practical significance of'],
      6: ['in-depth analysis of', 'comprehensive study of'],
      8: ['holistic perspective on', 'critical evaluation of']
    }
  };

  const typeContexts = contexts[type] || contexts.concept;
  const markContexts = typeContexts[marks] || typeContexts[2];
  return markContexts[Math.floor(Math.random() * markContexts.length)];
}

/**
 * Intelligent Question Construction
 */
function constructQuestion(action, context, topic, marks) {
  const depthModifiers = {
    2: '',
    5: ' with a suitable individual example.',
    6: ' using a neat schematic diagram or illustration.',
    8: ' by providing a rigorous technical justification and performance analysis.'
  };

  const question = `${action} the ${context} ${topic}${depthModifiers[marks]}.`;
  return sanitizeAndFixGrammar(question);
}

/**
 * Grammar & Cleaning Layer
 */
function sanitizeAndFixGrammar(text) {
  if (!text) return '';

  let cleaned = text
    .replace(/\s+/g, ' ')               // Remove extra spaces
    .replace(/\s+([.,?!:;])/g, '$1')    // Fix punctuation spacing
    .replace(/\(Slot.*?\)/gi, '')       // Part 6: Remove [Slot ...]
    .replace(/\(\d+\s*marks\)/gi, '')   // Part 6: Remove (6 marks)
    .replace(/CO\d+/g, '')               // Part 6: Remove CO references
    .trim();

  // Ensure proper capitalization
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  // Ensure sentence ends with period if it's not a question
  if (!cleaned.endsWith('.') && !cleaned.endsWith('?')) {
    cleaned += '.';
  }

  return cleaned;
}

/**
 * Validation Layer
 */
function isValidQuestion(text, topic) {
  if (!text || !topic) return false;
  if (text.length < 20) return false;
  if (text.toLowerCase().includes('undefined') || text.toLowerCase().includes('null')) return false;
  
  const vaguePhrases = ['related to', 'discuss', 'explain concepts', 'in detail in detail'];
  if (vaguePhrases.some(phrase => text.toLowerCase().includes(phrase))) {
    // We allow "discuss" if it's from the actions, but let's be strict for "Discuss {topic}"
    if (text.toLowerCase() === `discuss ${topic.toLowerCase()}.`) return false;
  }

  // Ensure topic is actually in the question
  if (!text.toLowerCase().includes(topic.toLowerCase())) return false;

  return true;
}

/**
 * Main question generation function
 */
export function generateQuestions(coMappings, blueprintConfig, syllabusTopics) {
  const questions = [];
  const usedTexts = new Set();
  let questionCounter = 1;

  const mappingsByCO = groupMappingsByCO(coMappings);
  const topicsById = new Map();
  syllabusTopics.forEach(t => topicsById.set(t.id, t));

  for (const requirement of blueprintConfig) {
    const { co, marks, count } = requirement;
    const coId = parseInt(co.replace(/\D/g, ''));

    const coTopics = (mappingsByCO.get(coId) || [])
      .filter(m => m.status === 'approved')
      .map(m => topicsById.get(m.topicId))
      .filter(t => t !== undefined);

    if (coTopics.length === 0) continue;

    const bloom = CO_BLOOM_ACTIONS[co] || CO_BLOOM_ACTIONS.CO2;
    let generated = 0;
    let attempts = 0;
    const maxAttempts = coTopics.length * 20;

    while (generated < count && attempts < maxAttempts) {
      attempts++;
      const topicObj = coTopics[attempts % coTopics.length];
      const topic = topicObj.topic;

      // Topic Validation
      if (!topic || topic.trim().length < 3) continue;

      const type = detectTopicType(topic);
      const action = bloom.actions[Math.floor(Math.random() * bloom.actions.length)];
      const context = getTopicContext(type, marks);
      
      const text = constructQuestion(action, context, topic, marks);

      if (!usedTexts.has(text) && isValidQuestion(text, topic)) {
        usedTexts.add(text);
        questions.push({
          id: `Q${questionCounter++}`,
          co,
          marks,
          topic,
          question: text,
          topicId: topicObj.id,
          unit: topicObj.unit
        });
        generated++;
      }
    }

    if (generated < count) {
      console.warn(`[QGen] Falling back to templates for ${co} due to low variety`);
      
      const fallbackTopic = coTopics[0]?.topic || 'the assigned topic';
      
      for (let i = generated; i < count; i++) {
         questions.push({
          id: `Q${questionCounter++}`,
          co,
          marks,
          topic: fallbackTopic,
          question: "Question not available for this syllabus topic.",
          topicId: coTopics[0]?.id || 'N/A',
          unit: coTopics[0]?.unit || 'N/A'
        });
      }
    }
  }

  return questions;
}

function groupMappingsByCO(mappings) {
  const grouped = new Map();
  for (const m of mappings) {
    if (!grouped.has(m.coId)) grouped.set(m.coId, []);
    grouped.get(m.coId).push(m);
  }
  return grouped;
}

export function validateBlueprintConfig(config) {
  const errors = [];
  if (!config || config.length === 0) return { valid: false, errors: ["Blueprint is empty"] };
  for (const item of config) {
    if (!item.co || !item.co.match(/^CO\d+$/)) errors.push(`Invalid CO: ${item.co}`);
    if (![2, 5, 6, 8].includes(item.marks)) errors.push(`Invalid marks: ${item.marks}`);
    if (!item.count || item.count < 1) errors.push(`Invalid count for ${item.co}`);
  }
  return { valid: errors.length === 0, errors };
}