# localStorage Persistence Tests

This directory contains comprehensive Playwright E2E tests that verify the localStorage persistence functionality for the owner/repo form inputs.

## Test Coverage

The test suite (`localStorage.spec.ts`) includes the following test cases:

1. **Save values to localStorage as user types** - Verifies that form input values are automatically saved to localStorage when the user enters data
2. **Restore values after page reload** - Tests that values are properly restored from localStorage when the page is refreshed
3. **Update localStorage when values change** - Ensures that localStorage is updated when the user modifies existing input values
4. **Handle empty localStorage gracefully** - Verifies the application works correctly when no localStorage values exist
5. **Pre-populate form with existing values** - Tests that the form is pre-filled when localStorage already contains values
6. **Persist values during character-by-character typing** - Ensures real-time persistence as users type naturally
7. **Maintain values across browser sessions** - Simulates browser session persistence

## How to Run the Tests

### Prerequisites

1. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

### Running the Tests

1. **Run only the localStorage tests:**
   ```bash
   npm run test:local
   ```

2. **Run all E2E tests:**
   ```bash
   npm run test:e2e
   ```

3. **Run tests in headed mode (visible browser):**
   ```bash
   npx playwright test tests/localStorage.spec.ts --headed
   ```

4. **Run tests with debug mode:**
   ```bash
   npx playwright test tests/localStorage.spec.ts --debug
   ```

### Test Environment

- The tests use the development server (http://localhost:5173)
- The dev server is automatically started before tests run
- Each test starts with a clean localStorage state
- Tests use the actual localStorage implementation in the browser

## Technical Implementation

The tests interact with:
- Input fields with IDs `owner` and `repo`
- localStorage keys: `github_owner` and `github_repo`
- The React useEffect hooks that handle localStorage operations

These tests simulate real user interactions and verify the complete localStorage workflow from user input to persistence and restoration.