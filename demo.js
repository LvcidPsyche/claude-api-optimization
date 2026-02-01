#!/usr/bin/env node

/**
 * Claude API Optimization Demo
 * Shows potential cost savings with different optimization strategies
 */

const ClaudeCostMonitor = require('./cost-monitor');
const ModelRouter = require('./model-router');
const PromptCache = require('./prompt-cache');

class OptimizationDemo {
  constructor() {
    this.monitor = new ClaudeCostMonitor();
    this.router = new ModelRouter();
    this.cache = new PromptCache();
  }

  // Simulate API usage scenarios
  async runDemo() {
    console.log('🚀 Claude API Cost Optimization Demo\n');

    // Scenario 1: Model Selection Optimization
    console.log('📊 Scenario 1: Smart Model Selection');
    const testTasks = [
      'Extract names from this email',
      'Classify this message as spam or not spam',
      'Write a comprehensive technical architecture document',
      'Analyze the economic implications of climate policy',
      'What is 2+2?',
      'Translate "hello world" to French'
    ];

    const routingResults = this.router.batchRoute(testTasks);
    let totalSavings = 0;
    
    routingResults.forEach((result, i) => {
      console.log(`  Task: ${testTasks[i]}`);
      console.log(`  → Model: ${result.model.split('/')[1]}`);
      console.log(`  → Savings: ${result.estimatedCostSavings.description}\n`);
      if (result.estimatedCostSavings.percentage > 0) {
        totalSavings += result.estimatedCostSavings.percentage;
      }
    });

    const avgSavings = Math.round(totalSavings / testTasks.length);
    console.log(`  Average model selection savings: ${avgSavings}%\n`);

    // Scenario 2: Prompt Caching Analysis
    console.log('🗄️  Scenario 2: Prompt Caching Potential');
    const systemPrompt = 'You are an expert software engineer with deep knowledge of system architecture, security, and performance optimization. When reviewing code, consider scalability, maintainability, and best practices.';
    
    const messages = [
      { role: 'user', content: '[Large codebase context - imagine 5000 characters of code documentation and structure]' },
      { role: 'assistant', content: 'I understand the codebase structure.' },
      { role: 'user', content: 'Please review this function for potential issues' }
    ];

    const cacheAnalysis = this.cache.analyzeCachingPotential(messages, systemPrompt);
    console.log(`  Cacheable tokens: ${cacheAnalysis.cacheableTokens}`);
    console.log(`  Potential savings: ${cacheAnalysis.potentialSavings}`);
    console.log(`  Break-even: ${cacheAnalysis.breakEvenPoint}\n`);

    // Scenario 3: Combined Optimization
    console.log('💰 Scenario 3: Combined Optimization Impact');
    console.log('  Model selection: 67% savings on simple tasks');
    console.log('  Prompt caching: 90% savings on repeated content');
    console.log('  Batch processing: 50% savings on async workloads');
    console.log('  Combined potential: Up to 95% cost reduction!\n');

    // Scenario 4: Cost Monitoring
    console.log('📈 Scenario 4: Cost Monitoring');
    // Simulate some API calls
    this.monitor.trackUsage('haiku-4-5', 500, 200, 400);
    this.monitor.trackUsage('sonnet-4-5', 1000, 600, 800);
    this.monitor.trackUsage('haiku-4-5', 300, 150, 200);

    const report = this.monitor.generateReport();
    console.log('  Current usage report:');
    Object.entries(report.models).forEach(([model, stats]) => {
      console.log(`    ${model}: ${stats.calls} calls, $${stats.totalCost} total cost`);
      console.log(`      Cache efficiency: ${stats.cacheEfficiency}`);
    });

    const optimizations = this.monitor.getOptimizations();
    if (optimizations.length > 0) {
      console.log('\n  Optimization recommendations:');
      optimizations.forEach(opt => {
        console.log(`    • ${opt.message} (${opt.impact} impact)`);
      });
    }

    console.log('\n✨ Demo complete! Start optimizing your Claude API costs today!');
  }
}

// Run demo if called directly
if (require.main === module) {
  const demo = new OptimizationDemo();
  demo.runDemo().catch(console.error);
}

module.exports = OptimizationDemo;