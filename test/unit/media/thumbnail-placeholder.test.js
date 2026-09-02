import { describe, expect, test } from "vitest";
import {
  getPlaceholderForPath,
  PLACEHOLDER_COLORS,
} from "#media/thumbnail-placeholder.js";
import { unique } from "#utils/fp/array.js";

describe("thumbnail-placeholder", () => {
  describe("getPlaceholderForPath", () => {
    test("returns svg path", () => {
      const result = getPlaceholderForPath("/products/widget/");
      expect(result).toMatch(/^images\/placeholders\/\w+\.svg$/);
    });

    test("is deterministic", () => {
      const path = "/products/test-product/";
      expect(getPlaceholderForPath(path)).toBe(getPlaceholderForPath(path));
    });

    test("handles empty input", () => {
      expect(getPlaceholderForPath("")).toMatch(/\.svg$/);
    });

    test("distributes paths across placeholders", () => {
      const paths = Array.from({ length: 20 }, (_, i) => `/item/${i}/`);
      const placeholders = unique(paths.map(getPlaceholderForPath));
      expect(placeholders.length).toBeGreaterThan(1);
    });

    test("uses defined colors", () => {
      const result = getPlaceholderForPath("/any/path/");
      const colorPattern = new RegExp(
        `^images/placeholders/(${PLACEHOLDER_COLORS.join("|")})\\.svg$`,
      );
      expect(result).toMatch(colorPattern);
    });
  });
});
