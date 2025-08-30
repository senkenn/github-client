# Repository Guidelines

## Project Structure & Modules
- `src/` — app code.
  - `components/` React UI (PascalCase files, e.g., `IssueDetail.tsx`).
  - `lib/` utilities/API (camelCase, e.g., `dateUtils.ts`).
  - `routes/` TanStack Router files (use route file patterns like `issues.$issueNumber.tsx`, `index.tsx`).
  - `routeTree.gen.ts` is generated — do not edit.
- `tests/` — Playwright E2E specs (`*.spec.ts`).
- `public/` assets, `img/` docs images.
- `.github/` CI and templates; `lefthook.yaml` pre-commit hooks.

## Build, Test, and Development
- `npm run dev` — start Vite dev server (http://localhost:5173).
- `npm run build` — type-check and production build to `dist/`.
- `npm run preview` — serve built app locally.
- `npm run lint` / `lint:fix` — Biome lint/format (autofix).
- `npm test` — unit tests (Vitest). `npm run test:e2e` — E2E (Playwright).
- Chat/log-friendly variants: `build:log`, `lint:log`, `test:log`, `test:e2e:log` (see logs in `*.log`).
- Docker: `docker compose up -d` (builds then serves on 7777). Requires `.env` with `VITE_GITHUB_TOKEN`.

## Coding Style & Naming
- Language: TypeScript + React.
- Formatting/Linting: Biome (spaces, organized imports, recommended rules). No manual formatting in PRs.
- Prefer functional components, hooks, and explicit types.
- Naming: components PascalCase; utilities camelCase; tests mirror source names (`mdHtmlUtils.test.ts`).

## Testing Guidelines
- Unit: Vitest for `src/lib/**`. Name files `*.test.ts` near source.
- E2E: Playwright in `tests/**.spec.ts`. Keep tests independent; use selectors by role/text.
- Run locally before pushing: `npm run lint && npm test && npm run test:e2e`.

## Commit & Pull Requests
- Commits: imperative mood, concise summary, optional scope (e.g., `editor:`). Example: `Add clipboard image paste to TipTap`.
- PRs: clear description, link issues (`Fixes #123`), include screenshots/GIFs for UI, and note test coverage or added tests.
- CI must pass (Biome, Vitest, Playwright). Pre-commit hooks run Biome, cspell, and scoped tests.

## Security & Config
- Do not commit secrets. Use `.env` for `VITE_GITHUB_TOKEN`.
- Octokit calls may hit rate limits without a token; degrade gracefully in dev.
