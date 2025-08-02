/**
 * Utility functions for localStorage operations
 */

const STORAGE_KEYS = {
  GITHUB_OWNER: "github_owner",
  GITHUB_REPO: "github_repo",
} as const;

/**
 * Safely checks if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = "__localStorage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Saves owner and repo values to localStorage
 */
export function saveOwnerRepo(owner: string, repo: string): void {
  if (!isLocalStorageAvailable()) return;

  try {
    localStorage.setItem(STORAGE_KEYS.GITHUB_OWNER, owner);
    localStorage.setItem(STORAGE_KEYS.GITHUB_REPO, repo);
  } catch (error) {
    console.warn("Failed to save to localStorage:", error);
  }
}

/**
 * Loads owner and repo values from localStorage
 */
export function loadOwnerRepo(): { owner: string; repo: string } {
  if (!isLocalStorageAvailable()) {
    return { owner: "", repo: "" };
  }

  try {
    const owner = localStorage.getItem(STORAGE_KEYS.GITHUB_OWNER) || "";
    const repo = localStorage.getItem(STORAGE_KEYS.GITHUB_REPO) || "";
    return { owner, repo };
  } catch (error) {
    console.warn("Failed to load from localStorage:", error);
    return { owner: "", repo: "" };
  }
}

/**
 * Clears stored owner and repo values
 */
export function clearOwnerRepo(): void {
  if (!isLocalStorageAvailable()) return;

  try {
    localStorage.removeItem(STORAGE_KEYS.GITHUB_OWNER);
    localStorage.removeItem(STORAGE_KEYS.GITHUB_REPO);
  } catch (error) {
    console.warn("Failed to clear localStorage:", error);
  }
}
