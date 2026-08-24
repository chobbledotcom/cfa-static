import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test, vi } from "vitest";
import { configureImages } from "#media/image.js";
import {
  createMockEleventyConfig,
  withChdirAsync,
  withTempDirAsync,
} from "#test/test-utils.js";

const servePlugin = { name: "serve-plugin" };
vi.mock("#media/image-lqip.js", async (importOriginal) => {
  const actual = await importOriginal();
  const stubEleventyImg = () =>
    Promise.resolve({ eleventyImageOnRequestDuringServePlugin: servePlugin });
  return { ...actual, getEleventyImg: stubEleventyImg };
});

describe("configureImages", () => {
  test("registers the shortcode, filter, plugin, and image collection", async () => {
    const mockConfig = createMockEleventyConfig();

    await configureImages(mockConfig);

    expect(typeof mockConfig.asyncShortcodes.image).toBe("function");
    expect(typeof mockConfig.filters.normalizeImageUrl).toBe("function");
    expect(mockConfig.pluginCalls[0].plugin).toBe(servePlugin);

    const images = mockConfig.collections.images();
    expect(Array.isArray(images)).toBe(true);
    expect(images.every((name) => name.endsWith(".jpg"))).toBe(true);
  });

  test("eleventy.after copies the image cache into the site when present", async () => {
    await withTempDirAsync("image-configure", async (dir) => {
      // The handler reads ".image-cache/" relative to the real working
      // directory, so actually chdir into the temp dir.
      await withChdirAsync(dir, async () => {
        const mockConfig = createMockEleventyConfig();
        await configureImages(mockConfig);
        const afterHandler = mockConfig.eventHandlers["eleventy.after"];

        // No cache dir yet: nothing to copy
        afterHandler();
        expect(existsSync(join(dir, "_site/img"))).toBe(false);

        mkdirSync(join(dir, ".image-cache"));
        writeFileSync(join(dir, ".image-cache/pic.webp"), "img-bytes");
        afterHandler();

        expect(existsSync(join(dir, "_site/img/pic.webp"))).toBe(true);
      });
    });
  });
});
