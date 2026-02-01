#!/usr/bin/env node

/**
 * Real-world Example: Email Classification Pipeline
 * Uses model routing + caching + batching for maximum savings
 */

const ModelRouter = require('../model-router');
const PromptCache = require('../prompt-cache');
const ResponseCache = require('../response-cache');

class EmailClassifier {
  constructor() {
    this.router = new ModelRouter();
    this.promptCache = new PromptCache();
    this.responseCache = new ResponseCache({ maxSize: 5000 });
    
    this.systemPrompt = `You are an expert email classifier. Classify emails into categories:
- urgent: Requires immediate action
- important: Worth reading but not urgent
- marketing: Promotional content
- spam: Unsolicited messages
- archive: Can be deleted or archived

Respond with ONLY the category name.`;
  }

  /**
   * Classify a single email with optimization
   */
  async classifyEmail(email) {
    // Check response cache first
    const cached = this.responseCache.get(email.subject, 'haiku-4-5');
    if (cached) {
      return { ...cached, source: 'cache' };
    }

    // Route based on complexity (check for indicators)
    const complexity = this.analyzeEmailComplexity(email);
    const routing = this.router.selectModel(email.subject, { requiresReasoning: complexity === 'complex' });

    // Prepare for caching
    const optimized = this.promptCache.optimizeForCaching([
      { role: 'user', content: email.subject }
    ], this.systemPrompt);

    // Simulate API call
    const result = {
      category: this.simulateClassification(email),
      model: routing.model,
      confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
      source: 'api'
    };

    // Cache the response
    this.responseCache.set(email.subject, result, 'haiku-4-5');

    return result;
  }

  /**
   * Analyze email complexity
   */
  analyzeEmailComplexity(email) {
    const length = email.subject.length + (email.body?.length || 0);
    const hasAttachments = email.attachments?.length > 0;
    const isReply = email.inReplyTo !== undefined;

    if (length > 1000 || hasAttachments || isReply) {
      return 'complex';
    }
    return 'simple';
  }

  /**
   * Simulate classification (replace with real API call)
   */
  simulateClassification(email) {
    const categories = ['urgent', 'important', 'marketing', 'spam', 'archive'];
    const keywords = {
      urgent: ['urgent', 'asap', 'critical', 'emergency'],
      important: ['meeting', 'deadline', 'review', 'approval'],
      marketing: ['sale', 'offer', 'discount', 'limited time'],
      spam: ['unsubscribe', 'click here', 'guaranteed']
    };

    for (const [cat, words] of Object.entries(keywords)) {
      for (const word of words) {
        if (email.subject.toLowerCase().includes(word)) {
          return cat;
        }
      }
    }

    return 'archive';
  }

  /**
   * Batch process multiple emails
   */
  async batchClassify(emails) {
    const results = [];
    const stats = {
      total: emails.length,
      cached: 0,
      api: 0,
      byModel: {}
    };

    for (const email of emails) {
      const result = await this.classifyEmail(email);
      results.push({ email: email.subject, ...result });

      if (result.source === 'cache') stats.cached++;
      if (result.source === 'api') stats.api++;

      const model = result.model.split('/')[1];
      stats.byModel[model] = (stats.byModel[model] || 0) + 1;
    }

    return { results, stats, cacheMetrics: this.responseCache.getStats() };
  }

  /**
   * Get optimization report
   */
  getReport() {
    const cacheStats = this.responseCache.getStats();
    
    return {
      cacheMetrics: cacheStats,
      optimizationImpact: {
        estimatedSavings: `${cacheStats.hitRate} hit rate = ~50-70% cost reduction`,
        cacheHits: cacheStats.hits,
        apiCalls: cacheStats.misses,
        totalQueries: cacheStats.hits + cacheStats.misses
      }
    };
  }
}

// Example usage
if (require.main === module) {
  const classifier = new EmailClassifier();

  const testEmails = [
    { subject: 'Urgent: Server Down', body: 'Our production server is down' },
    { subject: 'Urgent: Server Down', body: 'Same email again (cached)' },
    { subject: 'Meeting Tomorrow at 3pm', body: 'Team standup' },
    { subject: 'Special Offer: 50% Off!', body: 'Limited time sale' },
    { subject: 'Unsubscribe from mailing list', body: 'Spam email' }
  ];

  classifier.batchClassify(testEmails).then(result => {
    console.log('Classification Results:');
    result.results.forEach(r => {
      console.log(`  ${r.email}: ${r.category} (${r.source})`);
    });
    console.log('\nStats:', result.stats);
    console.log('\nCache Metrics:', result.cacheMetrics);
    console.log('\nOptimization Report:', classifier.getReport());
  });
}

module.exports = EmailClassifier;