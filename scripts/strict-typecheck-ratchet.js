#!/usr/bin/env node
/**
 * Strict typecheck ratchet - prevents strict type error regressions.
 *
 * Runs `tsc -p tsconfig.strict.json` and compares the reported errors
 * against the per-file baseline below:
 *   - files not listed must stay strict-clean (new files start clean)
 *   - a listed file must not exceed its baseline count
 *   - fewer errors than the baseline also fails, printing the corrected
 *     baseline ready to paste, so every win is locked in
 *
 * The baseline is the complete map of remaining strict debt; shrink it
 * file by file until it is empty.
 */

import { runIfMain } from "#scripts/lib/is-main-module.js";
import { runToolCapture } from "#scripts/lib/run-tool.js";
import { frozenObject } from "#toolkit/fp/object.js";

const STRICT_ERROR_BASELINE = frozenObject({
  ".eleventy.js": 3,
  "bin/profile-report.js": 1,
  "packages/js-toolkit/fp/array.js": 2,
  "scripts/build-metrics.js": 6,
  "scripts/cli-utils.js": 6,
  "scripts/cpd.js": 5,
  "scripts/customise-cms/blocks.js": 17,
  "scripts/customise-cms/cli.js": 25,
  "scripts/customise-cms/collection-config.js": 1,
  "scripts/customise-cms/collections.js": 1,
  "scripts/customise-cms/compact-yaml.js": 4,
  "scripts/customise-cms/components.js": 4,
  "scripts/customise-cms/prompts.js": 3,
  "scripts/eleventy-build.js": 11,
  "scripts/generate-blocks-reference.js": 8,
  "scripts/generate-pages-cms-types.js": 26,
  "scripts/internal-links.js": 24,
  "scripts/lib/colors.js": 6,
  "scripts/lighthouse.js": 13,
  "scripts/mutation.js": 21,
  "scripts/mutation/generate.js": 38,
  "scripts/mutation/ignore.js": 20,
  "scripts/mutation/runner.js": 31,
  "scripts/mutation/summary.js": 12,
  "scripts/screenshot.js": 21,
  "src/_lib/build/scss.js": 7,
  "src/_lib/collections/news.js": 1,
  "src/_lib/eleventy/blocks.js": 1,
  "src/_lib/eleventy/breadcrumbs.js": 7,
  "src/_lib/eleventy/collection-lookup.js": 1,
  "src/_lib/eleventy/file-utils.js": 7,
  "src/_lib/eleventy/filters.js": 2,
  "src/_lib/eleventy/html-transform.js": 7,
  "src/_lib/eleventy/screenshots.js": 11,
  "src/_lib/eleventy/style-bundle.js": 4,
  "src/_lib/eleventy/validate-collections.js": 17,
  "src/_lib/media/browser-utils.js": 14,
  "src/_lib/media/iconify.js": 4,
  "src/_lib/media/image-external.js": 9,
  "src/_lib/media/image-lqip.js": 2,
  "src/_lib/media/image-pipeline.js": 1,
  "src/_lib/media/image-utils.js": 2,
  "src/_lib/media/image.js": 2,
  "src/_lib/media/lighthouse.js": 13,
  "src/_lib/media/screenshot.js": 8,
  "src/_lib/media/thumbnail-placeholder.js": 2,
  "src/_lib/media/unused-images.js": 8,
  "src/_lib/transforms/external-links.js": 6,
  "src/_lib/transforms/read-more.js": 11,
  "src/_lib/utils/block-schema/shared.js": 1,
  "src/_lib/utils/collection-filter.js": 1,
  "src/_lib/utils/collection-utils.js": 2,
  "src/_lib/utils/git-dates.js": 10,
  "src/_lib/utils/html-tokenizer.js": 3,
});

/** Matches one `path(line,col): error TScode: message` diagnostic line. */
const ERROR_LINE = /^(.+?)\(\d+,\d+\): error TS\d+: /;

/**
 * Append one diagnostic line to its file's bucket.
 * @param {Map<string, string[]>} errorsByFile
 * @param {string} file
 * @param {string} line
 */
const recordError = (errorsByFile, file, line) => {
  const existing = errorsByFile.get(file);
  if (existing) existing.push(line);
  else errorsByFile.set(file, [line]);
};

/**
 * Group tsc diagnostic lines by the file they point at.
 * An "error TS" line with no file prefix is a project-level failure (bad
 * tsconfig, missing dependency), not type debt - those throw instead of
 * counting against the baseline.
 * @param {string} output
 * @returns {Map<string, string[]>}
 */
