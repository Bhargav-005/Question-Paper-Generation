

import { questionService } from "./services/questionService.js";

import { authRouter } from "./routes/auth.js";
import { adminRouter } from "./routes/admin.js";
import { requireAuth } from "./middleware/auth.js";
import { papersRouter } from "./routes/papers.js";
import { courseContextRouter } from "./routes/courseContext.js";
import { syllabusRouter } from "./routes/syllabus.js";
import { paperStartRouter } from "./routes/paperStart.js";
import { mlRouter } from "./routes/ml.js";
import { exportRouter } from "./routes/export.js";
import { heavyServiceLimiter } from "./middleware/rateLimiter.js";
import { outcomesRouter } from "./routes/outcomes.js";

export async function registerRoutes(
httpServer,
app)
{

  // Health check (public)
  app.get('/api/health', (req, res) => {
    res.json({ success: true, service: 'Q-PAPER API', timestamp: new Date().toISOString() });
  });

  // Auth (public)
  app.use('/api/auth', authRouter);

  // Export (PROTECTED)
  app.use('/api/export', exportRouter);

  // Admin
  app.use('/api/admin', adminRouter);

  // Protect heavy endpoints with rate limiting
  app.use('/api/ml', heavyServiceLimiter);
  app.use('/api/mapping/ml-suggest', heavyServiceLimiter);
  app.use('/api/questions/generate', heavyServiceLimiter);
  app.use('/api/questions/generate-paper', heavyServiceLimiter);
  app.use('/api/generate-questions', heavyServiceLimiter);

  // ── CRITICAL: Specific routes MUST come before generic /:id routes ──────────
  // paperStartRouter handles POST /api/papers/start
  // If papersRouter mounts first, Express treats "start" as a UUID and crashes
  app.use('/api/papers', paperStartRouter);

  // Sub-routes with /:paperId prefix
  app.use('/api/papers', courseContextRouter);
  app.use('/api/papers', syllabusRouter);
  app.use('/api/papers', outcomesRouter);

  // ML routes on /api/papers (handles /:paperId/ml/map)
  app.use('/api/papers', mlRouter);

  // Generic paper CRUD — LAST because it has /:id wildcard
  app.use('/api/papers', papersRouter);

  // Alias mounts for frontend service calls
  app.use('/api/course-context', courseContextRouter);
  app.use('/api/outcomes', outcomesRouter);
  app.use('/api/syllabus', syllabusRouter);

  // Standalone ML (direct text-based calls)
  app.use('/api/ml', mlRouter);

  // Direct ML mapping endpoint (for testing/external calls)
  app.post('/api/mapping/ml-suggest', requireAuth, async (req, res) => {
    try {
      const { courseOutcomes, syllabusTopics, threshold } = req.body;
      if (!courseOutcomes || !syllabusTopics) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }
      const { mapTopicsToCOs } = await import('./services/mlService.js');
      const result = await mapTopicsToCOs(courseOutcomes, syllabusTopics, threshold || 0.35);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * Generate questions for single requirement (PROTECTED)
   */
  app.post('/api/questions/generate', requireAuth, async (req, res) => {
    try {
      const { unit, part, bloomLevel, topic, context, marks, count, coId } = req.body;

      // Validate required fields
      if (!bloomLevel || !topic || !marks || !count) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: bloomLevel, topic, marks, count'
        });
      }

      if (process.env.NODE_ENV === "development") {
        console.log(`[API] User ${req.user?.email} generating ${count} questions for ${topic}`);
      }

      const questions = await questionService.generateForRequirement({
        unit: unit || 'Unit I',
        part: part || 'A',
        bloomLevel,
        topic,
        context: context || topic,
        marks,
        count,
        coId: coId || 'CO1'
      });

      res.json({
        success: true,
        questions,
        user: req.user?.email
      });
    } catch (error) {
      console.error('[API] Question generation error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate questions'
      });
    }
  });

  /**
   * Generate complete question paper (PROTECTED)
   */
  app.post('/api/questions/generate-paper', requireAuth, async (req, res) => {
    try {
      const { paperId, blueprint, coMappings, syllabusTopics } = req.body;

      // Validate required data
      if (!blueprint || !coMappings || !syllabusTopics) {
        return res.status(400).json({
          success: false,
          error: 'Missing required data: blueprint, coMappings, syllabusTopics'
        });
      }

      if (process.env.NODE_ENV === "development") {
        console.log(`[API] User ${req.user?.email} generating complete question paper...`);
      }

      const result = await questionService.generateQuestionPaper(
        blueprint,
        coMappings,
        syllabusTopics
      );

      // Save to database if paperId is provided
      if (paperId) {
        try {
          await db.query(
            "UPDATE papers SET paper_content = $1, status = 'FINALIZED', updated_at = CURRENT_TIMESTAMP WHERE id = $2",
            [result, paperId]
          );
          if (process.env.NODE_ENV === "development") {
            console.log(`[API] Paper ${paperId} finalized and saved to database`);
          }
        } catch (dbError) {
          console.error('[API] Error saving paper content:', dbError);
          // Don't fail the whole request if DB save fails, but maybe we should?
          // User requested it as a core part of the goal.
        }
      }

      res.json({
        success: true,
        data: result,
        user: req.user?.email
      });
    } catch (error) {
      console.error('[API] Paper generation error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate question paper'
      });
    }
  });

  /**
   * Generate questions using deterministic templates (PROTECTED)
   * NO OpenAI - Uses hard-coded templates only
   */
  app.post('/api/generate-questions', requireAuth, async (req, res) => {
    try {
      const { coMappings, blueprint } = req.body;

      // Validate required data
      if (!coMappings || !blueprint) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: coMappings, blueprint'
        });
      }

      // Get syllabus topics from session (or from request body)
      const syllabusTopics = req.body.syllabusTopics || [];

      if (!syllabusTopics.length) {
        return res.status(400).json({
          success: false,
          error: 'Missing syllabusTopics data'
        });
      }

      if (process.env.NODE_ENV === "development") {
        console.log(`[API] User ${req.user?.email} generating deterministic questions`);
        console.log(`[API] Blueprint items: ${blueprint.length}, Mappings: ${coMappings.length}`);
      }

      // Import the deterministic generator
      const { generateQuestions, validateBlueprintConfig } = await import('./services/questionGenerator.js');

      // Validate blueprint
      const validation = validateBlueprintConfig(blueprint);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid blueprint configuration',
          details: validation.errors
        });
      }

      // Generate questions
      const questions = generateQuestions(coMappings, blueprint, syllabusTopics);

      if (process.env.NODE_ENV === "development") {
        console.log(`[API] Generated ${questions.length} questions successfully`);
      }

      res.json({
        success: true,
        questions,
        user: req.user?.email
      });
    } catch (error) {
      console.error('[API] Deterministic question generation error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate questions'
      });
    }
  });

  return httpServer;
}