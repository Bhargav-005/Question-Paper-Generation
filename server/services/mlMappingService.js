// ML Service for CO-Topic Mapping
// Calls Python script to perform semantic similarity mapping

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

































/**
 * Map syllabus topics to course outcomes using ML-based semantic similarity
 * With Node.js fallback if Python is unavailable
 */
export async function mapTopicsToCOs(
courseOutcomes,
syllabusTopics,
threshold = 0.3)
{
  try {
    // Try Python Service first
    const mlAvailable = await checkMLDependencies();
    if (mlAvailable) {
      return await runPythonMapping(courseOutcomes, syllabusTopics, threshold);
    }

    if (process.env.NODE_ENV === "development") {
      console.warn('[ML] Python dependencies not found, using Node.js fallback mapping');
    }
    return performNodeFallbackMapping(courseOutcomes, syllabusTopics, threshold);
  } catch (error) {
    console.error('[ML] Mapping error, using Node.js fallback:', error);
    return performNodeFallbackMapping(courseOutcomes, syllabusTopics, threshold);
  }
}

/**
 * Original Python implementation
 */
async function runPythonMapping(
courseOutcomes,
syllabusTopics,
threshold)
{
  return new Promise((resolve, reject) => {
    // Fix path: __dirname is server/services. Need to go up twice to reach root
    const pythonScript = path.resolve(__dirname, '..', '..', 'ml', 'co_topic_mapper.py');

    // Spawn Python process
    const python = spawn('python', [pythonScript]);

    let outputData = '';
    let errorData = '';

    // Send input data to Python script
    const inputData = JSON.stringify({
      courseOutcomes,
      syllabusTopics,
      threshold
    });

    python.stdin.write(inputData);
    python.stdin.end();

    // Collect output
    python.stdout.on('data', (data) => {
      outputData += data.toString();
    });

    python.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    // Handle completion
    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`ML mapping failed: ${errorData}`));
        return;
      }

      try {
        const result = JSON.parse(outputData);
        resolve(result);
      } catch (error) {
        reject(new Error(`Failed to parse ML output: ${error.message}`));
      }
    });

    python.on('error', (error) => {
      reject(new Error(`Failed to start ML service: ${error.message}`));
    });
  });
}

/**
 * Node.js Fallback: Keyword-based basic semantic matching
 */
function performNodeFallbackMapping(
courseOutcomes,
syllabusTopics,
threshold)
{
  const coMappings = {};
  const stopWords = new Set(['the', 'and', 'a', 'of', 'to', 'in', 'is', 'for', 'with', 'on', 'at', 'by', 'an', 'be', 'as']);

  courseOutcomes.forEach((co) => {
    const coId = co.id.toString();
    coMappings[coId] = [];

    const coLower = co.text.toLowerCase();
    const coWords = coLower.split(/[\s,.-]+/).filter((w) => w.length > 2 && !stopWords.has(w));

    syllabusTopics.forEach((topic) => {
      const topicLower = topic.topic.toLowerCase();
      const topicWords = topicLower.split(/[\s,.-]+/).filter((w) => w.length > 2 && !stopWords.has(w));

      const intersection = topicWords.filter((w) => coWords.includes(w));
      const partialMatches = topicWords.filter((tw) => coWords.some((cw) => cw.includes(tw) || tw.includes(cw)));
      const categories = ['learning', 'optimization', 'network', 'algorithm', 'model', 'data', 'system', 'design'];
      const sharedCategories = categories.filter((cat) => topicLower.includes(cat) && coLower.includes(cat));

      let similarity = 0;
      if (intersection.length > 0) {
        similarity += intersection.length / Math.max(topicWords.length, 1) * 0.6;
        similarity += 0.2;
      } else if (partialMatches.length > 0) {
        similarity += partialMatches.length / Math.max(topicWords.length, 1) * 0.4;
        similarity += 0.1;
      }
      similarity += sharedCategories.length * 0.1;
      const finalSimilarity = Number(Math.min(similarity, 0.95).toFixed(4));

      if (finalSimilarity >= threshold) {
        coMappings[coId].push({
          topicId: topic.id,
          topicText: topic.topic,
          unit: topic.unit,
          similarity: finalSimilarity
        });
      }
    });

    // Sort by similarity descending
    coMappings[coId].sort((a, b) => b.similarity - a.similarity);
  });

  return {
    coMappings,
    threshold,
    totalTopics: syllabusTopics.length,
    totalCOs: courseOutcomes.length
  };
}

/**
 * Get similarity score between a topic and a CO
 */
export async function getTopicCOSimilarity(
topic,
coText)
{
  const result = await mapTopicsToCOs(
    [{ id: 1, text: coText }],
    [{ id: 1, unit: '', topic }],
    0
  );

  if (result.coMappings["1"] && result.coMappings["1"][0]) {
    return result.coMappings["1"][0].similarity;
  }

  return 0;
}

/**
 * Check if Python ML dependencies are installed
 */
export async function checkMLDependencies() {
  return new Promise((resolve) => {
    // First check if python is even available
    const python = spawn('python', ['--version']);

    python.on('error', () => {
      resolve(false);
    });

    python.on('close', (code) => {
      if (code !== 0) {
        resolve(false);
        return;
      }

      // If python exists, check for libraries - including sentence_transformers
      const checkLibs = spawn('python', ['-c', 'import sentence_transformers, numpy']);
      checkLibs.on('close', (libCode) => resolve(libCode === 0));
      checkLibs.on('error', () => resolve(false));
    });
  });
}