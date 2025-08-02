import {
  afterMount,
  beforeMount,
} from "@playwright/experimental-ct-react/hooks";

// Apply styles for component testing
beforeMount(async () => {
  // You can add any global setup here, such as importing global CSS
  // For now, keep it simple
});

afterMount(async () => {
  // Any cleanup after mount
});
