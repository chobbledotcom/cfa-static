#!/usr/bin/env node

/**
 * Biome runner pinned to the version in devDependencies.
 *
 * Always runs the npm-installed Biome via npx, so every environment — Nix
 * shells, hosted CI, plain npm checkouts — lints with the exact same binary
 * instead of whatever `biome` happens to be on PATH. (The npx string here
 * is invisible to knip, so @biomejs/biome sits in its ignoreDependencies.)
 *
 * Usage: node scripts/biome.js <biome args...>
 */

import { runTool } from "#scripts/lib/run-tool.js";

process.exit(runTool("npx", ["@biomejs/biome", ...process.argv.slice(2)]));