export const parseErrorsByFile = (output) => {
  const errorsByFile = new Map();
  for (const line of output.split("\n")) {
    const match = line.match(ERROR_LINE);
    if (match) {
      recordError(errorsByFile, match[1], line);
    } else if (line.includes("error TS")) {
      throw new Error(`tsc reported a project-level error: ${line}`);
    }
  }
  return errorsByFile;
};

/**
 * Compare actual per-file error counts against the baseline.
 * Also covers baseline entries for deleted or no-longer-checked files:
 * they report zero actual errors, so they surface as improvements and
 * force a baseline update.
 * @param {Map<string, string[]>} errorsByFile
 * @param {Record<string, number>} baseline
 */
export const compareToBaseline = (errorsByFile, baseline) => {
  const files = new Set([...errorsByFile.keys(), ...Object.keys(baseline)]);
  const compared = [...files].sort().map((file) => {
    const lines = errorsByFile.get(file);
    return {
      file,
      actual: lines ? lines.length : 0,
      allowed: file in baseline ? baseline[file] : 0,
    };
  });
  return {
    regressions: compared.filter(({ actual, allowed }) => actual > allowed),
    improvements: compared.filter(({ actual, allowed }) => actual < allowed),
  };
};

/**
 * Render the ready-to-paste baseline literal for the current errors.
 * @param {Map<string, string[]>} errorsByFile
 */
export const formatBaseline = (errorsByFile) => {
  const entries = [...errorsByFile.entries()]
    .map(([file, lines]) => `  "${file}": ${lines.length},`)
    .sort()
    .join("\n");
  return `const STRICT_ERROR_BASELINE = frozenObject({\n${entries}\n});`;
};

/**
 * @param {{ file: string, actual: number, allowed: number }[]} regressions
 * @param {Map<string, string[]>} errorsByFile
 * @returns {string[]}
 */
export const describeRegressions = (regressions, errorsByFile) => [
  `\n❌ Strict type errors above baseline in ${regressions.length} file(s):`,
  ...regressions.flatMap(({ file, actual, allowed }) => {
    const lines = errorsByFile.get(file);
    if (!lines) throw new Error(`No recorded errors for ${file}`);
    return [
      `\n   ${file}: ${actual} error(s), baseline ${allowed}`,
      ...lines.map((line) => `      ${line}`),
    ];
  }),
  "\n   Fix the new errors (JSDoc annotations usually suffice) -",
  "   the baseline only ever goes down.",
];

/**
 * @param {{ file: string, actual: number, allowed: number }[]} improvements
 * @param {Map<string, string[]>} errorsByFile
 * @returns {string[]}
 */
export const describeImprovements = (improvements, errorsByFile) => [
  `\n🎉 Strict errors dropped below baseline in ${improvements.length} file(s):`,
  ...improvements.map(
    ({ file, actual, allowed }) =>
      `   ${file}: ${actual} (baseline ${allowed})`,
  ),
  "\n   Lock the win in - replace STRICT_ERROR_BASELINE in",
  "   scripts/strict-typecheck-ratchet.js with:\n",
  formatBaseline(errorsByFile),
];

/**
 * Run the strict tsc project and return its combined output.
 * A non-zero exit with no diagnostics means tsc itself broke - throw
 * rather than reporting a clean ratchet.
 */
export const runStrictTsc = () => {
  const { status, output } = runToolCapture("npx", [
    "tsc",
    "--noEmit",
    "-p",
    "tsconfig.strict.json",
    "--pretty",
    "false",
    "--incremental",
    "--tsBuildInfoFile",
    "tsconfig.strict.tsbuildinfo",
  ]);
  if (status !== 0 && !output.includes("error TS")) {
    throw new Error(`tsc exited ${status} without diagnostics:\n${output}`);
  }
  return output;
};

/**
 * Run the ratchet against a baseline (the real one by default; tests
 * inject a small one) and report, exiting non-zero on any mismatch.
 * @param {Record<string, number>} [baseline]
 */
export const main = (baseline = STRICT_ERROR_BASELINE) => {
  const errorsByFile = parseErrorsByFile(runStrictTsc());
  const { regressions, improvements } = compareToBaseline(
    errorsByFile,
    baseline,
  );
  const problems = [
    ...(regressions.length > 0
      ? describeRegressions(regressions, errorsByFile)
      : []),
    ...(improvements.length > 0
      ? describeImprovements(improvements, errorsByFile)
      : []),
  ];
  if (problems.length > 0) {
    console.error(problems.join("\n"));
    process.exit(1);
  }

  const total = [...errorsByFile.values()].reduce(
    (sum, lines) => sum + lines.length,
    0,
  );
  console.log(
    `✅ Strict typecheck ratchet passed: ${total} known errors across ${errorsByFile.size} files, everything else strict-clean`,
  );
};

await runIfMain(import.meta.url, main);
