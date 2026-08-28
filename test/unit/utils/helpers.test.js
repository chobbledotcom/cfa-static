import { describe, expect, test } from "vitest";
import { DEFAULTS } from "#config/helpers.js";
import { expectObjectProps } from "#test/test-utils.js";

describe("DEFAULTS", () => {
  test("includes expected navigation defaults", () => {
    expectObjectProps({
      sticky_mobile_nav: true,
      horizontal_nav: true,
    })(DEFAULTS);
  });

  test("has use_visual_editor disabled by default", () => {
    expect(DEFAULTS.use_visual_editor).toBe(false);
  });

  test("has default_image_widths array", () => {
    expect(DEFAULTS.default_image_widths).toEqual([240, 480, 900, 1300]);
  });

  test("has search_collections covering the kept content types", () => {
    expect(DEFAULTS.search_collections).toEqual([
      "news",
      "pages",
      "guide-pages",
      "guide-categories",
    ]);
  });
});
