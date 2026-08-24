/**
 * Tests for js-toolkit grouping utilities
 */
import { describe, expect, test } from "vitest";
import {
  buildFirstOccurrenceLookup,
  buildReverseIndex,
  groupBy,
  groupValuesBy,
} from "#toolkit/fp/grouping.js";

describe("buildReverseIndex", () => {
  test("maps each key to every item carrying it", () => {
    const products = [
      { name: "widget", tags: ["a", "b"] },
      { name: "gadget", tags: ["b"] },
    ];

    const index = buildReverseIndex(products, (p) => p.tags);

    expect(index.get("a")).toEqual([products[0]]);
    expect(index.get("b")).toEqual([products[0], products[1]]);
  });

  test("returns an empty Map for no items", () => {
    expect(buildReverseIndex([], (p) => p.tags).size).toBe(0);
  });
});

describe("groupBy", () => {
  test("groups items under their single key", () => {
    const events = [
      { date: "2026-01-01", name: "one" },
      { date: "2026-01-02", name: "two" },
      { date: "2026-01-01", name: "three" },
    ];

    const byDate = groupBy(events, (e) => e.date);

    expect(byDate.get("2026-01-01").map((e) => e.name)).toEqual([
      "one",
      "three",
    ]);
    expect(byDate.get("2026-01-02").map((e) => e.name)).toEqual(["two"]);
  });

  test("skips items whose key is null or undefined", () => {
    const items = [{ k: null }, { k: undefined }, { k: "x" }];

    const grouped = groupBy(items, (i) => i.k);

    expect([...grouped.keys()]).toEqual(["x"]);
  });
});

describe("groupValuesBy", () => {
  test("groups values by key with deduplication", () => {
    const pairs = [
      ["size", "small"],
      ["size", "large"],
      ["size", "small"],
      ["colour", "red"],
    ];

    const grouped = groupValuesBy(pairs);

    expect(grouped.get("size")).toEqual(["small", "large"]);
    expect(grouped.get("colour")).toEqual(["red"]);
  });
});

describe("buildFirstOccurrenceLookup", () => {
  test("keeps the first value seen for each key", () => {
    const items = [
      { pairs: [["slug", "First"]] },
      {
        pairs: [
          ["slug", "Second"],
          ["other", "Value"],
        ],
      },
    ];

    const lookup = buildFirstOccurrenceLookup(items, (item) => item.pairs);

    expect(lookup).toEqual({ slug: "First", other: "Value" });
  });
});
