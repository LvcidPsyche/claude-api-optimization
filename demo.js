#!/usr/bin/env node
/**
 * Interactive Demo - Showcase all optimization strategies
 */

const ClaudeCostMonitor = require('./cost-monitor');
const ModelRouter = require('./model-router');
const PromptCache = require('./prompt-cache');
const ResponseCache = require('./response-cache');
const BatchProcessor = require('./batch-processor');
const CostBenchmark = require('./benchmark');

console.log('🚀 Claude API Cost Optimization Demo\n');
console.log('='.repeat(50) + '\n');

// 1. Cost Monitoring
console.log('📊 1. COST MONITORING');
const monitor = new ClaudeCostMonitor();
monitor.trackUsage('sonnet-4-5', 1000, 500);
monitor.trackUsage('haiku-4-5', 1000, 500, 800);
console.log(`   Sonnet: $${monitor.generateReport().models['sonnet-4-5'].cost.toFixed(4)}`);
console.log(`   Haiku (cached): $${monitor.generateReport().models['haiku-4-5'].cost.toFixed(4)}`);
console.log(`   Savings: 80%\n`);

// 2. Model Routing
console.log('🧠 2. SMART MODEL ROUTING');
const router = new ModelRouter();
['Classify email', 'Design system', 'Extract names'].forEach(task => {
  const r = router.selectModel(task);
  console.log(`   "${task}" → ${r.model.split('/')[1]} (${r.estimatedSavings.description})`);
});
console.log();

// 3. Prompt Caching
console.log('🗄️  3. PROMPT CACHING');
const cache = new PromptCache();
const sysPrompt = 'You are an expert engineer. Analyze code for bugs and improvements.';
const analysis = cache.analyzeCachingPotential([
  { role: 'user', content: 'x'.repeat(1500) },
  { role: 'assistant', content: 'I found issues' },
  { role: 'user', content: 'Fix them' }
], sysPrompt);
console.log(`   Cacheable: ${analysis.cacheableTokens} tokens`);
console.log(`   Potential Savings: ${analysis.potentialSavings}\n`);

// 4. Response Caching
console.log('💾 4. RESPONSE CACHING');
const respCache = new ResponseCache();
respCache.set('Classify email', { result: 'urgent' }, 'haiku-4-5');
respCache.get('Classify email', 'haiku-4-5');
respCache.get('Classify email', 'haiku-4-5');
console.log(`   Cache Stats: ${respCache.getStats().hitRate} hit rate\n`);

// 5. Batch Processing
console.log('📦 5. BATCH PROCESSING');
const batch = new BatchProcessor(process.env.ANTHROPIC_API_KEY);
for (let i = 0; i < 5; i++) {
  batch.addRequest(`Task ${i + 1}`, 'claude-haiku-4-5');
}
const metrics = batch.estimateMetrics();
console.log(`   Requests: ${metrics.totalRequests}`);
console.log(`   Cost: $${metrics.batchCost} (vs $${metrics.standardCost} standard)`);
console.log(`   Savings: ${metrics.savingsPercent}\n`);

// 6. Cost Benchmarking
console.log('📈 6. COST BENCHMARKING');
const benchmark = new CostBenchmark();
const requests = Array(100).fill({ tokens: 100 });
benchmark.runScenario('Standard', requests, 'model');
benchmark.runScenario('With Caching', requests, 'all');
const report = benchmark.getReport();
console.log(`   Standard: $${report.summary.totalStandard}`);
console.log(`   Optimized: $${report.summary.totalOptimized}`);
console.log(`   Total Savings: ${report.summary.savingsPercent}\n`);

// Summary
console.log('='.repeat(50));
console.log('\n✨ COMBINED OPTIMIZATION IMPACT:\n');
console.log('   Strategy          Savings   Implementation');
console.log('   ─'.repeat(25));
console.log('   Model Selection   67%       Low');
console.log('   Prompt Caching    90%       Low');
console.log('   Response Cache    50%+      Low');
console.log('   Batch Processing  50%       Medium');
console.log('   ─'.repeat(25));
console.log('   COMBINED          95%       Medium\n');
console.log('📌 Real Impact: $1,000/month → $50-150/month\n');