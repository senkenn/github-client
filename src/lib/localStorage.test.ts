import { describe, it, expect, beforeEach, vi } from "vitest";
import { saveOwnerRepo, loadOwnerRepo, clearOwnerRepo } from "./localStorage";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// Mock global objects
Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Ensure test runs as a DOM environment
vi.stubGlobal("window", globalThis);

describe("localStorage utilities", () => {
  beforeEach(() => {
    // Clear the store and reset mocks before each test
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe("saveOwnerRepo", () => {
    it("should save owner and repo to localStorage", () => {
      saveOwnerRepo("microsoft", "vscode");

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "github_owner",
        "microsoft",
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "github_repo",
        "vscode",
      );
    });

    it("should save empty strings", () => {
      saveOwnerRepo("", "");

      expect(localStorageMock.setItem).toHaveBeenCalledWith("github_owner", "");
      expect(localStorageMock.setItem).toHaveBeenCalledWith("github_repo", "");
    });
  });

  describe("loadOwnerRepo", () => {
    it("should load stored values from localStorage", () => {
      // Setup stored values
      localStorageMock.setItem("github_owner", "octocat");
      localStorageMock.setItem("github_repo", "Hello-World");

      const result = loadOwnerRepo();

      expect(result).toEqual({
        owner: "octocat",
        repo: "Hello-World",
      });
    });

    it("should return empty strings when no values are stored", () => {
      const result = loadOwnerRepo();

      expect(result).toEqual({
        owner: "",
        repo: "",
      });
    });

    it("should return empty strings when localStorage returns null", () => {
      // Mock getItem to return null
      localStorageMock.getItem.mockReturnValue(null);

      const result = loadOwnerRepo();

      expect(result).toEqual({
        owner: "",
        repo: "",
      });
    });
  });

  describe("clearOwnerRepo", () => {
    it("should remove owner and repo from localStorage", () => {
      clearOwnerRepo();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("github_owner");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("github_repo");
    });
  });
});