#!/usr/bin/env node

/**
 * jscpd runner that prints actionable guidance when duplication is found.
 *
 * jscpd's console report tells you where the duplication is, but not what to
 * do next. This wrapper runs jscpd unchanged and forwards every arg, then
 * appends the project's duplication policy plus the affected clone spans when
 * the check fails. A non-zero jscpd exit that produced no report is a crash
 * (bad flag, internal error) and throws instead of masquerading as
 * duplication.
 */

import { existsSync, readFileSync, rmSync } from "node:fs";
import { isAbsolute, join, relative } from "node:path";
import { ROOT_DIR } from "#lib/paths.js";
import { runIfMain } from "#scripts/lib/is-main-module.js";
import { runTool } from "#scripts/lib/run-tool.js";

const JSCPD_REPORT = join(ROOT_DIR, ".jscpd-report", "jscpd-report.json");
const MAX_DUPLICATES_TO_SHOW = 5;
const MAX_EXCERPT_LINES = 20;

export const buildCpdFailureMessage = () => `
jscpd found duplicated code.

Do not use /* jscpd:ignore */ to silence it. Fix the duplication:

  1. Write a helper. This is the answer in almost every case. If an obvious
     shared function jumps out, extract it and call it from both sites.

  2. No obvious helper? Curry. Lift the parts that differ into arguments of a
     function that returns the specialised version, then call it at each site.
     Review the result before committing. The first small curry you reach for
     is often not the best one; a larger, more holistic curry across the call
     sites is frequently better.

  3. jscpd:ignore is the last resort. It is excusable for basically one thing:
     import blocks. If the duplicated code is not an import block, you almost
     certainly want option 1 or 2.
`;

/**
 * Load the duplicates from a jscpd JSON report, after a failing run.
 * A missing report or one without duplicates means jscpd crashed rather
 * than finding duplication, so both throw.
 * @param {string} reportPath
 * @returns {object[]}
 */
export const loadCpdDuplicates = (reportPath = JSCPD_REPORT) => {
  if (!existsSync(reportPath)) {
    throw new Error(
      `jscpd exited with an error but wrote no report (${reportPath}) - the run itself failed; check the output above`,
    );
  }
  const { duplicates } = JSON.parse(readFileSync(reportPath, "utf-8"));
  if (!Array.isArray(duplicates) || duplicates.length === 0) {
    throw new Error(
      "jscpd exited with an error but its report lists no duplicates - the run itself failed; check the output above",
    );
  }
  return duplicates;
};

const resolveReportFile = (fileName) => {
  if (!fileName) return null;

  const fullPath = isAbsolute(fileName) ? fileName : join(ROOT_DIR, fileName);
  const relativePath = relative(ROOT_DIR, fullPath);

  if (relativePath.startsWith("..") || isAbsolute(relativePath)) return null;
  return existsSync(fullPath) ? fullPath : null;
};

export const buildSourceExcerptLines = ({ name, start, end }) => {
  const filePath = resolveReportFile(name);
  if (!filePath) return ["    (source unavailable)"];

  const sourceLines = readFileSync(filePath, "utf-8").split(/\r?\n/);
  const firstLine = Math.max(1, start);
  const lastLine = Math.min(end, firstLine + MAX_EXCERPT_LINES - 1);
  const width = String(lastLine).length;
  const lines = sourceLines
    .slice(firstLine - 1, lastLine)
    .map(
      (line, index) =>
        `    ${String(firstLine + index).padStart(width, " ")} | ${line}`,
    );

  if (end > lastLine) lines.push(`    ... (${end - lastLine} more lines)`);
  return lines.length > 0 ? lines : ["    (source unavailable)"];
};

export const buildCpdDuplicateLines = (duplicate) => {
  const firstFile = duplicate?.firstFile;
  const secondFile = duplicate?.secondFile;

  if (!firstFile || !secondFile) return [];

  const lines = [
    `❌ Clone found (${duplicate.format}, ${duplicate.lines} lines)`,
    `  ${firstFile.name}: ${firstFile.start}-${firstFile.end}`,
    "  Duplicated lines:",
    ...buildSourceExcerptLines(firstFile),
    `  ${secondFile.name}: ${secondFile.start}-${secondFile.end}`,
    "  Duplicated lines:",
    ...buildSourceExcerptLines(secondFile),
  ];

  if (duplicate.fragment) {
    lines.push("  Normalized duplicate fragment:");
    lines.push(
      ...String(duplicate.fragment)
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => `    ${line}`),
    );
  }

  return lines;
};

/**
 * @param {object[]} duplicates
 */
export const buildCpdFailureLines = (duplicates) => {
  const lines = ["❌ jscpd found duplicated code"];

  for (const duplicate of duplicates.slice(0, MAX_DUPLICATES_TO_SHOW)) {
    lines.push(...buildCpdDuplicateLines(duplicate));
  }

  if (duplicates.length > MAX_DUPLICATES_TO_SHOW) {
    lines.push(
      `  ... and ${duplicates.length - MAX_DUPLICATES_TO_SHOW} more duplicate block(s)`,
    );
  }

  lines.push("");
  lines.push(buildCpdFailureMessage().trim());
  return lines;
};

/**
 * Spawn jscpd after deleting the previous report, so any report present
 * after a failing run was written by this run - which is how a duplication
 * failure is told apart from a crash.
 * @param {string[]} args
 * @param {string} reportPath - Where this invocation's JSON report lands
 * @returns {number} jscpd's exit status (0 = no duplication)
 */
export const runJscpd = (args, reportPath) => {
  rmSync(reportPath, { force: true });
  return runTool("npx", ["jscpd", ...args]);
};

/**
 * Run jscpd with the given args, printing the project's duplication
 * policy when duplication is found and throwing when the run crashed.
 * @param {string[]} args
 * @param {string} reportPath - Where this invocation's JSON report lands
 * @returns {number} jscpd's exit status (0 = no duplication)
 */
export const runCpd = (args = [], reportPath = JSCPD_REPORT) => {
  const status = runJscpd(args, reportPath);
  if (status === 0) return 0;

  for (const line of buildCpdFailureLines(loadCpdDuplicates(reportPath))) {
    console.error(line);
  }
  return status;
};

/** CLI entry: run jscpd over argv and exit with its status. */
export const cpdMain = () => {
  process.exit(runCpd(process.argv.slice(2)));
};

await runIfMain(import.meta.url, cpdMain);
