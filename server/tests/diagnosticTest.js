// server/tests/diagnosticTest.ts

import * as dotenv from 'dotenv';
dotenv.config();

console.log('\n🔍 AI Service Diagnostic Test\n');
console.log('='.repeat(50));
console.log('\n📋 Environment Configuration:');
console.log('  AI_SERVICE:', process.env.AI_SERVICE || 'NOT SET');
console.log('  OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 15)}...${process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 6)}` : 'NOT SET');
console.log('  AI_TEMPERATURE:', process.env.AI_TEMPERATURE || '0.7 (default)');
console.log('  AI_MAX_TOKENS:', process.env.AI_MAX_TOKENS || '2048 (default)');

console.log('\n🧪 Testing OpenAI Connection...\n');

import OpenAI from 'openai';

async function testOpenAI() {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    console.log('✓ OpenAI client initialized');
    console.log('⏳ Sending test request to OpenAI GPT-4...\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant. Respond with valid JSON.'
      },
      {
        role: 'user',
        content: 'Generate 1 simple examination question about "Variables in Programming". Return JSON: {"questions": [{"text": "question here", "bloomLevel": "L1", "marks": 2, "expectedAnswerLength": "short", "keyConcepts": ["variables"]}]}'
      }],

      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    console.log('✅ OpenAI API Response Received!\n');
    console.log('Response:');
    console.log(completion.choices[0].message.content);

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    if (result.questions && result.questions.length > 0) {
      console.log('\n✅ Successfully generated question:');
      console.log(`   "${result.questions[0].text}"`);
      console.log('\n🎉 OpenAI integration is working correctly!\n');
    }

  } catch (error) {
    console.error('\n❌ OpenAI API Error:\n');
    console.error('Error Type:', error.constructor.name);
    console.error('Error Message:', error.message);

    if (error.status) {
      console.error('HTTP Status:', error.status);
    }

    if (error.code) {
      console.error('Error Code:', error.code);
    }

    console.log('\n💡 Common Solutions:');
    console.log('  1. Verify API key is correct and active');
    console.log('  2. Check if you have credits in your OpenAI account');
    console.log('  3. Ensure you have access to GPT-4 model');
    console.log('  4. Check your internet connection');
    console.log('\n');

    process.exit(1);
  }
}

testOpenAI();