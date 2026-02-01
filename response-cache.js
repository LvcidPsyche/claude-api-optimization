#!/usr/bin/env node

/**
 * Response Caching Layer
 * Application-level cache for common queries
 * Reduces redundant API calls and provides instant responses
 */

class ResponseCache {
  constructor(options = {}) {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      clears: 0
    };
    this.defaultTTL = options.ttl || 3600000; // 1 hour default
    this.maxSize = options.maxSize || 1000;
    this.compressionThreshold = options.compressionThreshold || 5000;
  }

  /**
   * Generate cache key from prompt and options
   */
  generateKey(prompt, model = 'haiku-4-5', options = {}) {
    const key = `${model}:${prompt}:${JSON.stringify(options)}`;
    // Simple hash for shorter keys
    return Buffer.from(key).toString('base64').substring(0, 64);
  }

  /**
   * Get cached response
   */
  get(prompt, model) {
    const key = this.generateKey(prompt, model);
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    this.stats.hits++;
    entry.lastAccessed = Date.now();
    entry.accessCount++;
    
    return entry.response;
  }

  /**
   * Set cached response
   */
  set(prompt, response, model = 'haiku-4-5', ttl = null) {
    // Enforce max cache size with LRU eviction
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }
    
    const key = this.generateKey(prompt, model);
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    
    this.cache.set(key, {
      response,
      createdAt: Date.now(),
      expiresAt,
      lastAccessed: Date.now(),
      accessCount: 0,
      model,
      promptLength: prompt.length,
      responseLength: JSON.stringify(response).length
    });
    
    this.stats.sets++;
  }

  /**
   * Evict least recently used entry
   */
  evictLRU() {
    let lruKey = null;
    let lruTime = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    }
    
    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  /**
   * Clear entire cache
   */
  clear() {
    this.cache.clear();
    this.stats.clears++;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests * 100).toFixed(2) : 0;
    
    let totalSize = 0;
    let totalPromptSize = 0;
    let totalResponseSize = 0;
    
    for (const [_, entry] of this.cache.entries()) {
      totalPromptSize += entry.promptLength;
      totalResponseSize += entry.responseLength;
    }
    
    totalSize = totalPromptSize + totalResponseSize;
    
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: `${hitRate}%`,
      sets: this.stats.sets,
      size: this.cache.size,
      maxSize: this.maxSize,
      totalBytes: totalSize,
      promptBytes: totalPromptSize,
      responseBytes: totalResponseSize,
      estimatedSavings: `${(this.stats.hits * 90).toFixed(0)}% on cache hits`
    };
  }

  /**
   * Get entry metadata without response
   */
  getMetadata(prompt, model) {
    const key = this.generateKey(prompt, model);
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    return {
      exists: true,
      expiresIn: Math.max(0, entry.expiresAt - Date.now()),
      accessCount: entry.accessCount,
      age: Date.now() - entry.createdAt,
      model: entry.model,
      sizes: {
        prompt: entry.promptLength,
        response: entry.responseLength
      }
    };
  }

  /**
   * Export cache for persistence
   */
  export() {
    const exported = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (Date.now() <= entry.expiresAt) { // Only export non-expired
        exported.push({
          key,
          ...entry
        });
      }
    }
    
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      entries: exported,
      stats: this.getStats()
    };
  }

  /**
   * Import cached entries
   */
  import(data) {
    if (data.version !== 1) {
      console.warn('Warning: Cache version mismatch');
      return;
    }
    
    let imported = 0;
    data.entries.forEach(entry => {
      if (Date.now() <= entry.expiresAt) {
        this.cache.set(entry.key, {
          response: entry.response,
          createdAt: entry.createdAt,
          expiresAt: entry.expiresAt,
          lastAccessed: entry.lastAccessed,
          accessCount: entry.accessCount,
          model: entry.model,
          promptLength: entry.promptLength,
          responseLength: entry.responseLength
        });
        imported++;
      }
    });
    
    return { imported, skipped: data.entries.length - imported };
  }
}

module.exports = ResponseCache;

// CLI usage
if (require.main === module) {
  const cache = new ResponseCache({ maxSize: 100 });
  
  // Example usage
  cache.set('What is 2+2?', { answer: '4' }, 'haiku-4-5');
  cache.set('Classify: spam', { result: 'spam' }, 'haiku-4-5');
  
  console.log('Cache hit:', cache.get('What is 2+2?', 'haiku-4-5'));
  console.log('Cache miss:', cache.get('Different query', 'haiku-4-5'));
  console.log('Stats:', JSON.stringify(cache.getStats(), null, 2));
}