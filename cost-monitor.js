#!/usr/bin/env node

/**
 * Claude API Cost Monitor
 * Real-time cost tracking and optimization recommendations
 */

class ClaudeCostMonitor {
  constructor() {
    this.costs = {
      'haiku-4-5': { input: 1, output: 5 },
      'sonnet-4-5': { input: 3, output: 15 },
      'opus-4-5': { input: 5, output: 25 }
    };
    
    this.usage = new Map();
  }

  // Track API call
  trackUsage(model, inputTokens, outputTokens, cacheReads = 0) {
    const modelKey = this.normalizeModel(model);
    const cost = this.calculateCost(modelKey, inputTokens, outputTokens, cacheReads);
    
    if (!this.usage.has(modelKey)) {
      this.usage.set(modelKey, {
        calls: 0,
        inputTokens: 0,
        outputTokens: 0,
        cacheReads: 0,
        totalCost: 0
      });
    }
    
    const stats = this.usage.get(modelKey);
    stats.calls++;
    stats.inputTokens += inputTokens;
    stats.outputTokens += outputTokens;
    stats.cacheReads += cacheReads;
    stats.totalCost += cost;
    
    return cost;
  }

  // Calculate cost for a request
  calculateCost(model, inputTokens, outputTokens, cacheReads = 0) {
    const pricing = this.costs[model];
    if (!pricing) return 0;
    
    const inputCost = ((inputTokens - cacheReads) / 1000000) * pricing.input;
    const cacheReadCost = (cacheReads / 1000000) * pricing.input * 0.1; // 90% discount
    const outputCost = (outputTokens / 1000000) * pricing.output;
    
    return inputCost + cacheReadCost + outputCost;
  }

  // Suggest model optimization
  suggestOptimization(prompt, expectedComplexity = 'medium') {
    const promptLength = prompt.length;
    
    // Simple heuristics for model selection
    if (expectedComplexity === 'low' || promptLength < 500) {
      return {
        model: 'haiku-4-5',
        reason: 'Simple task - Haiku provides 90% of Sonnet performance at 1/3 cost'
      };
    }
    
    if (expectedComplexity === 'high' || promptLength > 2000) {
      return {
        model: 'sonnet-4-5',
        reason: 'Complex task - Sonnet recommended for quality'
      };
    }
    
    return {
      model: 'haiku-4-5',
      reason: 'Default to Haiku - upgrade only if quality insufficient'
    };
  }

  // Generate cost report
  generateReport() {
    let totalCost = 0;
    let totalCalls = 0;
    const report = { models: {}, summary: {} };
    
    for (const [model, stats] of this.usage.entries()) {
      totalCost += stats.totalCost;
      totalCalls += stats.calls;
      
      const avgCostPerCall = stats.totalCost / stats.calls;
      const cacheEfficiency = stats.cacheReads / (stats.inputTokens + stats.cacheReads);
      
      report.models[model] = {
        ...stats,
        avgCostPerCall: avgCostPerCall.toFixed(4),
        cacheEfficiency: (cacheEfficiency * 100).toFixed(1) + '%'
      };
    }
    
    report.summary = {
      totalCost: totalCost.toFixed(4),
      totalCalls,
      avgCostPerCall: (totalCost / totalCalls).toFixed(4)
    };
    
    return report;
  }

  // Identify optimization opportunities
  getOptimizations() {
    const report = this.generateReport();
    const optimizations = [];
    
    // Check for expensive models on simple tasks
    if (report.models['sonnet-4-5']?.calls > 0) {
      optimizations.push({
        type: 'model-downgrade',
        message: `Consider testing Haiku for some Sonnet tasks - potential 67% cost reduction`,
        impact: 'High'
      });
    }
    
    // Check cache efficiency
    for (const [model, stats] of Object.entries(report.models)) {
      const cacheEff = parseFloat(stats.cacheEfficiency);
      if (cacheEff < 50) {
        optimizations.push({
          type: 'caching',
          message: `${model} cache efficiency at ${stats.cacheEfficiency} - improve prompt caching`,
          impact: 'High'
        });
      }
    }
    
    return optimizations;
  }

  normalizeModel(model) {
    if (model.includes('haiku')) return 'haiku-4-5';
    if (model.includes('sonnet')) return 'sonnet-4-5';
    if (model.includes('opus')) return 'opus-4-5';
    return 'sonnet-4-5'; // default
  }
}

module.exports = ClaudeCostMonitor;

// CLI usage
if (require.main === module) {
  const monitor = new ClaudeCostMonitor();
  
  // Example usage
  monitor.trackUsage('sonnet-4-5', 1000, 500, 800);
  monitor.trackUsage('haiku-4-5', 500, 200, 0);
  
  console.log('Cost Report:', JSON.stringify(monitor.generateReport(), null, 2));
  console.log('Optimizations:', monitor.getOptimizations());
}