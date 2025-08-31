/**
 * Utilities for handling GitHub user-attachments URLs.
 */

// Example: https://github.com/user-attachments/assets/dceb430a-7e82-42b0-83e9-b623d15b32b0
export const githubAttachmentRegex =
  /https:\/\/github\.com\/user-attachments\/assets\/[a-zA-Z0-9-]+/;

/**
 * Returns true if the URL looks like a GitHub user-attachments asset URL.
 */
export function isGithubAttachmentUrl(url: string): boolean {
  return githubAttachmentRegex.test(url);
}

/**
 * Add `download=1` to the URL to encourage a direct asset redirect, which
 * works more reliably for <img src> without triggering CORS errors.
 */
export function normalizeGithubAttachmentUrl(url: string): string {
  if (!isGithubAttachmentUrl(url)) return url;

  const hasDownload = /[?&]download=1(?!\d)/.test(url);
  if (hasDownload) return url;

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}download=1`;
}

/**
 * In dev, route attachment URLs through the Vite dev API (/api/pw-fetch)
 * so that requests include Authorization and avoid CORS issues for private assets.
 * Raw HTML <img> should not be rewritten automatically; this is intended for
 * plain-URL paste handling.
 */
export function toProxiedGithubUrl(url: string): string {
  // Only rewrite GitHub attachment URLs
  if (!isGithubAttachmentUrl(url)) return url;
  try {
    const u = new URL(url);
    return `/api/pw-fetch?url=${encodeURIComponent(
      `${u.origin}${u.pathname}${u.search}${u.hash}`,
    )}`;
  } catch {
    return url;
  }
}

// Backward-compatible alias
export const toProxiedGithubUrlIfDev = toProxiedGithubUrl;
