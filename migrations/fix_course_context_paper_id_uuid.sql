-- Migration: Fix course_context.paper_id to UUID
-- Fixes: "invalid input syntax for type integer: <uuid>" when saving Course Context.
-- Cause: course_context.paper_id was integer while papers.id is UUID; app sends UUID.
--
-- Run with: psql $DATABASE_URL -f migrations/fix_course_context_paper_id_uuid.sql
-- Requires: papers.id must already be UUID (e.g. DEFAULT gen_random_uuid()).

-- 1. Drop FK constraint if it exists (name may vary by PG version)
ALTER TABLE course_context
  DROP CONSTRAINT IF EXISTS course_context_paper_id_fkey;

ALTER TABLE course_context
  DROP CONSTRAINT IF EXISTS course_context_paper_id_papers_id_fk;

-- 2. Convert paper_id to UUID. Existing integer IDs cannot be preserved;
--    course context will be re-saved by the app when user edits the form.
TRUNCATE course_context;

ALTER TABLE course_context
  ALTER COLUMN paper_id TYPE uuid USING gen_random_uuid();

-- 3. Re-add foreign key to papers(id)
ALTER TABLE course_context
  ADD CONSTRAINT course_context_paper_id_fkey
  FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE;
