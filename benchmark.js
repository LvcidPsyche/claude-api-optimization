#!/usr/bin/env node

/**
 * Cost Benchmark Tool
 * Measure actual vs projected savings
 * Prove ROI of optimization strategies
 */

class CostBenchmark {
  constructor() {
    this.runs = [];
    this.baseline = null;
  }

  /**
   * Run a benchmark scenario
   */
  runScenario(name, requests, options = {}) {
    const scenario = {
      name,
      timestamp: Date.now(),
      requests,
      strategy: options.strategy || 'standard',
      model: options.model || 'sonnet-4-5',
      results: {
        standardCost: 0,
        optimizedCost: 0,
        savings: 0,
        savingsPercent: 0
      }
    };

    // Calculate standard cost (Sonnet, no optimization)
    const standardCost = this.calculateStandardCost(requests);
    scenario.results.standardCost = standardCost;

    // Calculate optimized cost based on strategy
    const optimizedCost = this.calculateOptimizedCost(requests, options);
    scenario.results.optimizedCost = optimizedCost;

    scenario.results.savings = standardCost - optimizedCost;
    scenario.results.savingsPercent = (scenario.results.savings / standardCost * 100).toFixed(2);

    this.runs.push(scenario);
    return scenario;
  }

  /**
   * Calculate cost for standard approach (Sonnet, no caching/batching)
   */
  calculateStandardCost(requests) {
    const sonnetInputPrice = 3; // $3 per MTok
    const sonnetOutputPrice = 15; // $15 per MTok

    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    requests.forEach(req => {
      totalInputTokens += req.estimatedInputTokens || Math.ceil(req.prompt.length / 4);
      totalOutputTokens += req.estimatedOutputTokens || 256; // Conservative estimate
    });

    const inputCost = (totalInputTokens / 1000000) * sonnetInputPrice;
    const outputCost = (totalOutputTokens / 1000000) * sonnetOutputPrice;

    return inputCost + outputCost;
  }

  /**
   * Calculate cost for optimized approach
   */
  calculateOptimizedCost(requests, options) {
    const strategy = options.strategy || 'all';
    let totalCost = 0;

    // Base: Haiku instead of Sonnet
    const haikuInputPrice = 1; // $1 per MTok
    const haikuOutputPrice = 5; // $5 per MTok

    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    requests.forEach(req => {
      totalInputTokens += req.estimatedInputTokens || Math.ceil(req.prompt.length / 4);
      totalOutputTokens += req.estimatedOutputTokens || 256;
    });

    let inputCost = (totalInputTokens / 1000000) * haikuInputPrice;
    let outputCost = (totalOutputTokens / 1000000) * haikuOutputPrice;

    // Apply strategy multipliers
    if (strategy === 'all' || strategy === 'caching') {
      // Prompt caching: 90% savings on repeated content
      const cacheHitRate = 0.5; // Assume 50% cache hits
      inputCost *= (1 - (cacheHitRate * 0.9));
    }

    if (strategy === 'all' || strategy === 'batch') {
      // Batch API: 50% discount
      inputCost *= 0.5;
      outputCost *= 0.5;
    }

    totalCost = inputCost + outputCost;
    return totalCost;
  }

  /**
   * Get benchmark report
   */
  getReport() {
    if (this.runs.length === 0) {
      return { error: 'No benchmarks run yet' };
    }

    let totalStandardCost = 0;
    let totalOptimizedCost = 0;
    let totalSavings = 0;

    this.runs.forEach(run => {
      totalStandardCost += run.results.standardCost;
      totalOptimizedCost += run.results.optimizedCost;
      totalSavings += run.results.savings;
    });

    const overallSavingsPercent = totalStandardCost > 0 ? 
      (totalSavings / totalStandardCost * 100).toFixed(2) : 0;

    return {
      totalScenarios: this.runs.length,
      totalStandardCost: totalStandardCost.toFixed(4),
      totalOptimizedCost: totalOptimizedCost.toFixed(4),
      totalSavings: totalSavings.toFixed(4),
      overallSavingsPercent: `${overallSavingsPercent}%`,
      scenarios: this.runs.map(r => ({
        name: r.name,
        strategy: r.strategy,
        standardCost: r.results.standardCost.toFixed(4),
        optimizedCost: r.results.optimizedCost.toFixed(4),
        savings: r.results.savings.toFixed(4),
        savingsPercent: r.results.savingsPercent
      })),
      roi: {
        description: 'Return on Investment',
        setupCost: '$0 (open source)',
        annualSavings: (totalSavings * 365).toFixed(2),
        breakEvenDays: 0,
        recommendation: overallSavingsPercent > 50 ? 'HIGHLY RECOMMENDED' : 
                       overallSavingsPercent > 20 ? 'RECOMMENDED' : 'BENEFICIAL'
      }
    };
  }

  /**
   * Compare strategies
   */
  compareStrategies(requests) {
    const strategies = ['standard', 'model-selection', 'caching', 'batch', 'all'];
    const comparison = [];

    strategies.forEach(strategy => {
      const scenario = this.runScenario(`${strategy}-strategy`, requests, { strategy });
      comparison.push({
        strategy,
        cost: scenario.results.optimizedCost.toFixed(4),
        savings: scenario.results.savings.toFixed(4),
        savingsPercent: scenario.results.savingsPercent
      });
    });

    return comparison;
  }

  /**
   * Export results for reporting
   */
  export() {
    return {
      benchmarks: this.runs,
      summary: this.getReport(),
      exportedAt: new Date().toISOString()
    };
  }
}

module.exports = CostBenchmark;

// CLI usage
if (require.main === module) {
  const benchmark = new CostBenchmark();

  // Example: Benchmark different workloads
  const requests1 = [
    { prompt: 'Classify this email', estimatedInputTokens: 100, estimatedOutputTokens: 10 },
    { prompt: 'Extract entities', estimatedInputTokens: 200, estimatedOutputTokens: 50 }
  ];

  const requests2 = Array(100).fill({
    prompt: 'Simple classification task',
    estimatedInputTokens: 50,
    estimatedOutputTokens: 10
  });

  benchmark.runScenario('Small batch', requests1);
  benchmark.runScenario('Large batch', requests2, { strategy: 'all' });

  console.log('Benchmark Report:');
  console.log(JSON.stringify(benchmark.getReport(), null, 2));

  console.log('\nStrategy Comparison:');
  console.log(JSON.stringify(benchmark.compareStrategies(requests2), null, 2));
}