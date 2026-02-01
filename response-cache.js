#!/usr/bin/env node
/**
 * Response Cache - Application-level response caching with LRU eviction
 * Reduce redundant API calls with minimal memory overhead
 */

class ResponseCache {
  constructor(options = {}) {
    this.cache = new Map();
    this.stats = { hits: 0, misses: 0, sets: 0 };
    this.ttl = options.ttl || 3600000; // 1 hour
    this.maxSize = options.maxSize || 1000;
  }

  // Generate cache key
  generateKey(prompt, model = 'haiku-4-5') {
    return Buffer.from(`${model}:${prompt}`).toString('base64').substring(0, 64);
  }

  // Get cached response
  get(prompt, model = 'haiku-4-5') {
    const key = this.generateKey(prompt, model);
    const entry = this.cache.get(key);
    
    if (!entry || Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    this.stats.hits++;
    entry.lastAccessed = Date.now();
    return entry.response;
  }

  // Set cached response
  set(prompt, response, model = 'haiku-4-5', ttl = null) {
    if (this.cache.size >= this.maxSize) this.evictLRU();
    
    const key = this.generateKey(prompt, model);
    this.cache.set(key, {
      response,
      expiresAt: Date.now() + (ttl || this.ttl),
      lastAccessed: Date.now()
    });
    
    this.stats.sets++;
  }

  // LRU eviction
  evictLRU() {
    let lruKey = null;
    let lruTime = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    }
    
    if (lruKey) this.cache.delete(lruKey);
  }

  // Get statistics
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? `${(this.stats.hits / total * 100).toFixed(1)}%` : '0%',
      size: this.cache.size,
      maxSize: this.maxSize,
      estimatedSavings: `${Math.round(this.stats.hits * 90)}% on cache hits`
    };
  }

  // Clear cache
  clear() {
    this.cache.clear();
  }
}

module.exports = ResponseCache;

// CLI usage
if (require.main === module) {
  const cache = new ResponseCache();
  
  cache.set('Test query', { result: 'answer' });
  cache.set('Test query 2', { result: 'answer 2' });
  
  console.log('Hit:', cache.get('Test query'));
  console.log('Miss:', cache.get('Unknown'));
  console.log('Stats:', cache.getStats());
}