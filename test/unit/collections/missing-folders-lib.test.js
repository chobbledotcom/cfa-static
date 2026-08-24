import { describe, expect, test } from "vitest";

import { configureNavigation } from "#collections/navigation.js";
import { configureTags } from "#collections/tags.js";
import { configureFeed } from "#eleventy/feed.js";
import { createMockEleventyConfig } from "#test/test-utils.js";

describe("missing-folders-lib", () => {
  // Test that lib modules handle missing folders gracefully
  test("Tags module handles empty collections", () => {
    const mockConfig = createMockEleventyConfig();

    configureTags(mockConfig);

    // Test with empty collections
    const mockCollectionApi = {
      getAll: () => [],
    };

    if (mockConfig.collections?.tagList) {
      const result = mockConfig.collections.tagList(mockCollectionApi);
      expect(Array.isArray(result)).toBe(true);
    } else {
      // Tags module doesn't create collections, just filters
      expect(mockConfig.filters !== undefined).toBe(true);
    }
  });

  test("Navigation module handles missing pages", async () => {
    const mockConfig = createMockEleventyConfig();

    // Should not throw when configuring (async due to plugin loading)
    await configureNavigation(mockConfig);

    // Check that plugin was added
    expect(mockConfig.pluginCalls !== undefined).toBe(true);
  });

  test("Feed module handles missing posts", async () => {
    const mockConfig = createMockEleventyConfig();

    // Should not throw when configuring (async due to plugin loading)
    await configureFeed(mockConfig);

    // Check that RSS date filters were added
    expect(mockConfig.filters.dateToRfc3339 !== undefined).toBe(true);
    expect(mockConfig.filters.dateToRfc822 !== undefined).toBe(true);
  });
});
