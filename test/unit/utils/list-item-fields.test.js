import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { DEFAULTS } from "#config/helpers.js";
import listItemFields from "#data/listItemFields.js";
import { ROOT_DIR } from "#lib/paths.js";

const INCLUDES_DIR = join(ROOT_DIR, "src/_includes");

describe("list-item-fields", () => {
  test("each default field has a matching list-item include file", () => {
    for (const field of DEFAULTS.list_item_fields) {
      const includePath = join(INCLUDES_DIR, `list-item-${field}.html`);
      expect(existsSync(includePath)).toBe(true);
    }
  });

  test("the listItemFields data resolves from the merged site config", () => {
    // config.json leaves list_item_fields null, so the DEFAULTS entry is the
    // single source of truth for what list items render.
    expect(listItemFields).toEqual(DEFAULTS.list_item_fields);
  });
});
