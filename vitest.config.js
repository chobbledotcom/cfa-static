import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { COVERAGE_IGNORE } from "./test/coverage-ignore.js";

const NO_NAV = {
  disableMainFrameNavigation: true,
  disableChildFrameNavigation: true,
  disableChildPageNavigation: true,
};

export default defineConfig({
  resolve: {
    alias: {
      // uwrap publishes only a "module" entry; vite's SSR resolution wants
      // "main"/"exports", so point straight at the file.
      uwrap: fileURLToPath(
        new URL("./node_modules/uwrap/dist/uWrap.mjs", import.meta.url),
      ),
    },
  },
  test: {
    include: ["test/**/*.test.js"],
    // Integration tests spawn child Eleventy builds; unbounded worker
    // parallelism stacks those on top of vitest's own processes and starves
    // file handles under load. Half the cores keeps runs deterministic.
    maxWorkers: "50%",
    environment: "happy-dom",
    environmentOptions: {
      happyDOM: {
        settings: {
          disableCSSFileLoading: true,
          disableJavaScriptFileLoading: true,
          disableJavaScriptEvaluation: true,
          disableIframePageLoading: true,
          disableComputedStyleRendering: true,
          navigation: NO_NAV,
        },
      },
    },
    setupFiles: ["./test/ensure-deps.js"],
    globalSetup: ["./test/global-teardown.js"],
    testTimeout: 1500,
    coverage: {
      // Istanbul instruments the transformed source, so hit counts merge
      // exactly across workers. The v8 provider keys function tables to
      // each worker's vite transform variant, and the merged report showed
      // phantom misses for functions the tests demonstrably execute.
      provider: "istanbul",
      // Report only files the tests actually load
      // (all: false), and require full line/function coverage of them.
      all: false,
      reporter: ["lcov", "text-summary"],
      reportsDirectory: "./coverage",
      exclude: ["**/node_modules/**", ...COVERAGE_IGNORE],
      thresholds: { lines: 100, functions: 100 },
    },
  },
});
