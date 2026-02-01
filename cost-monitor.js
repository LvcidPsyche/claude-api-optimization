#!/usr/bin/env node
/**
 * Cost Monitor - Track and optimize Claude API usage
 * Minimal, efficient cost tracking with optimization recommendations
 */

class ClaudeCostMonitor {
  constructor() {
    this.costs = { 'haiku-4-5': [1, 5], 'sonnet-4-5': [3, 15], 'opus-4-5': [5, 25] };
    this.usage = new Map();
  }

  // Calculate cost for API call
  calculateCost(model, inputTokens, outputTokens, cacheReads = 0) {
    const [inp, out] = this.costs[this.normalizeModel(model)] || [3, 15];
    const inputCost = ((inputTokens - cacheReads) / 1e6) * inp;
    const cacheReadCost = (cacheReads / 1e6) * inp * 0.1; // 90% savings
    const outputCost = (outputTokens / 1e6) * out;
    return inputCost + cacheReadCost + outputCost;
  }

  // Track usage
  trackUsage(model, inputTokens, outputTokens, cacheReads = 0) {
    const key = this.normalizeModel(model);
    const cost = this.calculateCost(model, inputTokens, outputTokens, cacheReads);
    
    if (!this.usage.has(key)) {
      this.usage.set(key, { calls: 0, input: 0, output: 0, cache: 0, cost: 0 });
    }
    
    const stats = this.usage.get(key);
    stats.calls++;
    stats.input += inputTokens;
    stats.output += outputTokens;
    stats.cache += cacheReads;
    stats.cost += cost;
    
    return cost;
  }

  // Generate report
  generateReport() {
    let totalCost = 0, totalCalls = 0;
    const models = {};
    
    for (const [model, stats] of this.usage.entries()) {
      totalCost += stats.cost;
      totalCalls += stats.calls;
      
      models[model] = {
        ...stats,
        avgCostPerCall: (stats.cost / stats.calls).toFixed(6),
        cacheEfficiency: ((stats.cache / (stats.input + stats.cache)) * 100 || 0).toFixed(1) + '%'
      };
    }
    
    return {
      models,
      summary: {
        totalCost: totalCost.toFixed(4),
        totalCalls,
        avgCostPerCall: (totalCost / (totalCalls || 1)).toFixed(6)
      }
    };
  }

  // Get optimization recommendations
  getOptimizations() {
    const recs = [];
    const report = this.generateReport();
    
    if (report.models['sonnet-4-5']?.calls > 0) {
      recs.push({
        type: 'model-downgrade',
        message: 'Consider Haiku for simple tasks (67% savings)',
        impact: 'High'
      });
    }
    
    for (const [model, stats] of Object.entries(report.models)) {
      if (parseFloat(stats.cacheEfficiency) < 50) {
        recs.push({
          type: 'caching',
          message: `Improve ${model} caching (current: ${stats.cacheEfficiency})`,
          impact: 'High'
        });
      }
    }
    
    return recs;
  }

  normalizeModel(model) {
    const m = model.toLowerCase();
    if (m.includes('haiku')) return 'haiku-4-5';
    if (m.includes('sonnet')) return 'sonnet-4-5';
    if (m.includes('opus')) return 'opus-4-5';
    return 'sonnet-4-5';
  }
}

module.exports = ClaudeCostMonitor;

// CLI usage
if (require.main === module) {
  const monitor = new ClaudeCostMonitor();
  monitor.trackUsage('haiku-4-5', 1000, 500, 800);
  monitor.trackUsage('sonnet-4-5', 2000, 1000, 0);
  console.log(JSON.stringify(monitor.generateReport(), null, 2));
  console.log('Optimizations:', monitor.getOptimizations());
}