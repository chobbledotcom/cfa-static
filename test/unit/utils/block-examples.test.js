/**
 * Every block type ships a canonical example: valid against its own schema,
 * round-trippable through YAML, and rendered live on the /blocks/ gallery
 * page. These tests keep that guarantee honest.
 */

import { describe, expect, test } from "vitest";
import { parse } from "yaml";
import { buildGalleryBlocks } from "#utils/block-gallery.js";
import {
  BLOCK_EXAMPLES,
  BLOCK_SCHEMAS,
  collectBlockErrors,
} from "#utils/block-schema.js";

describe("block examples", () => {
  test("every registered block type has an example of its own type", () => {
    expect(BLOCK_EXAMPLES.length).toBe(Object.keys(BLOCK_SCHEMAS).length);
    for (const { type, example } of BLOCK_EXAMPLES) {
      expect(
        example,
        `block type "${type}" is missing an example`,
      ).toBeTruthy();
      expect(example.type).toBe(type);
    }
  });

  test.each(
    BLOCK_EXAMPLES.map(({ type, example }) => [type, example]),
  )("the %s example validates against its schema", (type, example) => {
    expect(collectBlockErrors([example], ` (${type} example)`)).toEqual([]);
  });
});

describe("buildGalleryBlocks", () => {
  const gallery = buildGalleryBlocks();

  test("opens with a hero and emits one section per block type", () => {
    expect(gallery[0].type).toBe("hero");
    // The section-header example is itself a live section-header, so count
    // only the gallery's own intros (their heading is the backticked type).
    const intros = gallery.filter(
      (b) => b.type === "section-header" && b.intro.startsWith("## `"),
    );
    expect(intros.length).toBe(BLOCK_EXAMPLES.length);
  });

  test("the whole gallery is itself a valid blocks array", () => {
    expect(collectBlockErrors(gallery, " (gallery)")).toEqual([]);
  });

  test("each YAML source round-trips to the example it documents", () => {
    const sources = gallery.filter((b) => b.type === "code-block");
    const byFilename = Object.fromEntries(
      sources.map((b) => [b.filename, b.code]),
    );
    for (const { type, example } of BLOCK_EXAMPLES) {
      const code = byFilename[`${type}.yaml`];
      expect(code, `no YAML source emitted for "${type}"`).toBeTruthy();
      expect(parse(code)).toEqual({ blocks: [example] });
    }
  });

  test("collection-restricted blocks get a note instead of a live preview", () => {
    const restricted = BLOCK_EXAMPLES.filter((e) => e.collections);
    expect(restricted.length).toBeGreaterThan(0);
    for (const { type } of restricted) {
      const rendered = gallery.some((b) => b.type === type);
      expect(rendered, `restricted "${type}" should not render`).toBe(false);
    }
    const notes = gallery.filter((b) => b.name === "Rendered in context");
    expect(notes.length).toBe(restricted.length);
  });
});
