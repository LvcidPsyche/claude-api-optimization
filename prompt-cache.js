#!/usr/bin/env node
/**
 * Prompt Cache - Optimize API calls with intelligent caching
 * Achieve 90% savings on repeated system prompts and context
 */

class PromptCache {
  constructor(options = {}) {
    this.minSize = 1024;
    this.maxBreakpoints = 4;
  }

  // Optimize messages for caching
  optimizeForCaching(messages, systemPrompt = null) {
    const result = {
      model: null,
      messages: messages.map((m, i) => {
        if (i < messages.length - 2 && JSON.stringify(m).length > this.minSize) {
          return { ...m, cache_control: { type: 'ephemeral' } };
        }
        return m;
      }),
      system: systemPrompt && systemPrompt.length > this.minSize ? 
        [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }] : 
        systemPrompt
    };
    return result;
  }

  // Analyze caching potential
  analyzeCachingPotential(messages, systemPrompt = null) {
    let cacheableTokens = 0;
    let totalTokens = 0;
    const opportunities = [];
    
    if (systemPrompt && systemPrompt.length > this.minSize) {
      const tokens = Math.ceil(systemPrompt.length / 4);
      cacheableTokens += tokens;
      totalTokens += tokens;
      opportunities.push({ type: 'system_prompt', tokens, savings: '90%' });
    }
    
    messages.forEach((m, i) => {
      const tokens = Math.ceil(JSON.stringify(m).length / 4);
      totalTokens += tokens;
      if (i < messages.length - 2 && tokens > this.minSize) {
        cacheableTokens += tokens;
        opportunities.push({ type: 'message', index: i, tokens, savings: '90%' });
      }
    });
    
    return {
      totalTokens,
      cacheableTokens,
      potentialSavings: totalTokens > 0 ? `${Math.round((cacheableTokens / totalTokens) * 90)}%` : '0%',
      opportunities
    };
  }

  // Estimate break-even
  getBreakEvenAnalysis(systemPromptSize) {
    const tokens = Math.ceil(systemPromptSize / 4);
    const writeTokens = tokens * 1.25; // 1.25x for ephemeral
    const readTokens = tokens * 0.1;
    const writeHeuristicSavings = ((writeTokens * 1) - (readTokens * 1)) / 2;
    
    return {
      writeTokens: Math.round(writeTokens),
      readTokens: Math.round(readTokens),
      breakEvenCalls: 2,
      savingsPerRead: '90%',
      recommendation: 'Cache system prompts used 2+ times'
    };
  }
}

module.exports = PromptCache;

// CLI usage
if (require.main === module) {
  const cache = new PromptCache();
  const sysPrompt = 'You are an expert engineer. Analyze code for bugs and improvements.';
  const messages = [
    { role: 'user', content: 'Review this code: ' + 'x'.repeat(2000) },
    { role: 'assistant', content: 'I see several issues...' },
    { role: 'user', content: 'Fix them' }
  ];
  
  console.log('Caching Analysis:', JSON.stringify(cache.analyzeCachingPotential(messages, sysPrompt), null, 2));
  console.log('Break-even:', cache.getBreakEvenAnalysis(sysPrompt.length));
}