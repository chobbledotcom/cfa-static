#!/usr/bin/env node

/**
 * CPD ratchet check - fails when the duplication threshold could be lower.
 *
 * Reads the strict jscpd invocation out of package.json's cpd script -
 * paths, ignores and --min-tokens all come from that single source, so the
 * ratchet can never drift from the real check - and re-runs it with
 * min-tokens lowered by one. If that stricter run finds no duplication the
 * threshold can be tightened, and this check fails until package.json is
 * updated.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT_DIR } from "#lib/paths.js";
import { loadCpdDuplicates, runJscpd } from "#scripts/cpd.js";
import { runIfMain } from "#scripts/lib/is-main-module.js";

const RATCHET_OUTPUT_DIR = join(ROOT_DIR, ".jscpd-report", "ratchet");
const RATCHET_REPORT = join(RATCHET_OUTPUT_DIR, "jscpd-report.json");

/**
 * Extract the strict jscpd invocation's CLI args from the cpd npm script.
 * The script chains a config-driven default run and a strict run; the
 * strict one is the segment carrying --min-tokens.
 * @param {string} cpdScript
 * @returns {string[]}
 */
export const parseCpdArgs = (cpdScript) => {
  const segments = cpdScript.split("&&").map((segment) => segment.trim());
  const strict = segments.filter((segment) => segment.includes("--min-tokens"));
  if (strict.length !== 1) {
    throw new Error(
      `Expected exactly one --min-tokens segment in the cpd script, found ${strict.length}: ${cpdScript}`,
    );
  }

  const tokens = strict[0].match(/'[^']*'|\S+/g);
  if (!tokens || tokens[0] !== "node" || tokens[1] !== "scripts/cpd.js") {
    throw new Error(
      `The strict cpd segment no longer starts with "node scripts/cpd.js" - update scripts/cpd-ratchet.js to match: ${strict[0]}`,
    );
  }
  return tokens.slice(2).map((token) => token.replaceAll("'", ""));
};

/**
 * Return the current --min-tokens value and the same args with it
 * lowered by one.
 * @param {string[]} args
 * @returns {{ current: number, ratchetArgs: string[] }}
 */
export const lowerMinTokens = (args) => {
  const index = args.indexOf("--min-tokens");
  const current = index === -1 ? Number.NaN : Number(args[index + 1]);
  if (!Number.isInteger(current) || current < 2) {
    throw new Error(
      `Could not read a --min-tokens value above 1 from: ${args.join(" ")}`,
    );
  }
  const ratchetArgs = [...args];
  ratchetArgs[index + 1] = String(current - 1);
  return { current, ratchetArgs };
};

/** Run the ratchet: exported so the unit tests can drive it with mocks. */
export const main = () => {
  const pkg = JSON.parse(readFileSync(join(ROOT_DIR, "package.json"), "utf-8"));
  const { current, ratchetArgs } = lowerMinTokens(
    parseCpdArgs(pkg.scripts.cpd),
  );

  const status = runJscpd(
    [...ratchetArgs, "--silent", "--output", RATCHET_OUTPUT_DIR],
    RATCHET_REPORT,
  );

  if (status === 0) {
    console.error(
      `\n❌ CPD ratchet failed: the code passes with min-tokens ${current - 1}`,
    );
    console.error(
      `   Update --min-tokens to ${current - 1} in the package.json cpd script`,
    );
    process.exit(1);
  }

  // A non-zero exit must mean duplication at the stricter threshold, not a
  // crash - loadCpdDuplicates throws if the run failed without a report.
  const duplicates = loadCpdDuplicates(RATCHET_REPORT);
  console.log(
    `\n✅ CPD ratchet passed: min-tokens ${current} is as strict as the code allows (${duplicates.length} clone(s) appear one notch lower)`,
  );
};

await runIfMain(import.meta.url, main);
