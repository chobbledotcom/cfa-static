/**
 * Detects Eleventy filters and shortcodes that no template uses.
 *
 * The inverse gate to unregistered-collections: a filter registered in
 * src/_lib (via addFilter/addAsyncFilter/addShortcode/addAsyncShortcode
 * or the central FILTERS registry) with no `| name` / `{% name %}`
 * reference in any template is dead code — it ships, gets tested, and
 * rots without ever rendering a page. Delete the registration (and the
 * implementation, if nothing else uses it) instead of allowlisting.
 */
import { describe, expect, test } from "vitest";
import { configureFilters } from "#eleventy/filters.js";
import { readSource } from "#test/code-scanner.js";
import {
  createExtractor,
  createMockEleventyConfig,
  getFiles,
} from "#test/test-utils.js";
import { unique } from "#utils/fp/array.js";

const REGISTRATION_PATTERN =
  /\.add(?:Async)?(?:Filter|Shortcode)\(\s*\n?\s*"([^"]+)"/g;

const registeredNames = () => {
  const mockConfig = createMockEleventyConfig();
  configureFilters(mockConfig);
  return unique([
    ...Object.keys(mockConfig.filters),
    ...createExtractor(REGISTRATION_PATTERN)(getFiles(/^src\/.*\.js$/)),
  ]);
};

/** Liquid usage forms: `| name` (filter) or `{% name %}` (shortcode). */
const usagePattern = (name) =>
  new RegExp(`(\\|\\s*${name}\\b|\\{%-?\\s*${name}\\b)`);

describe("unused-filters", () => {
  const templates = getFiles(/^src\/(?!_lib\/).*\.(html|liquid|md|xsl)$/)
    .map(readSource)
    .join("\n");

  test("every registered filter and shortcode is used by a template", () => {
    const unused = registeredNames().filter(
      (name) => !usagePattern(name).test(templates),
    );

    expect(
      unused,
      `Registered but never used in any template: ${unused.join(", ")}. ` +
        "Delete the registration (and implementation if nothing else needs it).",
    ).toEqual([]);
  });

  test("the scan sees known-good registrations and templates", () => {
    const names = registeredNames();
    for (const name of ["cacheBust", "image", "toNavigation", "getBySlug"]) {
      expect(names).toContain(name);
    }
    expect(usagePattern("cacheBust").test(templates)).toBe(true);
  });
});
