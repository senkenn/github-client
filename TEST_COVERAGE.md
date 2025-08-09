# Test Coverage for Pull Request Filtering

This document explains the comprehensive test coverage added for the pull request filtering functionality.

## Overview

Tests have been added to verify that the GitHub issues list correctly filters out pull requests, as GitHub's REST API includes pull requests in the `/repos/{owner}/{repo}/issues` endpoint by default.

## Test Files Added

### 1. Unit Tests: `src/lib/github.test.ts`

**Purpose**: Tests the core filtering logic in the `getIssues()` function.

**Key Test Cases**:
- ✅ **Filter out pull requests**: Verifies that items with `pull_request` property are excluded
- ✅ **Keep actual issues**: Verifies that items without `pull_request` property are included
- ✅ **Handle mixed responses**: Tests scenarios with both issues and PRs in API response
- ✅ **Return empty array**: When all items are pull requests
- ✅ **Fallback behavior**: Ensures mock data is returned when API fails
- ✅ **Default parameters**: Tests that default owner/repo are used when not specified

### 2. Component Tests: `src/components/IssuesList.test.tsx`

**Purpose**: Tests the React component that displays the filtered issues.

**Key Test Cases**:
- ✅ **Display filtered data**: Verifies component renders only actual issues
- ✅ **Loading state**: Tests that loading spinner is shown during data fetch
- ✅ **Empty state**: Tests "No issues found" message when no issues exist
- ✅ **Error handling**: Verifies graceful error handling and console logging
- ✅ **Link generation**: Tests correct URLs for issue detail pages
- ✅ **Date formatting**: Verifies dates are displayed in correct format
- ✅ **State badges**: Tests that open/closed status badges are styled correctly
- ✅ **Filtering demonstration**: Shows that only filtered results are displayed

### 3. Playwright Component Tests: `src/components/IssuesList.spec.tsx`

**Purpose**: End-to-end component testing using Playwright Component Testing framework.

**Key Test Cases**:
- ✅ **Visual rendering**: Tests component appearance with filtered data
- ✅ **User interactions**: Tests clicking on issue links and navigation
- ✅ **API mocking**: Demonstrates filtering with realistic GitHub API responses
- ✅ **Integration scenarios**: Tests different repository configurations

## Test Configuration

### Vitest (Unit Tests)
- Environment: jsdom for React component testing
- Mocking: GitHub API responses via vi.mock()
- Coverage: Unit tests for filtering logic and component behavior

### Playwright (Component Tests)
- Environment: Real browser for E2E component testing
- Mocking: Network-level API response interception
- Coverage: User interaction flows and visual validation

## Running Tests

```bash
# Run all unit tests
npm test

# Run Playwright component tests (requires browser installation)
npm run test:ct

# Run all tests
npm run test:all
```

## Test Data Structure

Tests use realistic GitHub API response structures:

```typescript
// Issue (should be included)
{
  id: 1,
  number: 123,
  title: "Feature Request",
  // ... other properties
  // No pull_request property
}

// Pull Request (should be filtered out)
{
  id: 2,
  number: 124,
  title: "Fix: Update dependencies",
  // ... other properties
  pull_request: {
    url: "https://api.github.com/repos/owner/repo/pulls/124",
    html_url: "https://github.com/owner/repo/pull/124",
    // ... other PR-specific properties
  }
}
```

## Coverage Summary

- **✅ 5 unit tests** for `getIssues()` function filtering logic
- **✅ 8 component tests** for `IssuesList` React component
- **✅ Multiple test scenarios** covering edge cases and error conditions
- **✅ API mocking** to simulate GitHub responses with mixed issues/PRs
- **✅ Error handling** verification for network failures
- **✅ UI state testing** (loading, empty, error states)

All tests verify that pull requests are properly filtered out and only actual GitHub issues are displayed to users.