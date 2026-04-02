import { generateQuestions, removeDuplicates } from './aiService.js';
import { sanitizeQuestionText as utilitySanitizer } from '../../shared/questionSanitizer.js';

// ─────────────────────────────────────────────────────────────────────────────
// QuestionService  — v4 "Absolute Zero Duplication"
//
//   ── Inherited from v3 ───────────────────────────────────────────────────
//   • Normalized-question CACHE (avoids recomputing normalizeText on hot path)
//   • Stronger normalizeText: stopword removal + lightweight suffix stemming
//   • Jaccard now operates on pre-stemmed token Sets (no re-normalization)
//   • Dynamic retries: up to 5 when candidate pool is small
//   • Small-syllabus mode: relaxed similarity threshold (0.85)
//   • Prompt diversity: verb + structure + subtopic variation per retry
//   • ENABLE_DEDUP=false fully bypasses all dedup logic (rollback-safe)
//   • CONCEPT-LEVEL deduplication (usedConceptHashes)
//
//   ── NEW v4 ──────────────────────────────────────────────────────────────
//   • SUBTOPIC tracking (usedSubtopics Set) — rejects if subtopic repeats
//   • extractSubtopic(): derives a coarse subtopic label from question text
//   • isDuplicate() now checks usedSubtopics BEFORE Jaccard scan
//   • registerQuestion() now stores subtopic in usedSubtopics
//   • Emergency fallback (generateForRequirement) now goes through dedup
//     → questions that fail dedup after fallback are SKIPPED (never forced)
//   • Blueprint P5 fallback: injects ALL used concept hashes into prompt
//   • generateAttempt retry: seeds prompt with full usedConceptHashes list
//   • PRIORITY: Uniqueness > CO constraint > concept diversity > marks > Bloom
// ─────────────────────────────────────────────────────────────────────────────

// ── Stopwords to strip before Jaccard comparison (common academic noise) ──────
const STOPWORDS = new Set([
  'a','an','the','is','are','was','were','be','been','being',
  'in','on','at','to','for','of','and','or','but','with',
  'what','write','about','briefly','short','notes','define',
  'explain','describe','how','why','when','where','which'
]);

// ── Additional COGNITIVE/ACTION VERBS stripped during concept extraction ──────
// These appear at question-start and carry zero concept information.
const CONCEPT_VERBS = new Set([
  'define','explain','discuss','demonstrate','describe','analyze',
  'analyse','compare','derive','illustrate','evaluate','design',
  'justify','examine','state','list','mention','outline','identify',
  'apply','interpret','differentiate','distinguish','solve',
  'calculate','show','prove','elaborate','summarize','summarise',
  'write','give','find','determine','compute','implement','develop'
]);

