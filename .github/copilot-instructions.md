# GitHub Client - WYSIWYG GitHub Issues Editor

GitHub Client is a React + TypeScript web application that provides a WYSIWYG editor for GitHub Issues. It supports GitHub-like search syntax, localStorage persistence, and real-time issue editing.

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Critical Build & Test Requirements

**NEVER CANCEL builds or tests.** Set appropriate timeouts and wait for completion.

### Timeouts for Commands:

- **Build commands**: Set 60+ minutes timeout. Build typically takes 4-5 minutes but can be longer.
- **Test commands**: Set 30+ minutes timeout. Unit tests are fast (~1 min) but E2E can take 15+ minutes.
- **Installation**: Set 60+ minutes timeout. npm install takes ~60 seconds but can be much longer.

## Working Effectively

### Bootstrap, Build, and Test:

```bash
# CRITICAL: Use npm, NOT pnpm (specified in project guidelines)
npm install  # Takes ~60 seconds. NEVER CANCEL. Set timeout to 60+ minutes.

# Build the application
npm run build  # Takes ~4 minutes. NEVER CANCEL. Set timeout to 60+ minutes.

# Run linting (uses Biome, not ESLint)
npm run lint  # Fast, but set timeout to 30+ minutes for safety

# Run unit tests (Vitest)
npm run test  # Takes ~1 minute. NEVER CANCEL. Set timeout to 30+ minutes.

# Run E2E tests (Playwright) - requires browser installation first
npx playwright install  # May take 10+ minutes. NEVER CANCEL. Set timeout to 60+ minutes.
npm run test:e2e  # Takes 5-15 minutes. NEVER CANCEL. Set timeout to 30+ minutes.
```

### Development Server:

```bash
# Start development server
npm run dev  # Starts on http://localhost:5173

# Build for production
npm run build && npm run preview  # Preview production build on port 4173
```

### Docker Development:

```bash
# Using Docker Compose (from README)
echo "VITE_GITHUB_TOKEN=$(gh auth token)" > .env  # Required for GitHub API
docker compose up -d  # Runs on http://localhost:7777
```

## Validation Requirements

### ALWAYS run after making changes:

1. **Code Quality**: `npm run lint` - Must pass before committing
2. **Unit Tests**: `npm run test` - Must pass (53 tests expected)
3. **E2E Tests**: `npm run test:e2e` - Must pass (localStorage, routing, editing tests)

### Manual Validation Scenarios:

After making any changes, ALWAYS test these critical user workflows:

1. **Homepage Flow**:
   - Navigate to http://localhost:5173/
   - Fill owner field (e.g., "testowner")
   - Fill repo field (e.g., "testrepo")
   - Click "Issues を表示" button
   - Should navigate to /issues page (expect API errors without valid token)

2. **localStorage Persistence**:
   - Enter owner/repo values on homepage
   - Refresh page (F5 or navigate away and back)
   - Values should persist and be restored automatically

3. **Navigation Flow**:
   - Click "Issues" link in navigation
   - Should navigate to /issues page
   - Verify search interface displays (search box, author field, state buttons)
   - Check that "No issues found." message appears (expected without valid API token)

4. **Search Parser Functionality**:
   - On issues page, enter GitHub-like query: `is:closed author:testuser bug fix`
   - Click Search button
   - Verify URL updates with correct parameters: `?state=closed&search=bug+fix&author=testuser`
   - Check that filter tags appear showing parsed search terms and author
   - Verify individual filter removal buttons (×) are present

5. **Issue Editing** (if making editor changes):
   - Navigate to an issue detail page
   - Edit issue content in TipTap editor
   - Save changes
   - Verify content is updated

**Expected Results**: All navigation and UI interaction should work smoothly. API errors are normal without a valid GitHub token in .env, but UI functionality should remain intact.

## Technology Stack & Key Files

### Core Technologies:

- **Frontend**: React 19 + TypeScript
- **Routing**: TanStack Router
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS v4 (uses Vite plugin, no PostCSS needed)
- **Editor**: TipTap (WYSIWYG editor for issues)
- **HTTP**: @octokit/rest for GitHub API
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Linting**: Biome (replaces ESLint + Prettier)

