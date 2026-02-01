#!/usr/bin/env node
/**
 * Model Router - Intelligent model selection based on task complexity
 * Minimalist dynamic routing for 67% cost savings
 */

class ModelRouter {
  constructor() {
    this.simplePatterns = [/classify|extract|tag|translate|format|summarize|faq/i];
    this.complexPatterns = [/analyze|generate|design|refactor|code|algorithm|architecture/i];
    this.models = { simple: 'anthropic/claude-haiku-4-5', complex: 'anthropic/claude-sonnet-4-5' };
  }

  // Classify task complexity
  classifyComplexity(prompt) {
    const text = prompt.toLowerCase();
    const wordCount = text.split(/\s+/).length;
    
    for (const pattern of this.simplePatterns) {
      if (pattern.test(text)) return wordCount < 100 ? 'simple' : 'medium';
    }
    
    for (const pattern of this.complexPatterns) {
      return wordCount > 200 ? 'complex' : 'medium';
    }
    
    return wordCount < 30 ? 'simple' : wordCount > 150 ? 'complex' : 'medium';
  }

  // Select optimal model
  selectModel(prompt, options = {}) {
    const complexity = this.classifyComplexity(prompt);
    const model = complexity === 'complex' ? this.models.complex : this.models.simple;
    const savingsPercent = complexity === 'complex' ? 0 : 67;
    
    return {
      model,
      complexity,
      reasoning: this.getReasoning(complexity),
      estimatedSavings: { percentage: savingsPercent, description: savingsPercent > 0 ? `${savingsPercent}% vs Sonnet` : 'Standard cost' }
    };
  }

  getReasoning(complexity) {
    const reasons = {
      simple: 'Haiku recommended - optimal for this task',
      medium: 'Haiku as starting point - upgrade if needed',
      complex: 'Sonnet required - complex reasoning needed'
    };
    return reasons[complexity];
  }

  // Batch routing
  batchRoute(prompts) {
    return prompts.map((prompt, i) => ({
      index: i,
      prompt: prompt.substring(0, 50),
      ...this.selectModel(prompt)
    }));
  }

  // Statistics
  generateStats(results) {
    const dist = { simple: 0, medium: 0, complex: 0 };
    let savings = 0;
    
    results.forEach(r => {
      dist[r.complexity]++;
      savings += r.estimatedSavings.percentage;
    });
    
    return {
      distribution: dist,
      averageSavings: Math.round(savings / results.length),
      totalRequests: results.length
    };
  }
}

module.exports = ModelRouter;

// CLI usage
if (require.main === module) {
  const router = new ModelRouter();
  const tests = [
    'Extract names',
    'Analyze architecture',
    'Classify email',
    'Design system',
    'What is 2+2?'
  ];
  
  console.log('Routing Results:');
  tests.forEach(t => {
    const r = router.selectModel(t);
    console.log(`"${t}" → ${r.model.split('/')[1]} (${r.estimatedSavings.description})`);
  });
}