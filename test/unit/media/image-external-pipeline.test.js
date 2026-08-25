import { describe, expect, test, vi } from "vitest";
import { computeExternalImageHtml } from "#media/image-external.js";
import { LQIP_WIDTH } from "#media/image-lqip.js";

const imageFn = vi.fn();
const processFormats = vi.fn(() => Promise.resolve({ raw: true }));
const prepareLqipMetadata = vi.fn(() =>
  Promise.resolve({
    bgImage: "url(data:lqip)",
    htmlMetadata: { webp: [{ width: 320 }, { width: 800 }] },
  }),
);
const wrapProcessedImage = vi.fn(() => Promise.resolve("<div>wrapped</div>"));

vi.mock("#media/image-lqip.js", async (importOriginal) => ({
  ...(await importOriginal()),
  getEleventyImg: () => Promise.resolve({ default: imageFn }),
}));
vi.mock("#media/image-pipeline.js", () => ({
  processFormats: (...args) => processFormats(...args),
  prepareLqipMetadata: (...args) => prepareLqipMetadata(...args),
  wrapProcessedImage: (...args) => wrapProcessedImage(...args),
}));

describe("computeExternalImageHtml", () => {
  test("processes the url through the pipeline into wrapped html", async () => {
    const result = await computeExternalImageHtml({
      imageName: "https://example.com/pic.jpg",
      alt: "Sample Picture",
      loading: "lazy",
      classes: "hero",
      sizes: "100vw",
      widths: "400",
      aspectRatio: "16/9",
    });

    expect(result).toBe("<div>wrapped</div>");

    const [passedImageFn, src, imageOptions, widths] =
      processFormats.mock.calls[0];
    expect(passedImageFn).toBe(imageFn);
    expect(src).toBe("https://example.com/pic.jpg");
    expect(widths[0]).toBe(LQIP_WIDTH);
    expect(widths).toContain("400");

    // The filename format eleventy-img will call: slugified alt + a
    // short url hash, then per-width naming.
    expect(imageOptions.slug).toMatch(/^sample-picture-[0-9a-f]{8}$/);
    expect(
      imageOptions.filenameFormat("id", src, 320, "webp", imageOptions),
    ).toBe(`${imageOptions.slug}-320.webp`);

    expect(wrapProcessedImage).toHaveBeenCalledWith(
      { webp: [{ width: 320 }, { width: 800 }] },
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        classes: "hero",
        style: expect.stringContaining("800"),
      }),
    );
  });

  test("falls back to a generic slug when alt text is missing", async () => {
    await computeExternalImageHtml({
      imageName: "https://example.com/other.jpg",
      alt: null,
      loading: null,
      classes: null,
      sizes: null,
      widths: null,
      aspectRatio: null,
    });

    const options = processFormats.mock.calls.at(-1)[2];
    expect(options.slug).toMatch(/^external-image-[0-9a-f]{8}$/);
  });
});
