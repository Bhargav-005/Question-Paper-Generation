-- Migration: Add co_topic_mappings table
-- Description: Store ML-suggested CO-Topic mappings bound to specific papers

CREATE TABLE IF NOT EXISTS co_topic_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    mapped_co TEXT NOT NULL,
    confidence FLOAT NOT NULL,
    approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mappings_paper_id ON co_topic_mappings(paper_id);
