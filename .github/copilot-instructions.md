# GitHub Client - WYSIWYG GitHub Issues Editor

GitHub Client is a React + TypeScript web application that provides a WYSIWYG editor for GitHub Issues. It supports GitHub-like search syntax, localStorage persistence, and real-time issue editing.

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

Activate project github-client.

## ⚠️ CRITICAL CHAT RESTRICTIONS

**NEVER DO THESE IN CHAT SESSIONS:**

- ❌ Use `sleep` command (unnecessary delay)
- ❌ Restart development server (`npm run dev`, `kill vite`, etc.)
- ❌ Execute `npm run dev` in chat (should be run manually)
- ❌ Use blocking commands without `:log` variants

**WHY:** These commands block chat output and cause unnecessary delays.

## Quick Setup

```bash
# CRITICAL: Use npm, NOT pnpm (project requirement)
npm install
npx playwright install  # Required for E2E tests

# Development server (check if running first)
ps aux | grep "vite" | grep -v grep || npm run dev  # Port 5173

# Docker alternative
echo "VITE_GITHUB_TOKEN=$(gh auth token)" > .env
docker compose up -d  # Port 7777
```

## Critical Commands for Chat Sessions

**⚠️ ALWAYS use `:log` variants in chat sessions to ensure output visibility:**

```bash
# Validation commands (MUST pass before committing)
npm run lint:log     # Code quality check → lint.log
npm run test:log     # Unit tests → test.log
npm run test:e2e:log # E2E tests → e2e.log
npm run build:log    # Production build → build.log

# Review results
cat lint.log && cat test.log && cat e2e.log

# Check running processes
jobs                                     # Background jobs
ps aux | grep playwright | grep -v grep # E2E test status
```

**Never use:**

- Blocking commands without `:log` variants (blocks output)
- Background processes or server restarts in chat sessions

## Technical Debt Prevention

**MANDATORY after any code implementation:**

```bash
# ALWAYS run these validation commands after code changes
npm run lint:log     # Check for code quality issues
npm run test:log     # Verify unit tests pass
npm run test:e2e:log # Ensure E2E tests pass

# Review all results
cat lint.log && cat test.log && cat e2e.log
```

**Purpose:** Prevent technical debt by catching issues early:

- **Lint errors**: Code style, potential bugs, unused variables
- **Unit test failures**: Broken logic, type errors, edge cases
- **E2E test failures**: UI regressions, integration issues

**NEVER commit code without running these validation steps.**

## Manual Validation Workflow

After making changes, test these critical user flows:

1. **Homepage**: Navigate to http://localhost:5173/ → Enter owner/repo → Click "Issues を表示" → Should navigate to /issues
2. **Persistence**: Enter values → Refresh page → Values should persist
3. **Search**: Enter `is:closed author:testuser bug fix` → Verify URL params and filter tags
4. **Navigation**: All links work, no broken routes

**Expected**: UI functions normally. API errors are OK without GitHub token.

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

1. **Playwright browser download fails**: `npx playwright install --with-deps`
2. **Build failures**: Clear node_modules: `rm -rf node_modules package-lock.json && npm install`
3. **API errors**: Ensure VITE_GITHUB_TOKEN is set in .env
4. **Tailwind CSS issues**: Uses v4 with Vite plugin, import in `src/styles.css`: `@import "tailwindcss";`
5. **Spell check failures**: Add technical terms to `cspell.yaml` under `words:` section

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

1. **Technical Debt Check**: `npm run lint:log && npm run test:log && npm run test:e2e:log`
2. **Review Results**: `cat lint.log && cat test.log && cat e2e.log`
3. **Manual Testing**: Test critical user flows (homepage, persistence, search, navigation)
4. **Build Verification**: `npm run build:log` - Ensure production build succeeds
5. **Final Check**: All tests pass, no lint errors, UI functions normally

**⚠️ NEVER skip step 1-2. Technical debt accumulates quickly without validation.**
