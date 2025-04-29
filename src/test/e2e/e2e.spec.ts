import { describe, beforeAll, afterAll, beforeEach } from "vitest";
import { startServer, stopServer, wait } from "./server";

// Import test suites
import { apiTests } from "./suites/api.suite";
import { authTests } from "./suites/auth.suite";
import { projectTests } from "./suites/project.suite";
import { analysisTests } from "./suites/analysis.suite";

// Start the server once for all tests
beforeAll(async () => {
  await startServer();
  // Wait for server to be fully ready
  await wait(1000);
});

// Stop the server after all tests
afterAll(async () => {
  await stopServer();
  // Additional wait to ensure port is released
  await wait(2000);
});

// Add a separator between tests for better readability
beforeEach(async () => {
  await wait(100); // Small delay between tests
});

describe("E2E Tests", () => {
  // Run all test suites
  apiTests();
  authTests();
  projectTests();
  analysisTests();
});
