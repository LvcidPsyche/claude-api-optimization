# 🚀 Claude API Cost Optimization Toolkit

**Reduce your Claude API costs by 50-95% with production-ready optimization tools.**

[![GitHub](https://img.shields.io/badge/GitHub-LvcidPsyche-blue)](https://github.com/LvcidPsyche/claude-api-optimization)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Node](https://img.shields.io/badge/Node.js->=16.0.0-blue)](https://nodejs.org)

---

## 📊 Why This Matters

| Strategy | Savings | Effort |
|----------|---------|--------|
| Model Selection (Haiku) | 67% | Low |
| Prompt Caching | 90% | Low |
| Batch API | 50% | Medium |
| Combined Optimization | **95%** | Medium |

**Real Example**: $1,000/month → $50-150/month ✅

---

## 🎯 What's Included

### Core Tools
- **`cost-monitor.js`** - Real-time cost tracking & recommendations
- **`model-router.js`** - Intelligent model selection (67% savings)
- **`prompt-cache.js`** - Automatic prompt caching (90% savings)
- **`response-cache.js`** - Application-level response caching
- **`batch-processor.js`** - Batch API processing (50% savings)
- **`benchmark.js`** - Measure actual vs projected savings

### Integration Examples
- Email classification with caching
- Batch content generation
- Real-world usage patterns

### Production Ready
- ✅ Full test suite
- ✅ Complete documentation
- ✅ OpenClaw integration
- ✅ Contributing guidelines
- ✅ MIT License

---

## 🚀 Quick Start

### Installation
```bash
git clone https://github.com/LvcidPsyche/claude-api-optimization.git
cd claude-api-optimization
npm install
```

### Basic Usage
```javascript
const ModelRouter = require('./model-router');
const ClaudeCostMonitor = require('./cost-monitor');

const router = new ModelRouter();
const result = router.selectModel('Classify this email');
// Returns: Haiku with 67% savings estimate

const monitor = new ClaudeCostMonitor();
monitor.trackUsage('haiku-4-5', 1000, 500);
console.log(monitor.generateReport());
```

### Run Tests & Examples
```bash
npm test                  # Run all tests
npm run example:email     # Email classification example
npm run example:batch     # Batch generation example
npm run benchmark         # Cost benchmarking
```

---

## 📈 Quick Cost Reference

| Model | Input | Output | Best For |
|-------|-------|--------|----------|
| Haiku 4.5 | $1/MTok | $5/MTok | Classification, extraction, Q&A |
| Sonnet 4.5 | $3/MTok | $15/MTok | Code generation, complex analysis |
| Opus 4.5 | $5/MTok | $25/MTok | Mission-critical, complex reasoning |

**Key Insight**: Haiku achieves 90% of Sonnet's performance at 1/3 the cost.

---

## 🛠️ Core Optimization Strategies

### 1️⃣ Smart Model Selection (67% Savings)
Route requests based on complexity:
```javascript
const {model, estimatedCostSavings} = router.selectModel(prompt);
```

### 2️⃣ Prompt Caching (90% Savings)
Cache repeated system prompts:
```javascript
const optimized = cache.optimizeForCaching(messages, systemPrompt);
```

### 3️⃣ Response Caching (50%+ Savings)
Cache API responses:
```javascript
cache.set(query, response);
const cached = cache.get(query);
```

### 4️⃣ Batch Processing (50% Savings)
Process asynchronously:
```javascript
processor.addRequest(prompt);
const metrics = processor.estimateMetrics();
```

### 5️⃣ Cost Benchmarking
Measure actual savings:
```javascript
benchmark.runScenario('workflow', requests);
console.log(benchmark.getReport());
```

---

## 📚 Documentation

- **[Setup Guide](SETUP.md)** - Installation & configuration
- **[Examples](examples/)** - Real-world use cases
- **[Contributing](CONTRIBUTING.md)** - How to contribute
- **[License](LICENSE)** - MIT License

---

## 🧪 Testing

```bash
npm run test:monitor    # Cost monitor tests
npm run test:router     # Model router tests
npm run test:cache      # Cache tests
npm test               # All tests
```

---

## 📊 Production Usage

### OpenClaw Integration
```bash
cp optimized-config.json ~/.openclaw/openclaw.json
```

### Node.js Application
```javascript
const {
  ClaudeCostMonitor,
  ModelRouter,
  PromptCache,
  ResponseCache,
  BatchProcessor
} = require('claude-api-optimization');
```

### CLI Commands
```bash
npm run monitor         # Cost monitoring
npm run route          # Model routing
npm run batch          # Batch processing
npm run benchmark      # Cost benchmarking
```

---

## 💡 Real-World Impact

### Before
- **Cost**: $1,000/month
- **Model**: Sonnet only
- **Optimization**: None

### After
- **Cost**: $50-150/month
- **Models**: Dynamic routing (Haiku + Sonnet)
- **Optimization**: Caching + Batching
- **Savings**: 86-95%

---

## 🎓 Learning Path

1. **Start**: [Setup Guide](SETUP.md)
2. **Learn**: [Optimization Strategies](README.md#🛠️-core-optimization-strategies)
3. **Practice**: [Examples](examples/)
4. **Integrate**: Add to your app
5. **Monitor**: Track savings

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 📝 License

MIT - See [LICENSE](LICENSE).

---

## 🙋 Support

- **Issues**: [GitHub Issues](https://github.com/LvcidPsyche/claude-api-optimization/issues)
- **Docs**: [Full Documentation](SETUP.md)

---

**✨ Built by OpenClawdad for the AI community**

Start saving today: [Quick Start](#-quick-start)