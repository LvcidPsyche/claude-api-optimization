#!/usr/bin/env node

/**
 * Test Suite for Cost Monitor
 */

const ClaudeCostMonitor = require('../cost-monitor');

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

function testCostCalculation() {
  const monitor = new ClaudeCostMonitor();

  // Test Haiku costs
  const haikuCost = monitor.calculateCost('haiku-4-5', 1000, 500, 0);
  assert(haikuCost > 0, 'Haiku cost calculation returns positive value');
  assert(haikuCost < 0.01, 'Haiku cost for small request is under $0.01');

  // Test cache savings
  const withCache = monitor.calculateCost('haiku-4-5', 100, 500, 900);
  const withoutCache = monitor.calculateCost('haiku-4-5', 1000, 500, 0);
  assert(withCache < withoutCache, 'Cached request costs less than non-cached');
}

function testUsageTracking() {
  const monitor = new ClaudeCostMonitor();

  const cost1 = monitor.trackUsage('haiku-4-5', 1000, 500, 0);
  const cost2 = monitor.trackUsage('sonnet-4-5', 2000, 1000, 0);

  const report = monitor.generateReport();
  assert(report.models['haiku-4-5'].calls === 1, 'Haiku usage tracked');
  assert(report.models['sonnet-4-5'].calls === 1, 'Sonnet usage tracked');
  assert(report.summary.totalCalls === 2, 'Total calls counted correctly');
}

function testModelSuggestions() {
  const monitor = new ClaudeCostMonitor();
  const monitor2 = new ClaudeCostMonitor();

  monitor.trackUsage('sonnet-4-5', 1000, 500, 0);
  monitor.trackUsage('sonnet-4-5', 1200, 600, 0);
  monitor.trackUsage('sonnet-4-5', 900, 400, 0);

  const optimizations = monitor.getOptimizations();
  assert(optimizations.length > 0, 'Optimization recommendations generated');
  assert(
    optimizations.some(o => o.type === 'model-downgrade'),
    'Model downgrade recommendation included'
  );
}

function testCacheEfficiency() {
  const monitor = new ClaudeCostMonitor();

  monitor.trackUsage('haiku-4-5', 100, 500, 900);
  const report = monitor.generateReport();

  assert(
    report.models['haiku-4-5'].cacheEfficiency.includes('%'),
    'Cache efficiency percentage reported'
  );
}

function testReportGeneration() {
  const monitor = new ClaudeCostMonitor();

  monitor.trackUsage('haiku-4-5', 1000, 500);
  monitor.trackUsage('sonnet-4-5', 2000, 1000);

  const report = monitor.generateReport();

  assert(report.summary.totalCost !== undefined, 'Total cost in report');
  assert(report.summary.totalCalls === 2, 'Total calls counted');
  assert(report.models['haiku-4-5'] !== undefined, 'Haiku data in report');
  assert(report.models['sonnet-4-5'] !== undefined, 'Sonnet data in report');
}

function testNormalization() {
  const monitor = new ClaudeCostMonitor();

  assert(monitor.normalizeModel('claude-haiku-4-5') === 'haiku-4-5', 'Haiku model normalization');
  assert(monitor.normalizeModel('claude-sonnet-4-5') === 'sonnet-4-5', 'Sonnet model normalization');
  assert(monitor.normalizeModel('claude-opus-4-5') === 'opus-4-5', 'Opus model normalization');
}

// Run all tests
console.log('🧪 Running Cost Monitor Tests\n');

try {
  testCostCalculation();
  testUsageTracking();
  testModelSuggestions();
  testCacheEfficiency();
  testReportGeneration();
  testNormalization();

  console.log('\n✅ All tests passed!');
} catch (error) {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
}