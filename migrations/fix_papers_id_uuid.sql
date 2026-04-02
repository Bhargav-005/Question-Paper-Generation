-- Migration: Fix papers.id to UUID
-- Fixes: PaperStart "invalid input syntax for type integer" on JOIN with course_context.
-- Cause: papers.id was INTEGER while course_context.paper_id is UUID; JOIN fails.
--
-- Run after fix_course_context_paper_id_uuid.sql (or run this first if papers not yet migrated).
-- Run with: psql $DATABASE_URL -f migrations/fix_papers_id_uuid.sql

-- 1. Drop all foreign keys that reference papers(id)
ALTER TABLE course_context
  DROP CONSTRAINT IF EXISTS course_context_paper_id_fkey;
ALTER TABLE course_context
  DROP CONSTRAINT IF EXISTS course_context_paper_id_papers_id_fk;

ALTER TABLE paper_outcomes
  DROP CONSTRAINT IF EXISTS paper_outcomes_paper_id_fkey;
ALTER TABLE paper_outcomes
  DROP CONSTRAINT IF EXISTS paper_outcomes_paper_id_papers_id_fk;

ALTER TABLE syllabus_units
  DROP CONSTRAINT IF EXISTS syllabus_units_paper_id_fkey;
ALTER TABLE syllabus_units
  DROP CONSTRAINT IF EXISTS syllabus_units_paper_id_papers_id_fk;

ALTER TABLE co_topic_mappings
  DROP CONSTRAINT IF EXISTS co_topic_mappings_paper_id_fkey;

-- 2. Truncate dependent tables (so we can change types; data will be re-created by app)
TRUNCATE course_context;
TRUNCATE paper_outcomes;
TRUNCATE syllabus_units;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'co_topic_mappings') THEN
    TRUNCATE co_topic_mappings;
  END IF;
END $$;

-- 3. Convert papers.id from integer to UUID
ALTER TABLE papers
  ALTER COLUMN id DROP DEFAULT;

ALTER TABLE papers
  ALTER COLUMN id TYPE uuid USING gen_random_uuid();

ALTER TABLE papers
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 4. Ensure course_context.paper_id is UUID (if not already) and re-add FK
ALTER TABLE course_context
  ALTER COLUMN paper_id TYPE uuid USING gen_random_uuid();
ALTER TABLE course_context
  ADD CONSTRAINT course_context_paper_id_fkey
  FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE;

-- 5. paper_outcomes.paper_id -> UUID and FK
ALTER TABLE paper_outcomes
  ALTER COLUMN paper_id TYPE uuid USING gen_random_uuid();
ALTER TABLE paper_outcomes
  ADD CONSTRAINT paper_outcomes_paper_id_fkey
  FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE;

-- 6. syllabus_units.paper_id -> UUID and FK
ALTER TABLE syllabus_units
  ALTER COLUMN paper_id TYPE uuid USING gen_random_uuid();
ALTER TABLE syllabus_units
  ADD CONSTRAINT syllabus_units_paper_id_fkey
  FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE;

-- 7. co_topic_mappings.paper_id is already UUID in schema; re-add FK (skip if table does not exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'co_topic_mappings') THEN
    ALTER TABLE co_topic_mappings
      ADD CONSTRAINT co_topic_mappings_paper_id_fkey
      FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE;
  END IF;
END $$;
