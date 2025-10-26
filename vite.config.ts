/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import tanstackRouter from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const PW_CDP_URL = env.PW_CDP_URL || process.env.PW_CDP_URL || "";
  const PW_CDP_PORTS = (env.PW_CDP_PORTS || process.env.PW_CDP_PORTS || "")
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));

  let cachedCookieHeader = "";
  let cachedAt = 0;
  let resolvedCdpWsUrl = "";

  async function fetchWsFromHttp(base: string): Promise<string> {
    const url = base.endsWith("/json/version")
      ? base
      : `${base.replace(/\/$/, "")}/json/version`;
    const controller = new AbortController();
    try {
      const t = setTimeout(() => controller.abort(), 500);
      const res = await fetch(url, {
        signal: controller.signal,
      } as RequestInit);
      clearTimeout(t);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} from ${url}`);
      }
      const data = (await res.json()) as { webSocketDebuggerUrl?: string };
      if (!data.webSocketDebuggerUrl) {
        throw new Error(`Missing webSocketDebuggerUrl in ${url}`);
      }
      return data.webSocketDebuggerUrl;
    } catch (e) {
      console.error(`[pw-fetch] CDP version fetch failed for ${url}:`, e);
      throw e;
    }
  }

  async function resolveCdpWs(): Promise<string> {
    if (resolvedCdpWsUrl) return resolvedCdpWsUrl;
    const attempts: string[] = [];

    // If PW_CDP_URL explicitly provided
    if (PW_CDP_URL) {
      if (PW_CDP_URL.startsWith("ws")) {
        resolvedCdpWsUrl = PW_CDP_URL;
        return resolvedCdpWsUrl;
      }
      const candidate = PW_CDP_URL.match(/^\d+$/)
        ? `http://127.0.0.1:${PW_CDP_URL}`
        : PW_CDP_URL.match(/^([\w.-]+):(\d{2,5})$/)
          ? `http://${PW_CDP_URL}`
          : PW_CDP_URL;
      if (candidate.startsWith("http")) {
        attempts.push(candidate);
        try {
          const found = await fetchWsFromHttp(candidate);
          resolvedCdpWsUrl = found;
          return resolvedCdpWsUrl;
        } catch {}
      }
    }

    // Auto-discover common ports
    const hosts = ["127.0.0.1", "localhost"];
    const ports = PW_CDP_PORTS.length > 0 ? PW_CDP_PORTS : [9222, 9223];
    for (const host of hosts) {
      for (const port of ports) {
        const base = `http://${host}:${port}`;
        attempts.push(base);
        try {
          const found = await fetchWsFromHttp(base);
          resolvedCdpWsUrl = found;
          return resolvedCdpWsUrl;
        } catch {}
      }
    }

    const msg = `Failed to discover CDP WebSocket URL. Tried: ${attempts.join(
      ", ",
    )}. Set PW_CDP_URL or start your chromium browser with --remote-debugging-port.`;
    console.error(`[pw-fetch] ${msg}`);
    throw new Error(msg);
  }

  async function getGithubCookieHeader(): Promise<string> {
    const now = Date.now();
    if (cachedCookieHeader && now - cachedAt < 30_000)
      return cachedCookieHeader;

    const { chromium } = await import("playwright");
    const pairs: Array<{ name: string; value: string }> = [];

    // Helper to connect and read cookies from all contexts, ensuring cleanup
    const tryConnectAndRead = async (wsUrl: string) => {
      let browser: any;
      try {
        browser = await chromium.connectOverCDP(wsUrl);
        const contexts = browser.contexts();
        for (const ctx of contexts) {
          try {
            const cookies = await ctx.cookies("https://github.com");
            console.log("Found cookies:", cookies);
            for (const c of cookies)
              pairs.push({ name: c.name, value: c.value });
          } catch (e) {
            console.error(
              "[pw-fetch] Failed to read cookies from a browser context:",
              e,
            );
          }
        }
      } finally {
        try {
          await browser?.close();
        } catch {}
      }
    };

    // First attempt with cached/discovered WS URL; if it fails (e.g. 404 because
    // Your chromium browser restarted and WS id changed), clear cache and retry once.
    try {
      const ws1 = await resolveCdpWs();
      await tryConnectAndRead(ws1);
    } catch (e) {
      console.warn("[pw-fetch] CDP connect failed, retrying discovery:", e);
      resolvedCdpWsUrl = "";
      const ws2 = await resolveCdpWs();
      await tryConnectAndRead(ws2);
    }
    if (pairs.length === 0) {
      throw new Error("No github.com cookies found via CDP.");
    }
    const header = pairs.map((c) => `${c.name}=${c.value}`).join("; ");
    cachedCookieHeader = header;
    cachedAt = now;
    return header;
  }

  function registerPwFetch(server: any, base: "dev" | "preview") {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      const url = req.url || "";
      if (!url.startsWith("/api/pw-fetch")) return next();
      try {
        const urlObj = new URL(
          url,
          base === "dev" ? "http://dev.local" : "http://preview.local",
        );
        const target = urlObj.searchParams.get("url");
        if (!target) {
          res.statusCode = 400;
          res.end("Missing url param");
          return;
        }
        const t = new URL(target);
        if (!["github.com", "www.github.com"].includes(t.hostname)) {
          res.statusCode = 400;
          res.end(`Only github.com is allowed, got ${t.hostname}`);
          return;
        }

        const cookie = await getGithubCookieHeader();
        if (!cookie) {
          res.statusCode = 401;
          res.end(
            "No GitHub cookies. Set GITHUB_COOKIE in .env or start your chromium browser with --remote-debugging-port (PW_CDP_URL/PW_CDP_PORTS).",
          );
          return;
        }

        const { request } = await import("playwright");
        const ctx = await request.newContext({
          extraHTTPHeaders: {
            "User-Agent": "github-client-app/1.0.0",
            Accept: "*/*",
            Referer: "https://github.com/",
            Cookie: cookie,
          },
        });
        const resp = await ctx.get(target, { timeout: 30_000 });
        const status = resp.status();
        const headers = resp.headers();
        const body = await resp.body();
        await ctx.dispose();

        res.statusCode = status;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Vary", "Authorization");
        if (headers["content-type"])
          res.setHeader("Content-Type", headers["content-type"]);
        if (headers["content-length"])
          res.setHeader("Content-Length", headers["content-length"]);
        if (headers["cache-control"])
          res.setHeader("Cache-Control", headers["cache-control"]);
        res.end(body);
      } catch (e) {
        res.statusCode = 500;
        res.end(
          `pw-fetch error: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    });
  }

  return {
    test: {
      globals: true,
      exclude: ["**/node_modules/**", "**/tests/**"],
    },
    plugins: [
      tanstackRouter({ autoCodeSplitting: true }),
      react(),
      tailwindcss(),
      {
        name: "pw-fetch-api",
        enforce: "pre",
        apply: () => true,
        configureServer(server) {
          registerPwFetch(server, "dev");
        },
        configurePreviewServer(server) {
          registerPwFetch(server, "preview");
        },
      },
    ],
  };
});
