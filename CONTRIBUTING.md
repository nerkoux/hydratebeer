# Contributing to HydrateBeer

Thank you for considering contributing to HydrateBeer!

## Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/your-org/hydrate-beer.git
cd hydrate-beer
```

2. **Install dependencies**
```bash
npm install
```

3. **Build the SDK**
```bash
cd packages/hydrate-beer
npm run build
```

## Project Structure

- `packages/hydrate-beer/` - SDK package
  - `src/` - Source code
  - `examples/` - Usage examples
  - `dist/` - Build output
- `tinybird/` - Tinybird configuration
  - `datasources/` - Data source definitions
  - `pipes/` - Aggregation pipes
  - `endpoints/` - API endpoints

## Making Changes

### SDK Changes

1. Make your changes in `packages/hydrate-beer/src/`
2. Build: `npm run build`
3. Test locally: `npm link` and link in a test project
4. Verify no TypeScript errors: `npm run lint`

### Tinybird Changes

1. Make changes in `tinybird/`
2. Test locally: `tb push --dry-run`
3. Deploy to test workspace: `tb push`
4. Verify queries work correctly

## Code Style

- Use TypeScript for all SDK code
- Follow existing patterns and conventions
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Prefer composition over inheritance

## Testing Guidelines

- Never crash the user's application
- All errors should be caught and logged with `console.debug`
- Test with different React versions (18+)
- Test with both Next.js App Router and Pages Router
- Verify performance impact is minimal

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Build and test thoroughly
4. Commit with clear messages
5. Push and create a PR
6. Describe what changed and why

## Versioning

We use semantic versioning:
- **MAJOR**: Breaking API changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

## Questions?

Open an issue for discussion before making large changes.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
