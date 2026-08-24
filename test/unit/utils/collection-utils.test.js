import { describe, expect, test } from "bun:test";
import { createMockEleventyConfig } from "#test/test-utils.js";
import {
  configureCollectionUtils,
  createFieldIndexer,
} from "#utils/collection-utils.js";

describe("collection-utils", () => {
  describe("configureCollectionUtils", () => {
    test("does not throw", () => {
      const mockConfig = createMockEleventyConfig();
      configureCollectionUtils(mockConfig);
    });
  });

  describe("createFieldIndexer slug normalisation", () => {
    const indexByParent = createFieldIndexer("parent");

    test.each([
      { format: "bare slug", value: "widgets" },
      { format: "path with .md", value: "categories/widgets.md" },
      { format: "path without extension", value: "categories/widgets" },
    ])("normalises $format to bare slug for lookup", ({ value }) => {
      const items = [{ data: { name: "C1", parent: value } }];
      const index = indexByParent(items);
      expect(index.widgets).toHaveLength(1);
    });

    test("groups items sharing a parent under the same key", () => {
      const items = [
        { data: { name: "C1", parent: "widgets" } },
        { data: { name: "C2", parent: "categories/widgets.md" } },
      ];
      const index = indexByParent(items);
      expect(index.widgets).toHaveLength(2);
    });
  });
});
