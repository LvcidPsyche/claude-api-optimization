#!/usr/bin/env node

/**
 * Prompt Caching Utility for Claude API
 * Implements intelligent caching for 90% cost savings on repeated content
 */

class PromptCache {
  constructor() {
    this.cacheThreshold = 1024; // Minimum tokens for caching
    this.maxCacheBreakpoints = 4; // Claude API limit
  }

  // Prepare messages with optimal caching
  optimizeForCaching(messages, systemPrompt = null) {
    const optimized = {
      model: null, // Will be set by caller
      messages: [],
      system: null
    };

    // Add system prompt with caching if long enough
    if (systemPrompt && systemPrompt.length > this.cacheThreshold) {
      optimized.system = [{
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' }
      }];
    } else if (systemPrompt) {
      optimized.system = systemPrompt;
    }

    // Process messages for caching opportunities
    const processedMessages = this.identifyCacheableContent(messages);
    optimized.messages = processedMessages;

    return optimized;
  }

  // Identify content that should be cached
  identifyCacheableContent(messages) {
    const processed = [];
    let cacheBreakpoints = 0;

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      
      // Check if this message should be cached
      if (this.shouldCache(message, i, messages) && cacheBreakpoints < this.maxCacheBreakpoints) {
        processed.push({
          ...message,
          content: this.addCacheControl(message.content)
        });
        cacheBreakpoints++;
      } else {
        processed.push(message);
      }
    }

    return processed;
  }

  // Determine if message should be cached
  shouldCache(message, index, allMessages) {
    // Cache conversation history prefixes (early messages)
    if (index < allMessages.length - 2 && message.content.length > this.cacheThreshold) {
      return true;
    }

    // Cache large context documents
    if (message.content.length > this.cacheThreshold * 2) {
      return true;
    }

    // Cache tool definitions and examples
    if (this.containsToolDefinitions(message.content) || 
        this.containsExamples(message.content)) {
      return true;
    }

    return false;
  }

  // Add cache control to content
  addCacheControl(content) {
    if (typeof content === 'string') {
      return [{
        type: 'text',
        text: content,
        cache_control: { type: 'ephemeral' }
      }];
    }
    
    if (Array.isArray(content)) {
      // Find the largest text block to cache
      let largestIndex = 0;
      let largestSize = 0;
      
      content.forEach((item, index) => {
        if (item.type === 'text' && item.text.length > largestSize) {
          largestSize = item.text.length;
          largestIndex = index;
        }
      });
      
      if (largestSize > this.cacheThreshold) {
        const cached = [...content];
        cached[largestIndex] = {
          ...cached[largestIndex],
          cache_control: { type: 'ephemeral' }
        };
        return cached;
      }
    }
    
    return content;
  }

  // Check if content contains tool definitions
  containsToolDefinitions(content) {
    const text = typeof content === 'string' ? content : JSON.stringify(content);
    return /function|tool|parameter|schema|definition/i.test(text);
  }

  // Check if content contains examples
  containsExamples(content) {
    const text = typeof content === 'string' ? content : JSON.stringify(content);
    return /example|sample|demo|illustration/i.test(text);
  }

  // Generate caching report
  analyzeCachingPotential(messages, systemPrompt = null) {
    let cacheableTokens = 0;
    let totalTokens = 0;
    const opportunities = [];

    // Analyze system prompt
    if (systemPrompt && systemPrompt.length > this.cacheThreshold) {
      const tokens = Math.floor(systemPrompt.length / 4); // Rough token estimate
      cacheableTokens += tokens;
      totalTokens += tokens;
      opportunities.push({
        type: 'system_prompt',
        tokens,
        savings: '90%',
        recommendation: 'Cache system prompt for 90% savings on repeated calls'
      });
    }

    // Analyze messages
    messages.forEach((message, index) => {
      const tokens = Math.floor(message.content.length / 4);
      totalTokens += tokens;
      
      if (this.shouldCache(message, index, messages)) {
        cacheableTokens += tokens;
        opportunities.push({
          type: 'message',
          index,
          tokens,
          savings: '90%',
          recommendation: `Cache message ${index} for repeated conversations`
        });
      }
    });

    const potentialSavings = totalTokens > 0 ? 
      Math.round((cacheableTokens / totalTokens) * 90) : 0;

    return {
      totalTokens,
      cacheableTokens,
      potentialSavings: `${potentialSavings}%`,
      opportunities,
      breakEvenPoint: '2 API calls with same cached content'
    };
  }

  // Create cacheable template for common patterns
  createTemplate(type) {
    const templates = {
      codeReview: {
        system: 'You are an expert code reviewer. Analyze code for bugs, performance issues, security vulnerabilities, and best practices. Provide specific, actionable feedback.',
        cache: true
      },
      dataAnalysis: {
        system: 'You are a data analysis expert. Examine datasets, identify patterns, and provide insights. Focus on statistical significance and practical implications.',
        cache: true
      },
      contentGeneration: {
        system: 'You are a professional content writer. Create engaging, well-structured content that matches the specified tone and audience.',
        cache: true
      }
    };

    return templates[type] || null;
  }
}

module.exports = PromptCache;

// CLI usage
if (require.main === module) {
  const cache = new PromptCache();
  
  const systemPrompt = 'You are an AI assistant specialized in software engineering. You have deep knowledge of programming languages, software architecture, and best practices. When analyzing code, consider performance, security, maintainability, and readability. Always provide specific examples and actionable recommendations.';
  
  const messages = [
    {
      role: 'user',
      content: 'Here is the codebase context: [LARGE CODEBASE CONTENT HERE - imagine this is 5000 characters of code]'
    },
    {
      role: 'assistant', 
      content: 'I understand the codebase structure.'
    },
    {
      role: 'user',
      content: 'Please review this function for bugs'
    }
  ];

  console.log('Caching Analysis:');
  const analysis = cache.analyzeCachingPotential(messages, systemPrompt);
  console.log(JSON.stringify(analysis, null, 2));

  console.log('\nOptimized Request:');
  const optimized = cache.optimizeForCaching(messages, systemPrompt);
  console.log(JSON.stringify(optimized, null, 2));
}