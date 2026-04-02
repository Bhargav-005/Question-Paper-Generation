// server/tests/questionGeneration.test.ts

import { questionService } from './services/questionService.js';

async function testQuestionGeneration() {
  console.log('🧪 Testing AI Question Generation\n');

  const testRequirement = {
    unit: 'Unit I',
    part: 'A',
    bloomLevel: 'L2',
    topic: 'Lexical Analysis',
    context: 'Recognition of tokens using finite automata in compiler design',
    marks: 2,
    count: 3,
    coId: 'CO1'
  };

  try {
    console.log('📝 Test Requirement:');
    console.log(JSON.stringify(testRequirement, null, 2));
    console.log('\n⏳ Generating questions...\n');

    const questions = await questionService.generateForRequirement(testRequirement);

    console.log(`✅ Generated ${questions.length} questions:\n`);

    questions.forEach((q, idx) => {
      console.log(`${idx + 1}. ${q.text}`);
      console.log(`   📊 Bloom: ${q.bloomLevel} | Quality: ${q.qualityScore}% | Marks: ${q.marks}`);
      console.log(`   🏷️  CO: ${q.coId} | Topic: ${q.topic}`);
      console.log('');
    });

    console.log('✅ Test passed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testQuestionGeneration();