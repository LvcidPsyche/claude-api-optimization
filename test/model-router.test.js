#!/usr/bin/env node

/**
 * Test Suite for Model Router
 */

const ModelRouter = require('../model-router');

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

function testSimpleTaskRouting() {
  const router = new ModelRouter();

  const simple = [
    'Extract names from this list',
    'Classify: spam or not spam',
    'Translate hello to Spanish',
    'Format this as JSON'
  ];

  simple.forEach(prompt => {
    const result = router.selectModel(prompt);
    assert(
      result.model === 'anthropic/claude-haiku-4-5',
      `Simple task routed to Haiku: "${prompt.substring(0, 30)}..."`
    );
  });
}

function testComplexTaskRouting() {
  const router = new ModelRouter();

  const complex = [
    'Analyze this codebase for architecture issues',
    'Design a distributed system for real-time data processing',
    'Generate a comprehensive business strategy document',
    'Refactor this legacy code to use modern patterns'
  ];

  complex.forEach(prompt => {
    const result = router.selectModel(prompt);
    assert(
      result.model === 'anthropic/claude-sonnet-4-5',
      `Complex task routed to Sonnet: "${prompt.substring(0, 30)}..."`
    );
  });
}

function testSavingsCalculation() {
  const router = new ModelRouter();

  const simpleResult = router.selectModel('Classify this');
  const complexResult = router.selectModel('Design a system');

  assert(
    simpleResult.estimatedCostSavings.percentage > 0,
    'Simple tasks show positive savings'
  );
  assert(
    complexResult.estimatedCostSavings.percentage === 0,
    'Complex tasks show no additional savings'
  );
}

function testBatchRouting() {
  const router = new ModelRouter();

  const prompts = [
    'Classify: spam',
    'Analyze code',
    'Extract names',
    'Design system'
  ];

  const results = router.batchRoute(prompts);

  assert(results.length === 4, 'Batch routing returns correct count');
  assert(results[0].complexity === 'simple', 'Classification detected as simple');
  assert(results[1].complexity === 'complex', 'Analysis detected as complex');
}

function testRoutingStats() {
  const router = new ModelRouter();

  const prompts = Array(10).fill('Classify this')
    .concat(Array(3).fill('Design system'));

  const results = router.batchRoute(prompts);
  const stats = router.generateStats(results);

  assert(stats.distribution.simple === 10, 'Simple task distribution tracked');
  assert(stats.distribution.complex === 3, 'Complex task distribution tracked');
  assert(stats.averageSavings > 0, 'Average savings calculated');
}

function testComplexityClassification() {
  const router = new ModelRouter();

  const verySimple = 'yes';
  const simple = 'Extract names';
  const medium = 'This is a somewhat longer prompt that requires some thought but not deep analysis';
  const complex = 'Design a comprehensive distributed system architecture that handles millions of requests per second with fault tolerance and includes detailed specifications';

  assert(
    router.classifyComplexity(verySimple) === 'simple',
    'Very short prompt classified as simple'
  );
  assert(
    router.classifyComplexity(simple) === 'simple',
    'Short extraction prompt classified as simple'
  );
  assert(
    router.classifyComplexity(medium) === 'medium',
    'Medium length prompt classified as medium'
  );
  assert(
    router.classifyComplexity(complex) === 'complex',
    'Long complex prompt classified as complex'
  );
}

function testReasoningContext() {
  const router = new ModelRouter();

  const withoutContext = router.selectModel('Analyze code', { requiresReasoning: false });
  const withContext = router.selectModel('Analyze code', { requiresReasoning: true });

  assert(
    withContext.complexity === 'complex' || withContext.model.includes('sonnet'),
    'Reasoning requirement escalates complexity'
  );
}

// Run all tests
console.log('🧪 Running Model Router Tests\n');

try {
  testSimpleTaskRouting();
  testComplexTaskRouting();
  testSavingsCalculation();
  testBatchRouting();
  testRoutingStats();
  testComplexityClassification();
  testReasoningContext();

  console.log('\n✅ All tests passed!');
} catch (error) {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
}