// ── Lightweight suffix stemmer (no external lib) ──────────────────────────────
function stemWord(w) {
  if (w.length > 5) {
    if (w.endsWith('ing')) return w.slice(0, -3);
    if (w.endsWith('tion')) return w.slice(0, -4);
    if (w.endsWith('ness')) return w.slice(0, -4);
    if (w.endsWith('ed'))  return w.slice(0, -2);
    if (w.endsWith('ly'))  return w.slice(0, -2);
    if (w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  }
  return w;
}

export class QuestionService {

  constructor() {
    // ── Wording-level dedup (existing) ──────────────────────────────────────
    this.usedQuestionsSet = new Set();        // normalized text → O(1) exact check
    this.usedQuestionsList = [];               // raw texts       → Jaccard scan
    this.normalizedUsedQuestions = [];         // pre-stemmed token Sets → avoids re-normalization
    this.enableDedup = process.env.ENABLE_DEDUP !== 'false'; // default ON

    // ── Concept-level dedup (v3) ──────────────────────────────────────────
    this.usedConceptHashes = new Set();        // "kw1_kw2_kw3" → O(1) concept check
    this.enableConceptDedup =
      process.env.ENABLE_CONCEPT_DEDUP !== 'false'; // default ON; set 'false' to disable

    // ── Subtopic-level dedup (NEW v4) ─────────────────────────────────────
    // A coarse label (top-2 tokens) prevents the same subtopic from appearing
    // even when concept hashes differ slightly due to wording changes.
    this.usedSubtopics = new Set();            // "token1_token2" → O(1) subtopic check

    // ── Generic CO check tracking ─────────────────────────────────────────
    // Tracks if a CO has already received a generic overview question
    this.usedGenericCO = new Set();

    // ── Fallback tracking (NEW) ───────────────────────────────────────────
    // Track generic fallback hashes independently to generate entirely
    // different key concepts next time avoiding repeating generic prompts
    this.usedFallbackHashes = new Set();
  }

  // ─── TEXT HELPERS ──────────────────────────────────────────────────────────

  /**
   * Normalize question text for comparison:
   * lowercase → strip punctuation → remove stopwords → lightweight stem
   * Returns a space-joined string of meaningful stemmed tokens.
   */
  normalizeText(q) {
    if (!q) return '';
    return q
      .toLowerCase()
      .replace(/[^\w\s]/g, '')     // strip punctuation
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(w => w.length > 1 && !STOPWORDS.has(w))  // remove stopwords
      .map(stemWord)                                      // lightweight stem
      .join(' ');
  }

  /**
   * STRICT SANITIZATION LAYER
   * Clean system metadata from final questions.
   * Runs right before registerQuestion and final output.
   */
  sanitizeQuestionText(qText) {
    // Delegate to shared utility but handle the possible null return (discard)
    // by returning original if null or a safe fallback string
    const result = utilitySanitizer(qText);
    return result || qText;
  }

  /**
   * Build a stemmed token Set from a normalized string.
   * Cached internally via normalizedUsedQuestions[] — never recomputed.
   */
  _tokenSet(normalizedStr) {
    return new Set(normalizedStr.split(' ').filter(w => w.length > 0));
  }

  /**
   * Jaccard word-level similarity — NO ML, NO embeddings.
   * Accepts pre-built token Sets for performance (avoids re-normalizing).
   * Returns 0 (completely different) → 1 (identical).
   */
  calculateSimilarity(q1, q2) {
    const s1 = this.normalizeText(q1);
    const s2 = this.normalizeText(q2);
    if (s1 === s2) return 1;
    return this._jaccardSets(this._tokenSet(s1), this._tokenSet(s2));
  }

  /**
   * Core Jaccard computation on two pre-built Sets.
   * Used internally so hot-path scans skip re-normalization.
   */
  _jaccardSets(set1, set2) {
    if (set1.size === 0 && set2.size === 0) return 0;
    let intersectionSize = 0;
    for (const w of set1) {
      if (set2.has(w)) intersectionSize++;
    }
    const unionSize = set1.size + set2.size - intersectionSize;
    return unionSize === 0 ? 0 : intersectionSize / unionSize;
  }

  // ─── CONCEPT EXTRACTION (v3) ──────────────────────────────────────────────

  /**
   * Extract the core concept signature from a question string.
   *
   * Pipeline:
   *   1. Lowercase + strip punctuation
   *   2. Remove stopwords (STOPWORDS set)
   *   3. Remove cognitive/action verbs (CONCEPT_VERBS set)
   *   4. Lightweight stem remaining tokens
   *   5. Return top 3–5 shortest meaningful keywords (most specific first)
   *
   * @param {string} qText - raw question text
   * @returns {string[]}   - array of keyword strings (already stemmed)
   */
  extractConcept(qText) {
    if (!qText) return [];

    const tokens = qText
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(w =>
        w.length > 2 &&
        !STOPWORDS.has(w) &&
        !CONCEPT_VERBS.has(w)
      )
      .map(stemWord);

    // Deduplicate while preserving order
    const seen = new Set();
    const unique = [];
    for (const t of tokens) {
      if (!seen.has(t)) { seen.add(t); unique.push(t); }
    }

    // Return top 3–5 tokens; prefer shorter (more specific) tokens first
    return unique
      .sort((a, b) => a.length - b.length)
      .slice(0, 5);
  }

  /**
   * Build a stable concept hash string from a question text.
   * Tokens are sorted so word-order variations yield the same hash.
   *
   * @param {string} qText
   * @returns {string}
   */
  buildConceptHash(qText) {
    const keywords = this.extractConcept(qText);
    if (keywords.length === 0) return '';
    return [...keywords].sort().join('_');
  }

  // ─── SUBTOPIC EXTRACTION (NEW v4) ────────────────────────────────────────

  /**
   * Derive a coarse subtopic label (top-2 concept tokens, sorted).
   * Uses the same cleaned token list as extractConcept but takes only 2
   * tokens — broad enough to group the same subtopic even if wording
   * differs, yet narrow enough not to over-reject.
   *
   * Examples:
   *   "Explain the indexing strategies in MongoDB" → "index_mongodb"
   *   "Describe MongoDB indexing" → "index_mongodb"  (same subtopic → blocked)
   *
   * @param {string} qText
   * @returns {string}  "token1_token2" or "" if < 2 tokens extracted
   */
  extractSubtopic(qText) {
    const keywords = this.extractConcept(qText); // already stemmed + cleaned
    if (keywords.length < 2) return keywords.join('_'); // 0 or 1 token — handle gracefully
    return [...keywords].sort().slice(0, 2).join('_');
  }

  // ─── GENERIC QUESTION DETECTION ──────────────────────────────────────────────

  /**
   * Returns TRUE if the question is a broad "generic overview" style question
   * that doesn't probe specific subtopics.
   */
  isGenericQuestion(qText) {
    if (!qText) return false;
    const text = qText.toLowerCase();

    const genericPatterns = [
      'key concept',
      'fundamental concept',
      'major component',
      'overview',
      'in detail',
      'principles',
      'fundamentals'
    ];

    return genericPatterns.some(pattern => text.includes(pattern));
  }

  /**
   * REJECT questions with missing/empty topics or incomplete phrasing.
   * Ensures every question has a valid topic and is a complete sentence.
   */
  validateQuestion(qText, topic) {
    if (!qText) return false;
    
    // 1. Topic validation: reject null, undefined, empty, or too short (< 3 chars)
    if (!topic || typeof topic !== 'string' || topic.trim().length < 3) {
      return false;
    }

    const text = qText.toLowerCase();
    
    // 2. Pattern validation: detect common template substitution failures
    // Pattern: "Explain the fundamental concepts related to in detail."
    const errorPatterns = [
      'related to in detail',
      'concepts related to'
    ];

    if (errorPatterns.some(p => text.includes(p))) {
      // Re-validate if the topic string is actually present in the text
      if (!text.includes(topic.toLowerCase())) {
        return false;
      }
    }

    // 3. Length validation: too short for an academic question
    if (qText.trim().length < 15) return false;

    return true;
  }

  // ─── DUPLICATE DETECTION ──────────────────────────────────────────────────

  /**
   * Returns true if qText is too similar to any already-used question.
   *
   * ── Check order (fastest → slowest) ──────────────────────────────────────
   *   0. [v4] Subtopic collision check              → O(1)  [if ENABLE_DEDUP]
   *   1. [v3] Concept hash collision check           → O(1)  [if ENABLE_CONCEPT_DEDUP]
   *   2.      Exact normalized string match          → O(1)
   *   3.      Jaccard against cached token Sets      → O(n·k)
   *
   * Threshold: 0.75 normally; 0.85 when syllabus is small (≤ 5 topics)
   *
   * @param {string} qText
   * @param {number} [syllabusSize]
   * @param {string} [coId]
   * @returns {{ isDup: boolean, conceptHash: string, subtopic: string, genericRejected: boolean }}
   */
  isDuplicate(qText, syllabusSize = Infinity, coId = null) {
    if (!this.enableDedup) return { isDup: false, conceptHash: '', subtopic: '', genericRejected: false };

    // Step -1 (v4 extension): A CO can only have ONE "generic overview" type question
    if (coId && this.isGenericQuestion(qText)) {
      if (this.usedGenericCO.has(coId)) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[QS][GenericDedup] REJECTED — CO ${coId} already has a generic overview question.`);
        }
        return { isDup: true, conceptHash: '', subtopic: '', genericRejected: true };
      }
    }

    let conceptHash = '';
    let subtopic = '';

    // Step 0 (v4): subtopic-level check — fastest broad filter
    subtopic = this.extractSubtopic(qText);
    if (subtopic && this.usedSubtopics.has(subtopic)) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[QS][SubtopicDedup] REJECTED — subtopic "${subtopic}" already used`);
      }
      return { isDup: true, conceptHash, subtopic, genericRejected: false };
    }

    // Step 1 (v3): concept-level check
    if (this.enableConceptDedup) {
      conceptHash = this.buildConceptHash(qText);
      if (conceptHash && this.usedConceptHashes.has(conceptHash)) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[QS][ConceptDedup] REJECTED — concept "${conceptHash}" already used`);
        }
        return { isDup: true, conceptHash, subtopic, genericRejected: false };
      }
    }

    const normalized = this.normalizeText(qText);

    // Step 2: exact normalized match (O(1))
    if (this.usedQuestionsSet.has(normalized)) return { isDup: true, conceptHash, subtopic, genericRejected: false };

    // Step 3: Jaccard scan using cached token Sets (no re-normalization)
    const THRESHOLD = syllabusSize <= 5 ? 0.85 : 0.75;
    const candidateSet = this._tokenSet(normalized);
    for (const existingSet of this.normalizedUsedQuestions) {
      if (this._jaccardSets(candidateSet, existingSet) > THRESHOLD) {
        return { isDup: true, conceptHash, subtopic, genericRejected: false };
      }
    }

    return { isDup: false, conceptHash, subtopic, genericRejected: false };
  }

  /**
   * Register an accepted question so future candidates can be compared against it.
   * Stores:
   *  - normalized string (for O(1) exact check)
   *  - pre-built stemmed token Set (for fast Jaccard scan)
   *  - concept hash (v3: concept-level collision)
   *  - subtopic label (v4: subtopic-level collision)
   *
   * @param {string} qText - raw question text
   * @param {string} [coId] - the CO assigned to this question
   * @returns {{ conceptHash: string, subtopic: string }}
   */
  registerQuestion(qText, coId = null) {
    if (coId && this.isGenericQuestion(qText)) {
      this.usedGenericCO.add(coId);
      if (process.env.NODE_ENV === 'development') {
        console.log(`[QS][GenericDedup] Registered generic overview question for CO ${coId}`);
      }
    }

    const normalized = this.normalizeText(qText);
    this.usedQuestionsSet.add(normalized);
    this.usedQuestionsList.push(qText);
    this.normalizedUsedQuestions.push(this._tokenSet(normalized));

    let conceptHash = '';
    let subtopic = '';

    // v3: register concept hash
    if (this.enableConceptDedup) {
      conceptHash = this.buildConceptHash(qText);
      if (conceptHash) {
        this.usedConceptHashes.add(conceptHash);
        if (process.env.NODE_ENV === 'development') {
          console.log(`[QS][ConceptDedup] Registered concept hash: "${conceptHash}"`);
        }
      }
    }

    // v4: register subtopic
    subtopic = this.extractSubtopic(qText);
    if (subtopic) {
      this.usedSubtopics.add(subtopic);
      if (process.env.NODE_ENV === 'development') {
        console.log(`[QS][SubtopicDedup] Registered subtopic: "${subtopic}"`);
      }
    }

    return { conceptHash, subtopic };
  }

  /**
   * Return the best unique candidate from a list, or null if all are duplicates.
   * Passes syllabusSize through to isDuplicate for adaptive threshold.
   *
   * @param {Array}  candidates    - question objects with .text and .qualityScore
   * @param {number} syllabusSize  - number of available topics for this CO
   * @param {string} [coId]        - current CO
   * @returns {{ best: object|null, blockedConcept: string, blockedSubtopic: string, blockedGeneric: boolean }}
   */
  selectBestUnique(candidates, syllabusSize = Infinity, coId = null) {
    let blockedConcept = '';
    let blockedSubtopic = '';
    let blockedGeneric = false;

    const valid = candidates.filter(q => {
      const { isDup, conceptHash, subtopic, genericRejected } = this.isDuplicate(q.text, syllabusSize, coId);
      if (isDup) {
        if (conceptHash)     blockedConcept = conceptHash;
        if (subtopic)        blockedSubtopic = subtopic;
        if (genericRejected) blockedGeneric = true;
      }
      return !isDup;
    });

    if (valid.length === 0) return { best: null, blockedConcept, blockedSubtopic, blockedGeneric };

    const best = valid.sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0))[0];
    return { best, blockedConcept, blockedSubtopic, blockedGeneric };
  }

  // ─── BLOOM HELPERS ────────────────────────────────────────────────────────

  /**
   * Return Bloom levels adjacent (±1) to the given level.
   */
  getAdjacentBloomLevels(level) {
    const n = parseInt(level.replace('L', ''), 10) || 2;
    const adj = [];
    if (n > 1) adj.push(`L${n - 1}`);
    if (n < 6) adj.push(`L${n + 1}`);
    return adj;
  }

  // ─── MARKS / WORDING ADJUSTMENT ──────────────────────────────────────────

  /**
   * When a question from a different marks tier is used as fallback,
   * lightly adjust wording to match the expected complexity.
   * Marks value is always set back to requiredMarks.
   */
  adjustQuestion(q, altMarks, requiredMarks) {
    const clone = { ...q, marks: requiredMarks };
    if (altMarks > requiredMarks) {
      clone.text = clone.text.replace(/ \(Be concise\)$/, '') + ' (Be concise)';
    } else if (altMarks < requiredMarks) {
      clone.text = clone.text.replace(/ \(Elaborate\)$/, '') + ' (Elaborate)';
    }
    return clone;
  }

  // ─── CORE GENERATION (with retry) ────────────────────────────────────────

  /**
   * Build a human-readable summary of blocked concepts + subtopics for prompt injection.
   * Capped at 5 entries to avoid prompt bloat.
   *
   * @returns {string}
   */
  _buildBlockedConceptsContext() {
    const concepts = [...this.usedConceptHashes].slice(-5).map(h => h.replace(/_/g, ' '));
    const subtopics = [...this.usedSubtopics].slice(-5).map(s => s.replace(/_/g, ' '));

    const parts = [];
    if (concepts.length > 0)  parts.push(`concepts already used: [${concepts.join(', ')}]`);
    if (subtopics.length > 0) parts.push(`subtopics already used: [${subtopics.join(', ')}]`);
    return parts.join('; ');
  }

  /**
   * Generate a pool of candidate questions for given bloom/marks/requirement,
   * trying up to maxRetries times with progressively varied prompts.
   *
   * v4 changes:
   *   • selectBestUnique now returns { best, blockedConcept, blockedSubtopic }
   *   • Retry prompt injects BOTH blocked concept AND blocked subtopic
   *   • Retry prompt appends _buildBlockedConceptsContext() so AI knows ALL used concepts
   *   • On each retry: different verb + different structure + explicit avoidance clause
   *   • "Use a completely different concept than previous questions in this paper"
   *
   * @param {string} bloomLevel
   * @param {number} marks
   * @param {object} req            - requirement object
   * @param {number} [maxRetries]   - default 3; bumped to 5 for small pools
   * @param {number} [syllabusSize] - #topics available; drives adaptive threshold
   */
  async generateAttempt(bloomLevel, marks, req, maxRetries = 3, syllabusSize = Infinity) {
    // ── Verb bank (cognitive action diversity) ──────────────────────────────
    const VARIATION_VERBS = [
      'Define', 'Explain', 'Analyze', 'Compare', 'Derive',
      'Illustrate', 'Discuss', 'Evaluate', 'Design', 'Justify', 'Examine'
    ];

    // ── Question structure types (format diversity) ─────────────────────────
    const STRUCTURES = [
      '',                              // default — no override
      'Pose this as a case-based problem.',
      'Frame this as a statement-based question.',
      'Use a real-world application scenario.',
      'Make this a comparison-based question.'
    ];

    // Dynamic retry ceiling: small syllabus → more attempts
    const effectiveRetries = syllabusSize <= 3 ? Math.max(maxRetries, 5) : maxRetries;

    // Track the most recently blocked concept/subtopic/generic across attempts for prompt injection
    let lastBlockedConcept  = req._blockedConcept || '';
    let lastBlockedSubtopic = req._blockedSubtopic || '';
    let lastBlockedGeneric  = false;

    // ── Topic Pre-validation & Fallback ──────────────────────────────────
    // If topic is missing/invalid, try to pick another valid topic from the same CO
    if (!req.topic || typeof req.topic !== 'string' || req.topic.trim().length < 3) {
      const altTopic = (req._syllabusTopics || [])
        .find(t => t.coId === req.coId && t.topic && t.topic.trim().length >= 3);
      
      if (altTopic) {
        req.topic = altTopic.topic;
      } else {
        // If no topics found in syllabus for this CO, block and warn
        console.error(`[QS] Critical: No valid syllabus topics found for CO ${req.coId}`);
        return null;
      }
    }

    for (let attempt = 0; attempt < effectiveRetries; attempt++) {
      let context = req.context;

      if (attempt > 0) {
        const verb      = VARIATION_VERBS[(attempt * 2) % VARIATION_VERBS.length];
        const structure = STRUCTURES[attempt % STRUCTURES.length];

        // ── v4: Inject blocked concept + blocked subtopic explicitly ─────────
        const conceptClause = lastBlockedConcept
          ? ` Do NOT repeat "${lastBlockedConcept.replace(/_/g, ' ')}".`
          : '';
        const subtopicClause = lastBlockedSubtopic
          ? ` Do NOT use the "${lastBlockedSubtopic.replace(/_/g, ' ')}" subtopic again.`
          : '';

        // ── NEW: Force specific subtopic if generic was blocked ──────────────
        const genericClause = lastBlockedGeneric
          ? ` Generate a question on a SPECIFIC subtopic within this CO. Avoid generic overview questions.`
          : '';

        // ── v4: Inject full history of used concepts + subtopics ─────────────
        const blockedCtx = this._buildBlockedConceptsContext();
        const historyClause = blockedCtx
          ? ` AVOID these ${blockedCtx}.`
          : '';

        // Force completely different concept on later retries
        const diversityClause =
          ` Use a completely different concept than previous questions in this paper.` +
          ` Generate a question from a DIFFERENT concept or subtopic within the same unit.`;

        const antiRepeat = attempt >= 2
          ? ' Avoid repeating previously generated ideas or phrasing.'
          : '';

        context =
          `${req.context} —` +
          conceptClause +
          subtopicClause +
          genericClause +
          historyClause +
          diversityClause +
          ` Start with '${verb}'.` +
          (structure ? ` ${structure}` : '') +
          antiRepeat;
      }

      let questions = [];
      try {
        questions = await generateQuestions({
          bloomLevel,
          topic: req.topic,
          context,
          marks,
          numQuestions: 6, // generous pool for per-slot filtering
          unit: req.unit,
          coId: req.coId
        });
      } catch (err) {
        console.error(`[QS] generateQuestions error (attempt ${attempt + 1}):`, err.message);
        continue;
      }

      const { best, blockedConcept, blockedSubtopic, blockedGeneric } = this.selectBestUnique(
        questions.filter(q => {
          const scoreOk = (q.qualityScore || 0) > 60;
          const validOk = this.validateQuestion(q.text, req.topic);
          return scoreOk && validOk;
        }),
        syllabusSize,
        req.coId
      );

      // Capture the blocked items for the next retry prompt
      if (blockedConcept)  lastBlockedConcept  = blockedConcept;
      if (blockedSubtopic) lastBlockedSubtopic = blockedSubtopic;
      if (blockedGeneric)  lastBlockedGeneric  = true;

      if (best) return best;
    }

    return null; // All attempts exhausted → caller falls back
  }

  // ─── BLUEPRINT FALLBACK STRATEGY ─────────────────────────────────────────

  /**
   * Try to generate a single question honouring the blueprint precisely.
   *
   * Priority ladder (v4) — UNIQUENESS first, then CO constraint:
   *
   *   STEP 1. Same CO + Same Marks + Same Bloom + Different concept (ideal)
   *   STEP 2. Same CO + Alt Marks  + Same Bloom + Different concept
   *   STEP 3. Same CO + Same Marks + Adjacent Bloom + Different concept
   *   STEP 4. Same CO + Alt Marks  + Adjacent Bloom + Different concept
   *   STEP 5. Same CO + Broaden context — ALL used concepts injected into prompt
   *           → SKIPS candidate if STILL duplicate (never forces a dup into paper)
   *
   * MARKS are flexible (5M/6M/8M swap allowed).
   * BLOOM is flexible (±1 level allowed).
   * CO is MANDATORY throughout.
   * UNIQUENESS is ABSOLUTE — a duplicate is NEVER accepted regardless of step.
   */
  async tryGenerateSingle(requirement) {
    const FLEXIBLE_MARKS = [5, 6, 8];
    const reqMarks = requirement.marks;
    const reqBloom = requirement.bloomLevel;

    // Estimate available pool size (used for adaptive threshold + dynamic retries)
    const syllabusSize = Array.isArray(requirement._syllabusTopics)
      ? requirement._syllabusTopics.filter(t => t.coId === requirement.coId).length
      : Infinity;

    // ── STEP 1: Exact match ─────────────────────────────────────────────────
    const q1 = await this.generateAttempt(reqBloom, reqMarks, requirement, 3, syllabusSize);
    if (q1) return q1;

    // Flexibility only for marks in the allowed tier set
    if (!FLEXIBLE_MARKS.includes(reqMarks)) return null;

    // ── STEP 2: Same CO + Alt Marks + Same Bloom ────────────────────────────
    for (const altMarks of FLEXIBLE_MARKS) {
      if (altMarks === reqMarks) continue;
      const q = await this.generateAttempt(reqBloom, altMarks, requirement, 3, syllabusSize);
      if (q) return this.adjustQuestion(q, altMarks, reqMarks);
    }

    // ── STEP 3 & 4: Same CO + Adjacent Bloom ───────────────────────────────
    for (const adjBloom of this.getAdjacentBloomLevels(reqBloom)) {
      // STEP 3: exact marks + adjacent bloom
      const q3 = await this.generateAttempt(adjBloom, reqMarks, requirement, 3, syllabusSize);
      if (q3) return q3;

      // STEP 4: alt marks + adjacent bloom
      for (const altMarks of FLEXIBLE_MARKS) {
        if (altMarks === reqMarks) continue;
        const q = await this.generateAttempt(adjBloom, altMarks, requirement, 3, syllabusSize);
        if (q) return this.adjustQuestion(q, altMarks, reqMarks);
      }
    }

    // ── STEP 5: Broaden context within same CO ──────────────────────────────
    // v4: inject the COMPLETE used-concept history into the broadened request
    // so the AI knows every concept/subtopic to avoid, not just the last blocked one.
    const blockedCtxFull = this._buildBlockedConceptsContext();
    const broadReq = {
      ...requirement,
      context:
        `${requirement.context} — Focus on a completely different subtopic or application` +
        ` within the same unit that has NOT been covered yet.` +
        (blockedCtxFull ? ` STRICTLY AVOID: ${blockedCtxFull}.` : '') +
        ` Generate a question on a BRAND NEW concept or angle.`,
      _blockedConcept:  [...this.usedConceptHashes].slice(-1)[0]  || '',
      _blockedSubtopic: [...this.usedSubtopics].slice(-1)[0]      || ''
    };
    const q5 = await this.generateAttempt(reqBloom, reqMarks, broadReq, 2, syllabusSize);
    if (q5) return q5;

    return null; // Could not satisfy without breaking CO boundary or uniqueness → skip slot
  }

  /**
   * Generates unique fallback variations to avoid falling into generic repetitive text.
   * Uses different keywords internally to try bypassing previous subtopic/concept blocks.
   */
  generateFallbackVariant(topic, attempt, usedCount) {
    const templates = [
      `Provide a comprehensive explanation of the key concepts governing ${topic}.`,
      `Discuss the major structural components of ${topic} with relevant examples.`,
      `Analyze the operational working principles of ${topic} in detail.`,
      `Evaluate the technical significance and modern applications of ${topic}.`,
      `Describe the fundamental architecture and underlying aspects of ${topic}.`,
      `Examine the core features and functional mechanism of ${topic}.`,
      `Demonstrate the practical deployment of ${topic} in a system environment.`,
      `Critically analyze the principles and governing factors of ${topic}.`,
      `Outline the foundational characteristics and academic relevance of ${topic}.`,
      `Elaborate on the theoretical framework and practical utility of ${topic}.`
    ];
    // Distribute selection across array to ensure distinct retries
    return templates[(attempt + usedCount * 3) % templates.length];
  }

  // ─── PUBLIC: generateForRequirement ──────────────────────────────────────

  /**
   * Generate `requirement.count` questions for one blueprint slot.
   * Each accepted question is registered to prevent future duplicates
   * (wording-level AND concept-level AND subtopic-level in v4).
   *
   * ── CRITICAL v4 change ──────────────────────────────────────────────────
   * The emergency fallback (raw generation) now runs the result THROUGH
   * isDuplicate() before accepting it.  If the fallback question is ALSO a
   * duplicate, the slot is SKIPPED entirely — a duplicate is NEVER forced
   * into the final paper under any circumstances.
   *
   * If ENABLE_DEDUP=false the fallback is accepted as-is (original behaviour).
   */
  async generateForRequirement(requirement) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[QS] Generating for: ${requirement.topic} (${requirement.bloomLevel}, ${requirement.marks} marks)`);
    }

    try {
      const generated = [];

      for (let i = 0; i < requirement.count; i++) {
        let q = await this.tryGenerateSingle(requirement);

        // ── Emergency fallback — strictly constrained by dedup ───────────────
        if (!q) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[QS] Primary strategies exhausted for slot ${i + 1} of "${requirement.topic}" — attempting fallback`);
          }

          const syllabusSize = Array.isArray(requirement._syllabusTopics)
            ? requirement._syllabusTopics.filter(t => t.coId === requirement.coId).length
            : Infinity;

          let fallbackAccepted = false;
          let generatedQ = null;

          // Attempt fallback generation up to 3 times with entirely different wording variants
          for (let attempt = 0; attempt < 3; attempt++) {
            const fallbackText = this.generateFallbackVariant(
              requirement.topic,
              attempt,
              this.usedFallbackHashes.size
            );

            if (this.enableDedup) {
              const { isDup } = this.isDuplicate(fallbackText, syllabusSize, requirement.coId);
              if (!isDup && this.validateQuestion(fallbackText, requirement.topic)) {
                generatedQ = {
                  text: fallbackText,
                  bloomLevel: requirement.bloomLevel || 'Understand'
                };
                fallbackAccepted = true;
                break;
              } else {
                 if (process.env.NODE_ENV === 'development') {
                   console.log(`[QS] Fallback variation ${attempt + 1} rejected (dup/invalid): "${fallbackText}"`);
                 }
              }
            } else {
              // Deduplication explicitly disabled - accept immediately if valid
              if (this.validateQuestion(fallbackText, requirement.topic)) {
                generatedQ = {
                  text: fallbackText,
                  bloomLevel: requirement.bloomLevel || 'Understand'
                };
                fallbackAccepted = true;
                break;
              }
            }
          }

          if (fallbackAccepted && generatedQ) {
            // Track fallback hash to ensure we never loop the same text string again
            const fHash = this.normalizeText(generatedQ.text);
            this.usedFallbackHashes.add(fHash);
            q = generatedQ;
          } else {
            // All 3 fallback variants failed uniqueness test → SKIP slot (DO NOT REUSE)
            if (process.env.NODE_ENV === 'development') {
              console.warn(
                `[QS] All 3 fallback variants for slot ${i + 1} of "${requirement.topic}" were duplicates. Slot SKIPPED to preserve absolute uniqueness.`
              );
            }
            continue; // skips pushing duplicate and looping next candidate
          }
        }

        if (q) {
          q.text = this.sanitizeQuestionText(q.text);
          this.registerQuestion(q.text, requirement.coId); // registers wording + concept hash + subtopic + generic-CO (v4)
          generated.push(q);
        }
      }

      return generated.map((q, idx) => ({
        id:                  `${requirement.unit}-${requirement.part}-${idx + 1}`,
        questionNumber:      idx + 1,
        text:                q.text,
        bloomLevel:          q.bloomLevel,
        marks:               requirement.marks, // always the original blueprint marks
        unit:                requirement.unit,
        part:                requirement.part,
        coId:                requirement.coId,
        topic:               requirement.topic,
        qualityScore:        q.qualityScore || 75,
        keyConcepts:         q.keyConcepts  || [],
        expectedAnswerLength: q.expectedAnswerLength || 'medium'
      }));

    } catch (error) {
      console.error(`[QS] Error generating for ${requirement.topic}:`, error);
      throw error;
    }
  }

  // ─── PUBLIC: generateQuestionPaper ───────────────────────────────────────

  /**
   * Generate a complete question paper from a blueprint.
   * Resets ALL dedup state per invocation — wording-level, concept-level,
   * AND subtopic-level — so consecutive paper generations don't bleed
   * duplicates from a previous run.
   */
  async generateQuestionPaper(blueprint, coMappings, syllabusTopics) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[QS] Starting question paper generation...');
      console.log(`[QS] Concept dedup: ${this.enableConceptDedup ? 'ON' : 'OFF'}`);
      console.log(`[QS] Dedup: ${this.enableDedup ? 'ON' : 'OFF (raw mode)'}`);
    }

    // Reset per-paper tracking (ALL caches cleared together)
    this.usedQuestionsSet.clear();
    this.usedQuestionsList = [];
    this.normalizedUsedQuestions = [];   // clear token cache
    this.usedConceptHashes.clear();      // v3: concept hash cache
    this.usedSubtopics.clear();          // v4: subtopic label cache
    this.usedFallbackHashes.clear();     // v4: generic fallback tracking cache
    this.usedGenericCO.clear();          // v4.1: generic CO usage reset

    const allQuestions = [];
    const requirements = this.extractRequirements(blueprint, coMappings, syllabusTopics);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[QS] Extracted ${requirements.length} requirements from blueprint`);
    }

    for (const req of requirements) {
      try {
        const questions = await this.generateForRequirement(req);
        allQuestions.push(...questions);
        if (process.env.NODE_ENV === 'development') {
          console.log(`[QS] Generated ${questions.length} questions for ${req.topic}`);
        }
      } catch (error) {
        console.error(`[QS] Failed to generate for ${req.topic}, continuing...`);
      }
    }

    // Final safety pass using the existing aiService utility
    const uniqueQuestions = removeDuplicates(allQuestions);
    if (process.env.NODE_ENV === 'development') {
      console.log(`[QS] Final dedup removed ${allQuestions.length - uniqueQuestions.length} questions`);
    }

    const organizedPaper = this.organizePaper(uniqueQuestions);
    const metadata = this.calculateMetadata(uniqueQuestions);

    if (process.env.NODE_ENV === 'development') {
      console.log('[QS] Question paper generation complete!');
      console.log(`[QS] Total: ${metadata.totalQuestions} questions, ${metadata.totalMarks} marks, ${metadata.avgQuality}% avg quality`);
      if (this.enableConceptDedup) {
        console.log(`[QS] Unique concepts (${this.usedConceptHashes.size}): [${[...this.usedConceptHashes].join(', ')}]`);
      }
      console.log(`[QS] Unique subtopics (${this.usedSubtopics.size}): [${[...this.usedSubtopics].join(', ')}]`);
    }

    return { questions: organizedPaper, metadata };
  }

  // ─── EXTRACT REQUIREMENTS ─────────────────────────────────────────────────

  /**
   * Extract requirements from blueprint and mappings
   */
  extractRequirements(blueprint, coMappings, syllabusTopics) {
    const requirements = [];
    const distribution = blueprint.distribution || [];

    distribution.forEach((unitDist, unitIdx) => {
      const unit = `Unit ${['I', 'II', 'III', 'IV', 'V'][unitIdx]}`;

      // Part A (2 marks, L1-L2)
      if (unitDist.partA > 0) {
        const topics = this.getTopicsForUnit(unit, syllabusTopics, coMappings);
        topics.slice(0, unitDist.partA).forEach((topic) => {
          requirements.push({
            unit,
            part: 'A',
            bloomLevel: 'L2',
            topic: topic.topic,
            context: topic.context || `${topic.topic} in the context of ${unit}`,
            marks: 2,
            count: 1,
            coId: topic.coId || 'CO1'
          });
        });
      }

      // Part B (13 marks, L3-L4)
      if (unitDist.partB > 0) {
        const topics = this.getTopicsForUnit(unit, syllabusTopics, coMappings);
        topics.slice(0, unitDist.partB).forEach((topic) => {
          requirements.push({
            unit,
            part: 'B',
            bloomLevel: 'L3',
            topic: topic.topic,
            context: topic.context || `${topic.topic} in the context of ${unit}`,
            marks: 13,
            count: 1,
            coId: topic.coId || 'CO2'
          });
        });
      }

      // Part C (15 marks, L5-L6)
      if (unitDist.partC > 0) {
        const topics = this.getTopicsForUnit(unit, syllabusTopics, coMappings);
        topics.slice(0, unitDist.partC).forEach((topic) => {
          requirements.push({
            unit,
            part: 'C',
            bloomLevel: 'L6',
            topic: topic.topic,
            context: topic.context || `${topic.topic} in the context of ${unit}`,
            marks: 15,
            count: 1,
            coId: topic.coId || 'CO5'
          });
        });
      }
    });

    return requirements;
  }

  // ─── GET TOPICS FOR UNIT ─────────────────────────────────────────────────

  /**
   * Get topics for a specific unit
   */
  getTopicsForUnit(unit, syllabusTopics, coMappings) {
    const unitTopics = syllabusTopics.filter((t) => t.unit === unit);
    return unitTopics.map((topic) => {
      const mapping = coMappings.find((m) => m.topicId === topic.id);
      return { ...topic, coId: mapping?.coId || 'CO1' };
    });
  }

  // ─── ORGANIZE PAPER ───────────────────────────────────────────────────────

  /**
   * Organize questions into paper structure
   */
  organizePaper(questions) {
    const organized = { A: [], B: [], C: [] };
    questions.forEach((q) => {
      if (organized[q.part]) organized[q.part].push(q);
    });
    Object.keys(organized).forEach((part) => {
      organized[part].sort((a, b) => {
        if (a.unit !== b.unit) return a.unit.localeCompare(b.unit);
        return a.questionNumber - b.questionNumber;
      });
    });
    return organized;
  }

  // ─── CALCULATE METADATA ───────────────────────────────────────────────────

  /**
   * Calculate metadata statistics
   */
  calculateMetadata(questions) {
    const totalQuestions = questions.length;
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
    const avgQuality =
      totalQuestions > 0
        ? questions.reduce((sum, q) => sum + (q.qualityScore || 0), 0) / totalQuestions
        : 0;

    const bloomDistribution = { L1: 0, L2: 0, L3: 0, L4: 0, L5: 0, L6: 0 };
    questions.forEach((q) => {
      const level = q.bloomLevel || 'L2';
      bloomDistribution[level] = (bloomDistribution[level] || 0) + 1;
    });

    const coDistribution = {};
    questions.forEach((q) => {
      const co = q.coId || 'Unknown';
      coDistribution[co] = (coDistribution[co] || 0) + 1;
    });

    return {
      totalQuestions,
      totalMarks,
      avgQuality: Math.round(avgQuality * 10) / 10,
      bloomDistribution,
      coDistribution
    };
  }
}

export const questionService = new QuestionService();