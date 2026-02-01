#!/usr/bin/env node

/**
 * Batch API Processor for Claude
 * Process requests asynchronously with 50% cost savings
 */

class BatchProcessor {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.batchEndpoint = 'https://api.anthropic.com/v1/messages/batch';
    this.maxBatchSize = 100000; // API limit
    this.requestsQueue = [];
  }

  /**
   * Add a request to the batch queue
   */
  addRequest(message, model = 'claude-haiku-4-5', options = {}) {
    const request = {
      custom_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      params: {
        model: model,
        max_tokens: options.maxTokens || 1024,
        system: options.system,
        messages: Array.isArray(message) ? message : [{ role: 'user', content: message }]
      }
    };
    
    this.requestsQueue.push(request);
    return request.custom_id;
  }

  /**
   * Create a JSONL batch file for submission
   */
  createBatchFile(requests = null) {
    const toProcess = requests || this.requestsQueue;
    let jsonl = '';
    
    toProcess.forEach(req => {
      jsonl += JSON.stringify(req) + '\n';
    });
    
    return jsonl;
  }

  /**
   * Estimate batch processing time and cost
   */
  estimateMetrics(requests = null) {
    const toProcess = requests || this.requestsQueue;
    const totalRequests = toProcess.length;
    
    // Rough estimates
    const estimatedTime = '5-24 hours'; // Batch processing time
    const costSavings = 0.50; // 50% discount
    
    let estimatedTokens = 0;
    toProcess.forEach(req => {
      // Rough token count: ~4 chars per token
      const content = JSON.stringify(req.params);
      estimatedTokens += Math.ceil(content.length / 4);
    });
    
    const haikuInputCost = (estimatedTokens / 1000000) * 1; // $1 per MTok
    const discountedCost = haikuInputCost * costSavings;
    const savings = haikuInputCost - discountedCost;
    
    return {
      totalRequests,
      estimatedTokens,
      estimatedTime,
      baseCost: haikuInputCost.toFixed(4),
      batchCost: discountedCost.toFixed(4),
      totalSavings: savings.toFixed(4),
      savingsPercentage: '50%'
    };
  }

  /**
   * Format batch for API submission
   */
  formatForSubmission() {
    const requests = this.requestsQueue.map(req => ({
      custom_id: req.custom_id,
      params: req.params
    }));
    
    return {
      requests,
      metadata: {
        created_at: new Date().toISOString(),
        total_requests: requests.length,
        estimated_cost_savings: '50%'
      }
    };
  }

  /**
   * Clear the queue
   */
  clearQueue() {
    this.requestsQueue = [];
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      queued_requests: this.requestsQueue.length,
      metrics: this.estimateMetrics()
    };
  }
}

module.exports = BatchProcessor;

// CLI usage
if (require.main === module) {
  const processor = new BatchProcessor(process.env.ANTHROPIC_API_KEY);
  
  // Example: Add multiple requests
  processor.addRequest('Classify this: spam or not spam?', 'claude-haiku-4-5');
  processor.addRequest('Extract entities: John works at OpenAI in SF', 'claude-haiku-4-5');
  processor.addRequest('Summarize: The quick brown fox...', 'claude-haiku-4-5');
  
  console.log('Batch Status:', JSON.stringify(processor.getStatus(), null, 2));
  console.log('\nBatch File Preview (first 200 chars):');
  console.log(processor.createBatchFile().substring(0, 200) + '...');
}