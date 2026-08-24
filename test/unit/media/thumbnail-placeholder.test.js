import { describe, expect, test } from "vitest";
import {
  configureThumbnailPlaceholder,
  getPlaceholderForPath,
  PLACEHOLDER_COLORS,
} from "#media/thumbnail-placeholder.js";
import { createMockEleventyConfig } from "#test/test-utils.js";
import { unique } from "#toolkit/fp/array.js";

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

  describe("configureThumbnailPlaceholder", () => {
    test("registers filter", () => {
      const config = createMockEleventyConfig();
      configureThumbnailPlaceholder(config);
      expect(config.filters.thumbnailPlaceholder).toBeDefined();
      expect(config.filters.thumbnailPlaceholder("/test/")).toMatch(/\.svg$/);
    });
  });
});