### Project Structure:

```
src/
├── components/     # React components
├── lib/           # Utilities & API logic
├── routes/        # TanStack Router routes
├── types/         # TypeScript type definitions
└── main.tsx       # Application entry point

tests/             # Playwright E2E tests
├── localStorage.spec.ts   # Form persistence tests
├── pages.spec.ts         # Basic page navigation
├── routing.spec.ts       # Route functionality
└── issueEditing.spec.ts  # Issue editing workflow
```

### Key Configuration Files:

- `package.json` - npm scripts and dependencies
- `vite.config.ts` - Build configuration + Vitest setup
- `playwright.config.ts` - E2E test configuration
- `biome.jsonc` - Linting and formatting rules
- `.github/workflows/ci.yml` - GitHub Actions pipeline

## Common Development Tasks

### Testing Strategy:

- **Unit Tests** (Vitest): Use for `.ts` files - logic, utilities, parsers
- **E2E Tests** (Playwright): Use for `.tsx` files - UI, routing, integration

### Code Quality:

```bash
# Auto-fix formatting and linting issues
npm run lint:fix

# Spell check (uses cspell) - should pass with no errors
npx cspell "**/*.{ts,tsx,md}"

# Individual spell check of a specific file
npx cspell src/components/MyComponent.tsx
```

### Git Hooks (Lefthook):

Pre-commit hooks automatically run:

- Biome linting + formatting
- Spell checking
- Unit tests for changed files
- E2E tests for changed E2E files

## Environment Requirements

### Required Environment Variables:

```bash
# Create .env file for GitHub API access
VITE_GITHUB_TOKEN=your_github_token_here
```

### Browser Support:

- E2E tests run in Chromium only
- Development: All modern browsers supported

## Troubleshooting

### Common Issues:

1. **Playwright browser download fails**:

   ```bash
   # Try with system dependencies
   npx playwright install --with-deps
   ```

2. **Build failures**:
   - Check Node.js version (uses latest in CI)
   - Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`

3. **API errors during development**:
   - Ensure VITE_GITHUB_TOKEN is set in .env
   - Use mock data in tests instead of real API calls

4. **Tailwind CSS issues**:
   - Uses Tailwind v4 with Vite plugin
   - No separate PostCSS config needed
   - Import in `src/styles.css`: `@import "tailwindcss";`

5. **Spell check failures**:
   - Add unknown technical terms to `cspell.yaml` under `words:` section
   - Common words to add: component names, API terms, test data names

## Project-Specific Guidelines

### Package Manager:

- **ALWAYS use npm**, never pnpm (project requirement)
- Delete pnpm-lock.yaml if present

### Code Organization:

- Container/Presentational pattern for components
- UI-only components end with `*UI.tsx`
- Data fetching in Container components

### Router Architecture:

- Parent: `src/routes/issues.tsx` (layout + search validation)
- Index: `src/routes/issues.index.tsx` (issues list)
- Detail: `src/routes/issues.$issueNumber.tsx` (issue detail)

### Search Implementation:

- GitHub-like query parser in `src/lib/searchParser.ts`
- Supports: `is:open`, `is:closed`, `is:all`, `author:username`
- Free text searches title and body (client-side filtering)

### API Integration:

- Issue updates: `PATCH /repos/{owner}/{repo}/issues/{issue_number}`
- Comment updates: `PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}`
- Optimistic updates with rollback on failure

## Quick Reference

### Most Used Commands:

```bash
npm install                    # Install dependencies (60s)
npm run dev                   # Start dev server (port 5173)
npm run build                 # Build for production (4 min)
npm run lint                  # Check code quality (fast)
npm run test                  # Run unit tests (1 min)
npm run test:e2e             # Run E2E tests (15 min)
```

### File Extensions by Test Type:

- `.test.ts` files → Vitest unit tests
- `.spec.ts` files (in tests/) → Playwright E2E tests

### Critical Validation Sequence:

1. Run all commands with appropriate timeouts
2. Test homepage and navigation manually
3. Verify localStorage persistence works
4. Check that build produces no errors
5. Ensure all tests pass before committing
