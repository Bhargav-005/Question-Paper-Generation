import axios from "axios";

const ML_BASE_URL = "http://localhost:8001";

export async function mapTopicsToCOs(courseOutcomes, syllabusTopics, threshold = 0.35) {
  const response = await axios.post(`${ML_BASE_URL}/map`, {
    course_outcomes: courseOutcomes,
    syllabus_topics: syllabusTopics,
    threshold: threshold
  });

  return response.data.data;
}

export async function clusterTopics(topics) {
  const response = await axios.post(`${ML_BASE_URL}/cluster`, {
    topics,
    num_clusters: 3
  });

  return response.data.data;
}

export async function validateBloom(question, targetLevel) {
  const response = await axios.post(`${ML_BASE_URL}/validate-bloom`, {
    question,
    target_level: targetLevel
  });

  return response.data.data;
}