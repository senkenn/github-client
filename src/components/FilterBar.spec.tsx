import { expect, test } from "@playwright/experimental-ct-react";
import { FilterBar } from "./FilterBar";

test("should render FilterBar with default state", async ({ mount }) => {
  const component = await mount(
    <FilterBar
      currentState="open"
      currentSearch=""
      currentAuthor=""
      owner="test-owner"
      repo="test-repo"
    />,
  );

  // Check that search input is present
  await expect(
    component.locator('input[placeholder="Search issues..."]'),
  ).toBeVisible();

  // Check that author input is present
  await expect(component.locator('input[placeholder="Author"]')).toBeVisible();

  // Check that state filter tabs are present
  await expect(
    component.locator('button:has-text("Open Issues")'),
  ).toBeVisible();
  await expect(
    component.locator('button:has-text("Closed Issues")'),
  ).toBeVisible();
  await expect(
    component.locator('button:has-text("All Issues")'),
  ).toBeVisible();

  // Check that "Open Issues" is active by default
  await expect(component.locator('button:has-text("Open Issues")')).toHaveClass(
    /bg-white/,
  );
});

test("should display active filters", async ({ mount }) => {
  const component = await mount(
    <FilterBar
      currentState="closed"
      currentSearch="test search"
      currentAuthor="testuser"
      owner="test-owner"
      repo="test-repo"
    />,
  );

  // Check that search filter is displayed
  await expect(component.locator('text=Search: "test search"')).toBeVisible();

  // Check that author filter is displayed
  await expect(component.locator("text=Author: testuser")).toBeVisible();

  // Check that "Closed Issues" is active
  await expect(
    component.locator('button:has-text("Closed Issues")'),
  ).toHaveClass(/bg-white/);
});

test("should show clear button when filters are active", async ({ mount }) => {
  const component = await mount(
    <FilterBar
      currentState="all"
      currentSearch="test"
      currentAuthor=""
      owner="test-owner"
      repo="test-repo"
    />,
  );

  // Clear button should be visible when search is present or state is not "open"
  await expect(component.locator('button:has-text("Clear")')).toBeVisible();
});

test("should not show clear button with default filters", async ({ mount }) => {
  const component = await mount(
    <FilterBar
      currentState="open"
      currentSearch=""
      currentAuthor=""
      owner="test-owner"
      repo="test-repo"
    />,
  );

  // Clear button should not be visible with default state
  await expect(component.locator('button:has-text("Clear")')).not.toBeVisible();
});
