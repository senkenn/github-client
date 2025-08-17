# GitHub Client - WYSIWYG GitHub Issues Editor

GitHub Client is a React + TypeScript web application that provides a WYSIWYG editor for GitHub Issues. It supports GitHub-like search syntax, localStorage persistence, and real-time issue editing.

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Bootstrap, Build, and Test:

```bash
# CRITICAL: Use npm, NOT pnpm (specified in project guidelines)
npm install

# Build the application
npm run build

# Run linting (uses Biome, not ESLint)
npm run lint

# Run unit tests (Vitest)
npm run test

# Run E2E tests (Playwright) - requires browser installation first
npx playwright install
npm run test:e2e
```

### Development Server:

```bash
# CRITICAL: NEVER restart the development server during testing or debugging
# The dev server should remain running throughout the entire development session
# Restarting can cause test failures and break ongoing work

# IMPORTANT: Always check if dev server is already running before starting
# Check running processes first:
ps aux | grep "vite" | grep -v grep  # Look for existing Vite processes
lsof -i :5173  # Check if port 5173 is already in use

# Start development server (only if not already running)
npm run dev  # Starts on http://localhost:5173

# If dev server is already running, use the existing instance instead of starting a new one
# DO NOT kill or restart the server unless absolutely necessary

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

1. **Code Quality**: `npm run lint:log` - Must pass before committing (outputs to lint.log)
2. **Unit Tests**: `npm run test:log` - Must pass (outputs to test.log)
3. **E2E Tests**: `npm run test:e2e:log` - Must pass (outputs to e2e.log)

### CRITICAL: Always use file output commands in chat sessions:

```bash
# ⚠️ CRITICAL: In chat sessions, ALWAYS use *:log npm scripts, NEVER use normal ones
# This is mandatory to ensure output visibility and prevent blocking

# Use these commands EVERY TIME in chat - they run in background and save to log files
npm run lint:log     # ✅ ALWAYS use this in chat (runs in background)
npm run test:log     # ✅ ALWAYS use this in chat (runs in background)
npm run test:e2e:log # ✅ ALWAYS use this in chat (runs in background)
npm run build:log    # ✅ ALWAYS use this in chat (runs in background)

# ❌ NEVER use these in chat sessions:
# npm run lint     # DON'T USE - blocks terminal and output not visible
# npm run test     # DON'T USE - blocks terminal and output not visible
# npm run test:e2e # DON'T USE - blocks terminal and output not visible
# npm run build    # DON'T USE - blocks terminal and output not visible

# All *:log commands automatically run in background with & and save output to files
# Check results with: cat <logfile>.log

# For commands without :log variant, use manual background execution:
<command> 2>&1 | tee <logfile> &
```

### IMPORTANT: Background execution for long-running commands:

```bash
# All *:log npm scripts automatically run in background and save to log files
# No need to manually add & - it's built into the scripts

npm run build:log     # Automatically runs in background, saves to build.log
npm run test:e2e:log  # Automatically runs in background, saves to e2e.log
npm run test:log      # Automatically runs in background, saves to test.log
npm run lint:log      # Automatically runs in background, saves to lint.log

# Check results:
cat build.log     # Review build results
cat e2e.log       # Review E2E test results
cat test.log      # Review unit test results
cat lint.log      # Review lint results

# Check if background jobs are still running:
jobs              # List active background jobs
ps aux | grep npm # Check for running npm processes

# For commands without :log variant, manually add background execution:
<command> 2>&1 | tee <logfile> &
```

### CRITICAL: Never use sleep commands:

```bash
# ❌ NEVER use sleep commands - they block the terminal unnecessarily
sleep 30 && tail -30 e2e.log  # DON'T DO THIS

# ✅ Use echo commands for polling instead
echo "Checking test status..." && ps aux | grep playwright | grep -v grep | wc -l
echo "Reviewing current results..." && tail -20 e2e.log

# ✅ For waiting on processes, use process monitoring
ps aux | grep playwright | grep -v grep  # Check if still running
jobs                                     # Check background jobs
tail -f e2e.log                         # Follow log in real-time (Ctrl+C to stop)
```

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

6. **Command execution results not visible in chat**:
   - When command output is not displayed or accessible in chat interface
   - **⚠️ CRITICAL: ALWAYS use \*:log npm scripts in chat sessions, NEVER normal ones**:

   ```bash
   # ✅ REQUIRED commands for all Copilot chat sessions:
   npm run build:log    # View build output logs (saves to build.log)
   npm run test:log     # View test execution logs (saves to test.log)
   npm run lint:log     # View lint results (saves to lint.log)
   npm run test:e2e:log # View E2E test execution logs (saves to e2e.log)

   # ❌ NEVER use these in chat sessions (they block and hide output):
   # npm run build, npm run test, npm run lint, npm run test:e2e

   # For other commands without :log variant:
   <command> 2>&1 | tee <filename>.log &
   ```

   - These commands save output to log files AND display in terminal
   - **REQUIRED for all Copilot chat sessions** to ensure output visibility
   - Log files can be reviewed with `cat <filename>.log`

## Type Safety Guidelines

### ❌ Avoid dangerous patterns:

- `as` type assertions (runtime type safety bypass)
- Complex type guards (maintenance overhead)

### ✅ Use safe patterns:

- `satisfies` operator for compile-time type checking
- Explicit property mapping from API responses
- Null/undefined safe handling with fallbacks

```typescript
// ❌ Dangerous - no runtime safety
return response.data as GitHubIssue[];

// ✅ Safe - compile-time + runtime safety
return response.data.map((item) => ({
  id: item.id,
  title: item.title,
  body: item.body || "",
  user: {
    login: item.user?.login || "unknown",
    avatar_url: item.user?.avatar_url || "",
  },
  // ... explicit mapping
})) satisfies GitHubIssue[];
```

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
                              # ⚠️ Always check if already running first!
npm run build                 # Build for production (4 min)
npm run lint                  # Check code quality (fast)
npm run test                  # Run unit tests (1 min)
npm run test:e2e             # Run E2E tests (15 min)
```

### Development Server Check Commands:

```bash
# Before running npm run dev, always check:
ps aux | grep "vite" | grep -v grep  # Check for running Vite process
lsof -i :5173                        # Check port 5173 usage
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
