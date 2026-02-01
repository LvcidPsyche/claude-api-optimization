# Setup & Installation Guide

## Quick Start (5 minutes)

### 1. Install

```bash
git clone https://github.com/LvcidPsyche/claude-api-optimization.git
cd claude-api-optimization
npm install
```

### 2. Set Environment Variables

```bash
export ANTHROPIC_API_KEY="your-key-here"
export MODEL_PRIMARY="anthropic/claude-haiku-4-5"
export MODEL_FALLBACK="anthropic/claude-sonnet-4-20250514"
```

### 3. Verify Installation

```bash
npm test
node demo.js
```

---

## Full Installation

### Prerequisites

- **Node.js** ≥ 16.0.0 ([install](https://nodejs.org))
- **npm** ≥ 8.0.0 (comes with Node.js)
- **Claude API Key** ([get one](https://console.anthropic.com))

### Step-by-Step

1. **Clone Repository**
   ```bash
   git clone https://github.com/LvcidPsyche/claude-api-optimization.git
   cd claude-api-optimization
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**

   **Option A: Environment File**
   ```bash
   cp .env.example .env
   # Edit .env with your API key
   ```

   **Option B: Environment Variables**
   ```bash
   export ANTHROPIC_API_KEY="sk-ant-..."
   ```

4. **Verify Setup**
   ```bash
   npm test
   ```

---

## Usage

### Using Individual Tools

#### Cost Monitor
```javascript
const ClaudeCostMonitor = require('./cost-monitor');
const monitor = new ClaudeCostMonitor();

monitor.trackUsage('haiku-4-5', 1000, 500);
console.log(monitor.generateReport());
```

#### Model Router
```javascript
const ModelRouter = require('./model-router');
const router = new ModelRouter();

const result = router.selectModel('Classify this email');
console.log(result.model); // "anthropic/claude-haiku-4-5"
console.log(result.estimatedCostSavings);
```

#### Prompt Cache
```javascript
const PromptCache = require('./prompt-cache');
const cache = new PromptCache();

const optimized = cache.optimizeForCaching(messages, systemPrompt);
console.log(optimized);
```

#### Response Cache
```javascript
const ResponseCache = require('./response-cache');
const cache = new ResponseCache();

cache.set('Query', response);
const cached = cache.get('Query');
console.log(cache.getStats());
```

#### Batch Processor
```javascript
const BatchProcessor = require('./batch-processor');
const processor = new BatchProcessor(process.env.ANTHROPIC_API_KEY);

processor.addRequest('Classify this email');
console.log(processor.estimateMetrics());
```

#### Benchmark
```javascript
const CostBenchmark = require('./benchmark');
const benchmark = new CostBenchmark();

benchmark.runScenario('My scenario', requests);
console.log(benchmark.getReport());
```

### Run Examples

```bash
# Email classification
node examples/email-classification.js

# Batch content generation
node examples/batch-content-generation.js
```

### Run Tests

```bash
# All tests
npm test

# Specific test file
npm test test/cost-monitor.test.js

# With coverage
npm test -- --coverage
```

---

## Integration Guide

### OpenClaw Integration

```bash
# Copy config to OpenClaw
cp optimized-config.json ~/.openclaw/openclaw.json
```

### Node.js Application

```javascript
const {
  ClaudeCostMonitor,
  ModelRouter,
  PromptCache,
  ResponseCache,
  BatchProcessor,
  CostBenchmark
} = require('claude-api-optimization');

// Use in your app
```

### CLI Usage

```bash
# Run cost monitoring
node cost-monitor.js

# Run model routing
node model-router.js

# Run benchmarks
node benchmark.js
```

---

## Configuration

### Environment Variables

```bash
ANTHROPIC_API_KEY=your_key_here
MODEL_PRIMARY=anthropic/claude-haiku-4-5
MODEL_FALLBACK=anthropic/claude-sonnet-4-5
CACHE_TTL=3600000
CACHE_MAX_SIZE=1000
BATCH_MAX_SIZE=100000
```

### Config File (optional)

Create `config.json`:
```json
{
  "models": {
    "primary": "anthropic/claude-haiku-4-5",
    "fallback": "anthropic/claude-sonnet-4-5"
  },
  "cache": {
    "ttl": 3600000,
    "maxSize": 1000
  },
  "batch": {
    "maxSize": 100000,
    "maxWaitTime": 86400000
  }
}
```

---

## Troubleshooting

### Issue: "Missing API Key"
**Solution:**
```bash
export ANTHROPIC_API_KEY="your-key-here"
```

### Issue: "Tests failing"
**Solution:**
```bash
npm install
npm test
```

### Issue: "Module not found"
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Cache not working"
**Solution:**
- Verify cache TTL is set correctly
- Check cache size limits
- Ensure entries haven't expired

### Issue: "Batch API timeout"
**Solution:**
- Batch processing can take 5-24 hours
- Check batch status via API
- Reduce batch size if needed

---

## Performance Tuning

### Optimize for Your Use Case

**High-Volume Classification:**
```bash
export CACHE_MAX_SIZE=5000  # Larger cache
export CACHE_TTL=86400000   # 24-hour TTL
```

**Batch Processing:**
```bash
export BATCH_MAX_SIZE=100000  # Max batch size
```

**Real-time Applications:**
```bash
export CACHE_TTL=300000      # 5-minute TTL
export CACHE_MAX_SIZE=500    # Smaller cache
```

---

## Monitoring

### View Metrics

```javascript
const monitor = new ClaudeCostMonitor();
const stats = monitor.generateReport();
console.log(JSON.stringify(stats, null, 2));
```

### Export Metrics

```javascript
const cache = new ResponseCache();
const metrics = cache.export();
// Send to monitoring system
```

---

## Support

- **Documentation**: See [README.md](README.md)
- **Issues**: [GitHub Issues](https://github.com/LvcidPsyche/claude-api-optimization/issues)
- **Contributing**: See [CONTRIBUTING.md](CONTRIBUTING.md)

---

## Next Steps

1. ✅ Complete installation
2. 📖 Read [README.md](README.md)
3. 🧪 Run tests: `npm test`
4. 📚 Review examples in `examples/`
5. 🚀 Integrate into your application