# GitHub Client

Edit GitHub Issues using a WYSIWYG editor.

<img width="1096" height="807" alt="GitHub Issues WYSIWYG Editor Interface" src="https://github.com/user-attachments/assets/ff454822-d815-4141-a3bb-6a1b282a2f80" />


## Features

- Browse and search GitHub issues with advanced filtering
- Edit issue descriptions and comments using a rich text editor
- Support for GitHub-style markdown rendering
- Real-time search with GitHub-like query syntax
- Responsive design with modern UI components
- Optimistic updates with automatic rollback on errors

## Quick Start

Local development

```bash
git clone https://github.com/senkenn/github-client.git
cd github-client
npm install
echo VITE_GITHUB_TOKEN=$(gh auth token) > .env
npm run dev
```

Open `http://localhost:5173`.

Docker (serves on 7777)

```bash
git clone https://github.com/senkenn/github-client.git
cd github-client
echo VITE_GITHUB_TOKEN=$(gh auth token) > .env
docker compose up -d
```

Open `http://localhost:7777`.

### Browser setup (CDP)

This app proxies some GitHub resources via Playwright using Chrome DevTools Protocol (CDP) to reuse your logged‑in GitHub cookies during development.

- Launch a Chromium‑based browser (Chrome/Chromium/Edge/Brave, etc.) with CDP enabled. Use whichever binary you have:

  ```bash
  # Linux examples (pick one you have)
  google-chrome --remote-debugging-port=9222 --disable-features=DevToolsDebuggingRestrictions
  chromium       --remote-debugging-port=9222 --disable-features=DevToolsDebuggingRestrictions
  chromium-browser --remote-debugging-port=9222 --disable-features=DevToolsDebuggingRestrictions
  microsoft-edge --remote-debugging-port=9222 --disable-features=DevToolsDebuggingRestrictions
  brave          --remote-debugging-port=9222 --disable-features=DevToolsDebuggingRestrictions
  ```

  macOS:

  ```bash
  open -a "Google Chrome" --args --remote-debugging-port=9222 --disable-features=DevToolsDebuggingRestrictions
  ```

  Windows (PowerShell):

  ```powershell
  # Chrome
  & "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --remote-debugging-port=9222 --disable-features=DevToolsDebuggingRestrictions

  # Edge (path may be in Program Files or Program Files (x86))
  & "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe" --remote-debugging-port=9222 --disable-features=DevToolsDebuggingRestrictions

  # Brave
  & "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe" --remote-debugging-port=9222 --disable-features=DevToolsDebuggingRestrictions
  ```

  - Separate profile (PowerShell): `--user-data-dir="$env:LOCALAPPDATA\chrome-remote\dev"`
  - For CMD: wrap paths in double quotes and use `%LOCALAPPDATA%` for environment variables.

- If another instance is already running, use a separate profile: `--user-data-dir="$HOME/.cache/chrome-remote/dev"` and log in to GitHub in that window.
- Optional `.env`: `PW_CDP_URL=http://127.0.0.1:9222` (or `PW_CDP_PORTS=9222`).
- Verify: `curl http://127.0.0.1:9222/json/version` should return a `webSocketDebuggerUrl`.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run linter (Biome)
- `npm run lint:fix` - Fix linting issues
- `npm run test` - Run unit tests (Vitest)
- `npm run test:e2e` - Run E2E tests (Playwright)

### Testing

- Unit: Vitest for utilities and business logic
- E2E: Playwright for routing and interactions

Run locally before pushing:

```bash
npm run lint && npm test && npm run test:e2e
```

### Architecture

- Frontend: React + TypeScript + TanStack Router
- Styling: Tailwind CSS v4
- Editor: Tiptap rich text editor
- API: GitHub REST API via Octokit
- Testing: Vitest (unit), Playwright (E2E)

### Key Components

- `IssueDetail.tsx` - Issue view with editing
- `IssuesList.tsx` / `IssuesListUI.tsx` - Issue list + filters
- `FilterBar.tsx` - GitHub-style search
- `TiptapEditor.tsx` - Rich text editor

### Troubleshooting

- `pw-fetch error: No github.com cookies` → Start Chrome with CDP and log in to GitHub (see Browser setup). If using a new `--user-data-dir`, log in there.
- `/json/version` shows `HeadlessChrome` → Start a normal Chrome window (GUI) and point `PW_CDP_URL` to that port, e.g. 9223.
- `404 Not Found` for CDP WebSocket → Chrome restarted; the middleware reconnects automatically. Restart dev server if issues persist.

### Security

- Do not commit secrets. Keep `.env` out of version control.
- Without `VITE_GITHUB_TOKEN`, you may hit GitHub API rate limits during development.
