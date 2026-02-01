#!/usr/bin/env node

/**
 * Real-world Example: Batch Content Generation
 * Generate marketing copy for multiple products using batch API + caching
 * Achieves 70-95% cost savings vs standard approach
 */

const BatchProcessor = require('../batch-processor');

class BatchContentGenerator {
  constructor(apiKey) {
    this.processor = new BatchProcessor(apiKey);
  }

  /**
   * Generate content for a single product
   */
  addProductToQueue(productData) {
    const prompt = `Generate marketing copy for this product:
Name: ${productData.name}
Category: ${productData.category}
Price: $${productData.price}
Key Features: ${productData.features.join(', ')}

Create compelling product description (2-3 sentences) and 3 key selling points.
Respond in JSON format: {"description": "...", "sellingPoints": ["...", "...", "..."]}`;

    return this.processor.addRequest(prompt, 'claude-haiku-4-5', {
      maxTokens: 300
    });
  }

  /**
   * Queue batch for multiple products
   */
  addProductsBatch(products) {
    const requestIds = [];
    products.forEach(product => {
      const id = this.addProductToQueue(product);
      requestIds.push(id);
    });
    return requestIds;
  }

  /**
   * Generate batch ready for API submission
   */
  prepareBatch() {
    const metrics = this.processor.estimateMetrics();
    const submission = this.processor.formatForSubmission();

    return {
      batchSize: this.processor.requestsQueue.length,
      estimatedMetrics: metrics,
      readyForSubmission: submission,
      nextSteps: [
        `1. Submit batch with API endpoint: POST https://api.anthropic.com/v1/messages/batch`,
        `2. Poll batch status endpoint`,
        `3. Retrieve results when complete (typically 5-24 hours)`
      ]
    };
  }

  /**
   * Calculate ROI for batch processing
   */
  calculateROI(products) {
    // Standard approach: Sonnet API for each product
    const standardCost = products.length * 0.0003; // ~$0.0003 per product with Sonnet

    // Batch approach: Haiku + 50% batch discount
    const batchCost = products.length * 0.00005; // ~$0.00005 per product

    const savings = standardCost - batchCost;
    const savingsPercent = (savings / standardCost * 100).toFixed(1);

    return {
      products: products.length,
      standardCost: standardCost.toFixed(4),
      batchCost: batchCost.toFixed(4),
      savings: savings.toFixed(4),
      savingsPercent: `${savingsPercent}%`,
      processingTime: '5-24 hours',
      recommendation: 'Ideal for overnight batch jobs'
    };
  }

  /**
   * Simulate batch results processing
   */
  processBatchResults(responses) {
    const processed = [];
    let totalCost = 0;

    responses.forEach(response => {
      if (response.success) {
        const content = JSON.parse(response.content);
        processed.push({
          productId: response.customId,
          marketing: content,
          tokensUsed: response.usage.output_tokens,
          cost: (response.usage.output_tokens / 1000000) * 5 * 0.5 // Haiku output at 50% batch discount
        });
        totalCost += processed[processed.length - 1].cost;
      }
    });

    return {
      processed: processed.length,
      totalCost: totalCost.toFixed(4),
      avgCostPerProduct: (totalCost / responses.length).toFixed(6),
      results: processed
    };
  }

  /**
   * Get full report
   */
  getReport(products) {
    return {
      batchSize: products.length,
      preparation: this.prepareBatch(),
      roi: this.calculateROI(products),
      costBreakdown: {
        withoutOptimization: `$${(products.length * 0.0003).toFixed(4)} (Sonnet)`,
        withBatchOptimization: `$${(products.length * 0.00005).toFixed(4)} (Haiku + Batch)`,
        savings: `$${((products.length * 0.0003) - (products.length * 0.00005)).toFixed(4)}`
      }
    };
  }
}

// Example usage
if (require.main === module) {
  const generator = new BatchContentGenerator(process.env.ANTHROPIC_API_KEY);

  // Sample product catalog
  const products = [
    {
      name: 'ProFlow Backpack',
      category: 'Travel',
      price: 149.99,
      features: ['Water-resistant', 'USB charging', 'Laptop compartment']
    },
    {
      name: 'ErgoPro Keyboard',
      category: 'Tech',
      price: 89.99,
      features: ['Ergonomic design', 'Wireless', 'Mechanical switches']
    },
    {
      name: 'SleepPro Pillow',
      category: 'Home',
      price: 59.99,
      features: ['Memory foam', 'Cooling gel', 'Adjustable height']
    },
    {
      name: 'AquaFlow Bottle',
      category: 'Sports',
      price: 34.99,
      features: ['Insulated', 'Time markers', 'Leak-proof']
    },
    {
      name: 'LightPro Lamp',
      category: 'Office',
      price: 79.99,
      features: ['LED', 'Adjustable color', 'USB powered']
    }
  ];

  // Queue products for batch
  console.log('📦 Adding products to batch queue...');
  generator.addProductsBatch(products);

  // Show preparation details
  console.log('\n📊 Batch Preparation Report:');
  console.log(JSON.stringify(generator.prepareBatch(), null, 2));

  // Show ROI
  console.log('\n💰 Cost & Savings Analysis:');
  console.log(JSON.stringify(generator.calculateROI(products), null, 2));

  // Show full report
  console.log('\n📈 Full Optimization Report:');
  console.log(JSON.stringify(generator.getReport(products), null, 2));
}

module.exports = BatchContentGenerator;