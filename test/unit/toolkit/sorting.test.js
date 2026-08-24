/**
 * Tests for js-toolkit sorting utilities
 */
import { describe, expect, test } from "vitest";
import {
  compareBy,
  compareStrings,
  descending,
  orderThenString,
} from "#toolkit/fp/sorting.js";

describe("compareStrings", () => {
  test("sorts strings alphabetically", () => {
    expect(["banana", "apple", "cherry"].sort(compareStrings)).toEqual([
      "apple",
      "banana",
      "cherry",
    ]);
  });
});

describe("compareBy", () => {
  test("uses locale comparison for string keys", () => {
    const items = [{ name: "beta" }, { name: "alpha" }];
    const sorted = [...items].sort(compareBy((i) => i.name));

    expect(sorted.map((i) => i.name)).toEqual(["alpha", "beta"]);
  });

  test("uses numeric comparison for number keys", () => {
    const items = [{ n: 10 }, { n: 2 }];
    const sorted = [...items].sort(compareBy((i) => i.n));

    expect(sorted.map((i) => i.n)).toEqual([2, 10]);
  });
});

describe("descending", () => {
  test("reverses a comparator", () => {
    expect([1, 3, 2].sort(descending((a, b) => a - b))).toEqual([3, 2, 1]);
  });
});

describe("orderThenString", () => {
  test("sorts by numeric order first, then string for ties", () => {
    const items = [
      { order: 2, title: "b" },
      { order: 1, title: "z" },
      { order: 2, title: "a" },
    ];

    const sorted = [...items].sort(
      orderThenString(
        (i) => i.order,
        (i) => i.title,
      ),
    );

    expect(sorted.map((i) => i.title)).toEqual(["z", "a", "b"]);
  });
});
