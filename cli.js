#!/usr/bin/env node
/**
 * Unified CLI - Single command for all optimization operations
 * Usage: node cli.js [monitor|route|cache|batch|benchmark|optimize]
 */

const ClaudeCostMonitor = require('./cost-monitor');
const ModelRouter = require('./model-router');
const PromptCache = require('./prompt-cache');
const ResponseCache = require('./response-cache');
const BatchProcessor = require('./batch-processor');
const CostBenchmark = require('./benchmark');
const OptimizationApplier = require('./apply-optimization');

const commands = {
  monitor: () => {
    console.log('💰 Cost Monitor - Track API usage\n');
    const m = new ClaudeCostMonitor();
    m.trackUsage('haiku-4-5', 1000, 500, 800);
    m.trackUsage('sonnet-4-5', 2000, 1000, 0);
    console.log(JSON.stringify(m.generateReport(), null, 2));
    console.log('\nOptimizations:', m.getOptimizations());
  },

  route: () => {
    console.log('🧠 Model Router - Select optimal model\n');
    const r = new ModelRouter();
    const tasks = ['Classify email', 'Design system', 'Extract names'];
    tasks.forEach(t => {
      const result = r.selectModel(t);
      console.log(`"${t}"\n  Model: ${result.model.split('/')[1]}\n  Savings: ${result.estimatedSavings.description}\n`);
    });
  },

  cache: () => {
    console.log('🗄️  Prompt Cache - Optimize with caching\n');
    const c = new PromptCache();
    const analysis = c.analyzeCachingPotential(
      [{ role: 'user', content: 'x'.repeat(2000) }],
      'System prompt here'
    );
    console.log(JSON.stringify(analysis, null, 2));
  },

  batch: () => {
    console.log('📦 Batch Processor - Submit async requests\n');
    const b = new BatchProcessor(process.env.ANTHROPIC_API_KEY);
    for (let i = 0; i < 3; i++) b.addRequest(`Task ${i + 1}`);
    console.log(JSON.stringify(b.estimateMetrics(), null, 2));
  },

  benchmark: () => {
    console.log('📈 Benchmark - Measure savings\n');
    const bench = new CostBenchmark();
    const reqs = Array(50).fill({ tokens: 100 });
    bench.runScenario('With optimization', reqs, 'all');
    console.log(JSON.stringify(bench.getReport(), null, 2));
  },

  optimize: () => {
    console.log('🚀 Apply Optimization to OpenClaw\n');
    new OptimizationApplier().run();
  },

  help: () => {
    console.log(`
Claude API Cost Optimization CLI

Usage: node cli.js [command]

Commands:
  monitor     - Track API costs and usage
  route       - Show intelligent model selection
  cache       - Analyze caching potential
  batch       - Show batch processing savings
  benchmark   - Run cost benchmarks
  optimize    - Apply optimization to OpenClaw
  help        - Show this help message

Examples:
  node cli.js monitor
  node cli.js route
  node cli.js benchmark
  node cli.js optimize
    `);
  }
};

const cmd = process.argv[2] || 'help';
if (commands[cmd]) {
  commands[cmd]();
} else {
  console.error(`❌ Unknown command: ${cmd}`);
  commands.help();
  process.exit(1);
}