// server/services/aiService.ts
// Template-based question generation service (no external API keys required)


// Types



















// Bloom's Taxonomy Descriptions
const BLOOM_DESCRIPTIONS = {
  L1: 'Remember - Recall facts, terms, basic concepts, and answers',
  L2: 'Understand - Explain ideas or concepts',
  L3: 'Apply - Use information in new situations',
  L4: 'Analyze - Draw connections among ideas, distinguish between parts',
  L5: 'Evaluate - Justify a decision or course of action',
  L6: 'Create - Produce new or original work, design solutions'
};

// Action verbs for each Bloom's level
const CO_BLOOM_ACTIONS = {
  L1: ['Define', 'List', 'Identify', 'State', 'Name', 'Recall'],
  L2: ['Explain', 'Describe', 'Summarize', 'Interpret', 'Clarify', 'Discuss'],
  L3: ['Apply', 'Demonstrate', 'Illustrate', 'Show', 'Implement', 'Calculate'],
  L4: ['Analyze', 'Examine', 'Differentiate', 'Compare', 'Contrast', 'Investigate'],
  L5: ['Evaluate', 'Assess', 'Justify', 'Validate', 'Critically analyze', 'Recommend'],
  L6: ['Design', 'Develop', 'Construct', 'Create', 'Formulate', 'Propose']
};

/**
 * Main question generation function (template-based, no API keys required)
 */
export async function generateQuestions(request) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[AI-V4] Generating ${request.numQuestions} production-grade questions...`);
  }

  const questions = [];
  const bloomActions = CO_BLOOM_ACTIONS[request.bloomLevel] || CO_BLOOM_ACTIONS.L2;
  const type = detectTopicType(request.topic);

  for (let i = 0; i < request.numQuestions; i++) {
    const action = bloomActions[i % bloomActions.length];
    const context = getTopicContext(type, request.marks);

    const depthModifiers = {
      2: '',
      5: ' with a suitable example.',
      6: ' with a neat schematic diagram.',
      8: ' by provides/offering a technical justification and analysis.'
    };

    const text = sanitizeAndFixGrammar(`${action} the ${context} ${request.topic}${depthModifiers[request.marks] || ''}.`);

    questions.push({
      text,
      bloomLevel: request.bloomLevel,
      marks: request.marks,
      expectedAnswerLength: request.marks <= 2 ? 'short' : request.marks <= 10 ? 'medium' : 'long',
      keyConcepts: [request.topic],
      qualityScore: 85 + (i % 10)
    });
  }

  return questions;
}

/**
 * Classify Bloom's level of a question (keyword-based matching)
 */
export async function classifyBloomLevel(question) {
  // Keyword matching for Bloom's level classification
  const lowerQuestion = question.toLowerCase();
  if (lowerQuestion.match(/\b(design|develop|construct|create|formulate|propose)\b/)) return 'L6';
  if (lowerQuestion.match(/\b(evaluate|justify|critique|assess|defend|judge)\b/)) return 'L5';
  if (lowerQuestion.match(/\b(analyze|compare|contrast|examine|differentiate)\b/)) return 'L4';
  if (lowerQuestion.match(/\b(apply|demonstrate|solve|use|calculate|implement)\b/)) return 'L3';
  if (lowerQuestion.match(/\b(explain|describe|summarize|interpret|discuss)\b/)) return 'L2';
  return 'L1';
}

/**
 * Score question quality (0-100) using heuristic analysis
 */
export async function scoreQuestionQuality(question) {
  // Heuristic scoring based on question characteristics
  let score = 60;
  if (question.length > 50) score += 10; // Reasonable length
  if (question.includes('?')) score += 10; // Has question mark
  if (question.split(' ').length > 10) score += 10; // Sufficient detail
  if (!question.match(/\b(the|a|an)\s+\1\b/)) score += 10; // No obvious repetition
  return Math.min(score, 100);
}

/**
 * Fallback: Template-based generation
 */
function detectTopicType(topic) {
  const t = topic.toLowerCase();
  if (t.match(/\b(algorithm|method|process|flow|logic|sorting|searching|traversal|protocol|operation)\b/)) return 'process';
  if (t.match(/\b(architecture|model|structure|schema|layout|organization|hierarchy|topology|framework)\b/)) return 'structure';
  if (t.match(/\b(system|management|network|infrastructure|environment|platform|database|module)\b/)) return 'system';
  if (t.match(/\b(technique|approach|strategy|mechanism|paradigm|principle|rule|policy)\b/)) return 'method';
  return 'concept';
}

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

function sanitizeAndFixGrammar(text) {
  if (!text) return '';
  let cleaned = text
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,?!:;])/g, '$1')
    .replace(/\(Slot.*?\)/gi, '')
    .replace(/\(\d+\s*marks\)/gi, '')
    .trim();
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  if (!cleaned.endsWith('.') && !cleaned.endsWith('?')) cleaned += '.';
  return cleaned;
}

/**
 * Remove duplicate questions using text similarity
 */
export function removeDuplicates(questions) {
  const unique = [];

  for (const question of questions) {
    const isDuplicate = unique.some((uq) => textSimilarity(uq.text, question.text) > 0.8);

    if (!isDuplicate) {
      unique.push(question);
    }
  }

  return unique;
}

/**
 * Calculate text similarity (Jaccard similarity)
 */
function textSimilarity(text1, text2) {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));

  const intersection = new Set(Array.from(words1).filter((x) => words2.has(x)));
  const union = new Set([...Array.from(words1), ...Array.from(words2)]);

  return intersection.size / union.size;
}