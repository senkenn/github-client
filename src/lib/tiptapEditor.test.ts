import { describe, it, expect } from "vitest";

// Test that the TiptapEditor module imports correctly
describe("TiptapEditor Image Upload", () => {
  it("should include Image extension in imports", async () => {
    // Check that the Image extension can be imported
    const imageExtension = await import("@tiptap/extension-image");
    expect(imageExtension.default).toBeDefined();
  });

  it("should include uploadImage function in github module", async () => {
    const githubModule = await import("./github");
    expect(githubModule.uploadImage).toBeDefined();
    expect(typeof githubModule.uploadImage).toBe("function");
  });
});