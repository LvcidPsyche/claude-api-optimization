#!/usr/bin/env node
/**
 * Benchmark - Measure actual vs projected cost savings
 * Calculate ROI for optimization strategies
 */

class CostBenchmark {
  constructor() {
    this.runs = [];
  }

  // Run benchmark
  runScenario(name, requests, strategy = 'all') {
    const scenario = { name, requests: requests.length, strategy, timestamp: Date.now() };
    
    // Standard cost (Sonnet, no optimization)
    let standardCost = 0;
    requests.forEach(r => {
      const tokens = r.tokens || 200;
      standardCost += (tokens / 1e6) * 3; // Sonnet: $3/MTok input
    });
    
    // Optimized cost
    let optimizedCost = standardCost;
    if (strategy === 'all' || strategy === 'model') optimizedCost *= 0.33; // Haiku: 1/3 cost
    if (strategy === 'all' || strategy === 'caching') optimizedCost *= 0.5; // 50% cache hits = ~50% savings
    if (strategy === 'all' || strategy === 'batch') optimizedCost *= 0.5; // 50% batch discount
    
    scenario.results = {
      standard: standardCost.toFixed(4),
      optimized: optimizedCost.toFixed(4),
      savings: (standardCost - optimizedCost).toFixed(4),
      savingsPercent: `${((standardCost - optimizedCost) / standardCost * 100).toFixed(1)}%`
    };
    
    this.runs.push(scenario);
    return scenario;
  }

  // Get report
  getReport() {
    if (this.runs.length === 0) return { error: 'No benchmarks run' };
    
    let totalStandard = 0, totalOptimized = 0;
    const scenarios = this.runs.map(r => {
      totalStandard += parseFloat(r.results.standard);
      totalOptimized += parseFloat(r.results.optimized);
      return {
        name: r.name,
        strategy: r.strategy,
        ...r.results
      };
    });
    
    const totalSavings = totalStandard - totalOptimized;
    const savingsPercent = (totalSavings / totalStandard * 100).toFixed(1);
    
    return {
      scenarios,
      summary: {
        totalStandard: totalStandard.toFixed(4),
        totalOptimized: totalOptimized.toFixed(4),
        totalSavings: totalSavings.toFixed(4),
        savingsPercent: `${savingsPercent}%`
      },
      roi: {
        breakEvenDays: 0,
        annualSavings: (totalSavings * 365).toFixed(2),
        recommendation: savingsPercent > 50 ? 'HIGHLY RECOMMENDED' : 'BENEFICIAL'
      }
    };
  }

  // Compare strategies
  compare(requests) {
    const strategies = ['model', 'caching', 'batch', 'all'];
    return strategies.map(s => {
      const r = this.runScenario(`${s}-strategy`, requests, s);
      return { strategy: s, ...r.results };
    });
  }
}

module.exports = CostBenchmark;

// CLI usage
if (require.main === module) {
  const benchmark = new CostBenchmark();
  
  const requests = Array(100).fill({ tokens: 100 });
  
  benchmark.runScenario('Small batch', requests.slice(0, 10));
  benchmark.runScenario('Large batch', requests, 'all');
  
  console.log('Benchmark Report:');
  console.log(JSON.stringify(benchmark.getReport(), null, 2));
}