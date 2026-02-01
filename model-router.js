#!/usr/bin/env node

/**
 * Dynamic Model Router for Claude API
 * Automatically selects optimal model based on task complexity
 */

class ModelRouter {
  constructor() {
    // Classification patterns for different complexity levels
    this.patterns = {
      simple: [
        /^(yes|no|true|false)/i,
        /^(classify|categorize|tag|label)/i,
        /^(extract|find|get|list)/i,
        /^(translate|convert|format)/i,
        /^(summarize|tldr)/i,
        /FAQ/i,
        /simple/i
      ],
      complex: [
        /^(analyze|explain|describe|evaluate)/i,
        /^(generate|create|write|compose)/i,
        /^(plan|design|architect)/i,
        /^(refactor|optimize|improve)/i,
        /code/i,
        /algorithm/i,
        /system/i,
        /architecture/i
      ]
    };
    
    this.models = {
      simple: 'anthropic/claude-haiku-4-5',
      medium: 'anthropic/claude-haiku-4-5', // Start with Haiku, escalate if needed
      complex: 'anthropic/claude-sonnet-4-5',
      critical: 'anthropic/claude-opus-4-5'
    };
  }

  // Classify task complexity
  classifyComplexity(prompt, context = {}) {
    const text = prompt.toLowerCase();
    const wordCount = text.split(' ').length;
    
    // Check for simple patterns
    for (const pattern of this.patterns.simple) {
      if (pattern.test(text)) {
        return 'simple';
      }
    }
    
    // Check for complex patterns
    for (const pattern of this.patterns.complex) {
      if (pattern.test(text)) {
        if (wordCount > 100 || context.requiresReasoning) {
          return 'complex';
        }
        return 'medium';
      }
    }
    
    // Length-based classification
    if (wordCount < 20) return 'simple';
    if (wordCount > 200) return 'complex';
    
    return 'medium';
  }

  // Select optimal model
  selectModel(prompt, options = {}) {
    const complexity = this.classifyComplexity(prompt, options);
    const selectedModel = this.models[complexity];
    
    return {
      model: selectedModel,
      complexity,
      reasoning: this.getReasoningForChoice(complexity, prompt),
      estimatedCostSavings: this.calculateSavings(complexity)
    };
  }

  // Get reasoning for model choice
  getReasoningForChoice(complexity, prompt) {
    const reasons = {
      simple: 'Simple task detected - Haiku provides excellent performance at lowest cost',
      medium: 'Medium complexity - Haiku recommended as starting point, can escalate if needed',
      complex: 'Complex task requires Sonnet-level reasoning and capabilities',
      critical: 'Mission-critical task requires highest capability model'
    };
    
    return reasons[complexity];
  }

  // Calculate potential cost savings vs always using Sonnet
  calculateSavings(complexity) {
    const baseCost = 1; // Sonnet as baseline
    const costs = {
      simple: 0.33, // Haiku is ~1/3 cost of Sonnet
      medium: 0.33,
      complex: 1,
      critical: 1.67 // Opus is ~1.67x Sonnet
    };
    
    const actualCost = costs[complexity];
    const savings = ((baseCost - actualCost) / baseCost) * 100;
    
    return {
      percentage: Math.round(savings),
      description: savings > 0 ? `${Math.round(savings)}% savings vs Sonnet` : 
                   savings < 0 ? `${Math.round(Math.abs(savings))}% increase vs Sonnet` :
                   'Same cost as Sonnet'
    };
  }

  // Batch process multiple prompts
  batchRoute(prompts) {
    return prompts.map(prompt => ({
      prompt: prompt.substring(0, 50) + '...',
      ...this.selectModel(prompt)
    }));
  }

  // Generate routing statistics
  generateStats(routingResults) {
    const stats = {
      simple: 0,
      medium: 0,  
      complex: 0,
      critical: 0
    };
    
    let totalSavings = 0;
    
    routingResults.forEach(result => {
      stats[result.complexity]++;
      if (result.estimatedCostSavings.percentage > 0) {
        totalSavings += result.estimatedCostSavings.percentage;
      }
    });
    
    return {
      distribution: stats,
      averageSavings: Math.round(totalSavings / routingResults.length),
      totalRequests: routingResults.length
    };
  }
}

module.exports = ModelRouter;

// CLI usage
if (require.main === module) {
  const router = new ModelRouter();
  
  const testPrompts = [
    "Extract the names from this text",
    "Classify this email as spam or not spam",
    "Write a comprehensive analysis of the economic implications of climate change",
    "Generate a complete software architecture for a distributed system",
    "What is 2+2?",
    "Translate this to French: Hello world"
  ];
  
  console.log('Model Routing Results:\n');
  
  const results = router.batchRoute(testPrompts);
  results.forEach(result => {
    console.log(`Prompt: ${result.prompt}`);
    console.log(`Model: ${result.model}`);
    console.log(`Complexity: ${result.complexity}`);
    console.log(`Savings: ${result.estimatedCostSavings.description}`);
    console.log(`Reasoning: ${result.reasoning}\n`);
  });
  
  const stats = router.generateStats(results);
  console.log('Routing Statistics:', JSON.stringify(stats, null, 2));
}