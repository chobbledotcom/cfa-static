import { resolve } from "node:path";
import { describe, expect, test } from "vitest";
import { fs, rootDir } from "#test/test-utils.js";

const forbiddenLockfiles = [
  "bun.lock",
  "bun.lockb",
  "yarn.lock",
  "pnpm-lock.yaml",
];

describe("lockfile", () => {
  test("only package-lock.json should exist (this project uses npm)", () => {
    for (const lockfile of forbiddenLockfiles) {
      const lockfilePath = resolve(rootDir, lockfile);
      const exists = fs.existsSync(lockfilePath);
      expect(exists).toBe(false);
    }

    const npmLockPath = resolve(rootDir, "package-lock.json");
    expect(fs.existsSync(npmLockPath)).toBe(true);
  });
});
