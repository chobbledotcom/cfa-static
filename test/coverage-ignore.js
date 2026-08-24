/**
 * Files excluded from coverage thresholds.
 *
 * - ensure-deps.js: defensive code that can't be meaningfully tested
 * - validated-config.js: module-load-time validation that can only fail if config files are misconfigured
 * - customise-cms cli-io.js/config.js/fields.js/generator.js: CLI scripts with hard-to-test file system operations
 * - image.js, image-crop.js, image-external.js: error handling for external library edge cases
 * - console.js: console output utilities
 * - test-runner-utils.js, test-utils.js, js-toolkit/test-utils: test infrastructure
 * - on-ready.js: document.readyState branch requires complex mocking
 * - search.js: dynamic import("/pagefind/pagefind.js") only resolves against built site
 * - screenshot.js, screenshots.js, lighthouse.js, browser-utils.js: Playwright/Chrome browser automation
 *
 * Shared by vitest.config.js (coverage.exclude) and the per-file lcov gap
 * report in test-runner-utils.js, so the two never drift.
 */
export const COVERAGE_IGNORE = [
  ".cache/**",
  "test/ensure-deps.js",
  "src/_lib/config/validated-config.js",
  "src/_lib/public/utils/on-ready.js",
  "src/_lib/public/ui/decrypt-text.js",
  "src/_lib/public/ui/search.js",
  "scripts/mutation.js",
  "scripts/mutation/runner.js",
  "test/precommit/colors.js",
  "scripts/customise-cms/cli-io.js",
  "scripts/customise-cms/config.js",
  "scripts/customise-cms/fields.js",
  "scripts/customise-cms/generator.js",
  "src/_lib/media/image.js",
  "src/_lib/media/image-crop.js",
  "src/_lib/media/image-external.js",
  "src/_lib/utils/console.js",
  "test/test-runner-utils.js",
  "test/test-utils.js",
  "packages/js-toolkit/test-utils/**",
  "test/unit/code-quality/code-quality-utils.js",
  "src/_lib/eleventy/screenshots.js",
  "src/_lib/media/screenshot.js",
  "src/_lib/media/browser-utils.js",
  "src/_lib/media/lighthouse.js",
];
