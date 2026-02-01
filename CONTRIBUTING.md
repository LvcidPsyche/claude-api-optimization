# Contributing to Claude API Cost Optimization

Thanks for your interest in improving this toolkit! Here are guidelines for contributing.

## Code of Conduct

- Be respectful and inclusive
- Focus on the problem, not the person
- Welcome diverse perspectives

## Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/claude-api-optimization.git
   cd claude-api-optimization
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write clean, well-documented code
   - Follow the existing code style
   - Add tests for new functionality

4. **Run tests**
   ```bash
   npm test
   ```

5. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

6. **Submit a Pull Request**
   - Provide clear description of changes
   - Reference any related issues
   - Include performance impacts if applicable

## Code Style

- **JavaScript**: Use Node.js best practices
- **Comments**: Document complex logic
- **Functions**: Keep functions focused and testable
- **Variables**: Use clear, descriptive names

## Commit Messages

Follow conventional commits format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `test:` - Test additions
- `perf:` - Performance improvement
- `refactor:` - Code refactoring

Example:
```
feat: add token budget estimator

- Estimates token usage for batch operations
- Helps users plan batch sizes
- Includes test coverage
```

## Areas for Contribution

### High Priority
- [ ] Advanced token estimation algorithms
- [ ] Integration examples for popular frameworks
- [ ] Monitoring dashboard component
- [ ] Performance benchmarks for different workloads

### Medium Priority
- [ ] Additional caching strategies
- [ ] Cost prediction models
- [ ] Documentation translations
- [ ] CLI improvements

### Low Priority
- [ ] Example configurations
- [ ] Blog posts and guides
- [ ] Community discussions

## Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test cost-monitor.test.js

# Run with coverage
npm test -- --coverage
```

## Documentation

- Update README.md for user-facing changes
- Add API documentation for new functions
- Include examples for complex features
- Keep CONTRIBUTING.md updated

## Questions?

- Open an issue with the `question` label
- Start a discussion in the repository
- Check existing issues first

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to making Claude API usage more affordable! 🚀**