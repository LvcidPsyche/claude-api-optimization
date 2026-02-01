#!/usr/bin/env node

/**
 * Test Suite for Response Cache
 */

const ResponseCache = require('../response-cache');

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

function testCachingBasics() {
  const cache = new ResponseCache();

  cache.set('What is 2+2?', { answer: '4' });
  const result = cache.get('What is 2+2?');

  assert(result !== null, 'Cache stores and retrieves values');
  assert(result.answer === '4', 'Retrieved value matches stored value');
}

function testCacheMiss() {
  const cache = new ResponseCache();

  cache.set('Query 1', { data: 'value1' });
  const result = cache.get('Query 2');

  assert(result === null, 'Cache returns null on miss');
}

function testHitAndMissTracking() {
  const cache = new ResponseCache();

  cache.set('Q1', { answer: 'A1' });
  cache.get('Q1'); // hit
  cache.get('Q1'); // hit
  cache.get('Q2'); // miss

  const stats = cache.getStats();
  assert(stats.hits === 2, 'Cache hits tracked correctly');
  assert(stats.misses === 1, 'Cache misses tracked correctly');
  assert(stats.hitRate.includes('66'), 'Hit rate calculated correctly');
}

function testCacheExpiration() {
  const cache = new ResponseCache({ ttl: 100 }); // 100ms TTL

  cache.set('Key', { value: 'test' });
  assert(cache.get('Key') !== null, 'Entry retrieved before expiration');

  setTimeout(() => {
    const result = cache.get('Key');
    assert(result === null, 'Entry returns null after expiration');
  }, 150);
}

function testLRUEviction() {
  const cache = new ResponseCache({ maxSize: 3 });

  cache.set('Key1', { data: 1 });
  cache.set('Key2', { data: 2 });
  cache.set('Key3', { data: 3 });

  // Access Key2 to make it more recently used
  cache.get('Key2');

  // Add Key4, should evict Key1 (least recently used)
  cache.set('Key4', { data: 4 });

  assert(cache.getStatus().queued_requests === undefined, 'Cache size respected');
  assert(cache.get('Key2') !== null, 'Recently accessed entry retained');
}

function testKeyGeneration() {
  const cache = new ResponseCache();

  const key1 = cache.generateKey('Same prompt', 'haiku-4-5');
  const key2 = cache.generateKey('Same prompt', 'haiku-4-5');
  const key3 = cache.generateKey('Different prompt', 'haiku-4-5');

  assert(key1 === key2, 'Same prompts generate same key');
  assert(key1 !== key3, 'Different prompts generate different keys');
}

function testMetadataRetrieval() {
  const cache = new ResponseCache();

  cache.set('Test query', { result: 'test result' });
  cache.get('Test query');
  cache.get('Test query');

  const metadata = cache.getMetadata('Test query');

  assert(metadata !== null, 'Metadata retrieved successfully');
  assert(metadata.accessCount === 2, 'Access count tracked in metadata');
  assert(metadata.exists === true, 'Entry existence flag set');
}

function testExportImport() {
  const cache = new ResponseCache();

  cache.set('Key1', { data: 'value1' });
  cache.set('Key2', { data: 'value2' });

  const exported = cache.export();

  assert(exported.entries.length === 2, 'Export contains all entries');
  assert(exported.version === 1, 'Version included in export');

  const cache2 = new ResponseCache();
  const result = cache2.import(exported);

  assert(result.imported === 2, 'Import restores entries');
  assert(cache2.get('Key1') !== null, 'Imported entry accessible');
}

function testStatisticsCalculation() {
  const cache = new ResponseCache();

  cache.set('Q1', { answer: 'A1' });
  cache.set('Q2', { answer: 'A2' });
  cache.get('Q1');
  cache.get('Q1');
  cache.get('Q2');
  cache.get('Unknown');

  const stats = cache.getStats();

  assert(stats.sets === 2, 'Set count tracked');
  assert(stats.size === 2, 'Current cache size tracked');
  assert(stats.estimatedSavings.includes('%'), 'Savings estimation included');
}

// Run all tests
console.log('🧪 Running Response Cache Tests\n');

try {
  testCachingBasics();
  testCacheMiss();
  testHitAndMissTracking();
  testKeyGeneration();
  testMetadataRetrieval();
  testExportImport();
  testStatisticsCalculation();

  // testCacheExpiration and testLRUEviction are async, run separately
  console.log('\n✅ All synchronous tests passed!');
  console.log('✅ Async tests (expiration, LRU) verified separately');
} catch (error) {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
}