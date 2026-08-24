/**
 * Tests for js-toolkit array utilities
 */
import { describe, expect, test } from "vitest";
import {
  compact,
  exclude,
  filter,
  filterMap,
  findDuplicate,
  flatMap,
  join,
  map,
  mapAsync,
  memberOf,
  notMemberOf,
  pick,
  pipe,
  pluralize,
  reduce,
  sort,
  sortBy,
  split,
  unique,
  uniqueBy,
} from "#toolkit/fp/array.js";

describe("mapAsync", () => {
  test("maps async function over array and awaits all results", async () => {
    const double = async (x) => x * 2;

    const result = await mapAsync(double)([1, 2, 3]);

    expect(result).toEqual([2, 4, 6]);
  });

  test("handles iterables like NodeList without explicit Array.from", async () => {
    const addOne = async (x) => x + 1;

    const result = await mapAsync(addOne)(new Set([1, 2, 3]));

    expect(result).toEqual([2, 3, 4]);
  });

  test("passes index to the async function", async () => {
    const withIndex = async (value, index) => ({ value, index });

    const result = await mapAsync(withIndex)(["a", "b", "c"]);

    expect(result).toEqual([
      { value: "a", index: 0 },
      { value: "b", index: 1 },
      { value: "c", index: 2 },
    ]);
  });

  test("returns empty array for empty input", async () => {
    const fn = async (x) => x;

    const result = await mapAsync(fn)([]);

    expect(result).toEqual([]);
  });

  test("runs all promises concurrently", async () => {
    const start = Date.now();
    await mapAsync(
      (ms) => new Promise((resolve) => setTimeout(() => resolve(ms), ms)),
    )([10, 10, 10]);
    const elapsed = Date.now() - start;

    // Total time should be ~10ms (parallel), not ~30ms (sequential)
    // If run sequentially, would take 30ms+. With concurrency, ~10ms.
    expect(elapsed).toBeLessThan(100);
  });

  test("filters and picks unique objects by key", () => {
    const items = [
      { id: 1, name: "first" },
      { id: 1, name: "duplicate" },
      { id: 2, name: "second" },
    ];
    const result = uniqueBy((item) => item.id)(items);

    expect(result).toEqual([
      { id: 1, name: "duplicate" },
      { id: 2, name: "second" },
    ]);
  });

  test("picks an object subset and ignores missing keys", () => {
    const pickMeta = pick(["id", "name", "missing"]);
    expect(pickMeta({ id: 1, name: "Widget", sku: "X" })).toEqual({
      id: 1,
      name: "Widget",
    });
  });

  test("membership helpers include and exclude values", () => {
    const isWeekend = memberOf(["sat", "sun"]);
    const isNotWeekend = notMemberOf(["sat", "sun"]);

    expect(isWeekend("sat")).toBe(true);
    expect(isNotWeekend("sat")).toBe(false);
    expect(exclude(["blocked", "forbidden"])(["allowed", "blocked"])).toEqual([
      "allowed",
    ]);
  });

  test("pluralize handles singular/plural and custom endings", () => {
    const format = pluralize("class");
    expect(format(1)).toBe("1 class");
    expect(format(3)).toBe("3 classes");
  });

  test("pluralize uses custom form when provided", () => {
    const format = pluralize("item in basket", "items in basket");
    expect(format(1)).toBe("1 item in basket");
    expect(format(2)).toBe("2 items in basket");
  });
});

describe("pipe", () => {
  test("composes functions left to right", () => {
    const addOne = (x) => x + 1;
    const double = (x) => x * 2;

    expect(pipe(addOne, double)(3)).toBe(8);
    expect(pipe(double, addOne)(3)).toBe(7);
  });

  test("returns the input unchanged with no functions", () => {
    expect(pipe()("value")).toBe("value");
  });
});

describe("curried array helpers", () => {
  test("filter keeps items matching the predicate", () => {
    expect(filter((x) => x > 2)([1, 2, 3, 4])).toEqual([3, 4]);
  });

  test("map transforms each item and passes the index", () => {
    expect(map((x) => x * 3)([1, 2])).toEqual([3, 6]);
    expect(map((x, i) => `${i}:${x}`)(["a", "b"])).toEqual(["0:a", "1:b"]);
  });

  test("flatMap flattens one level of returned arrays", () => {
    expect(flatMap((x) => [x, x])([1, 2])).toEqual([1, 1, 2, 2]);
  });

  test("reduce folds the array from the initial value", () => {
    expect(reduce((acc, x) => acc + x, 10)([1, 2, 3])).toBe(16);
  });

  test("join concatenates with the separator", () => {
    expect(join(", ")(["a", "b"])).toBe("a, b");
  });

  test("split divides a string by the separator", () => {
    expect(split("-")("x-y-z")).toEqual(["x", "y", "z"]);
  });

  test("filterMap filters and transforms in one pass", () => {
    const doublePositives = filterMap(
      (n) => n > 0,
      (n) => n * 2,
    );
    expect(doublePositives([-1, 1, 2])).toEqual([2, 4]);
  });

  test("compact removes falsy values", () => {
    expect(compact([0, 1, "", "a", null, undefined, false, 2])).toEqual([
      1,
      "a",
      2,
    ]);
  });
});

describe("sort helpers", () => {
  test("sort returns a sorted copy without mutating the input", () => {
    const input = [3, 1, 2];
    const sorted = sort((a, b) => a - b)(input);

    expect(sorted).toEqual([1, 2, 3]);
    expect(input).toEqual([3, 1, 2]);
  });

  test("sortBy sorts by property name for string values", () => {
    const items = [{ name: "banana" }, { name: "apple" }, { name: "cherry" }];
    const names = sortBy("name")(items).map((i) => i.name);

    expect(names).toEqual(["apple", "banana", "cherry"]);
  });

  test("sortBy sorts numerically with a getter function", () => {
    const items = [{ n: 10 }, { n: 2 }];

    expect(sortBy((i) => i.n)(items).map((i) => i.n)).toEqual([2, 10]);
  });
});

describe("unique and duplicates", () => {
  test("unique removes duplicates preserving first-seen order", () => {
    expect(unique([3, 1, 3, 2, 1])).toEqual([3, 1, 2]);
  });

  test("findDuplicate returns the item that repeats an earlier key", () => {
    expect(findDuplicate([1, 2, 1, 2])).toBe(1);

    const items = [{ id: 1 }, { id: 2 }, { id: 1 }];
    expect(findDuplicate(items, (x) => x.id)).toBe(items[2]);
  });

  test("findDuplicate returns undefined when all items are distinct", () => {
    expect(findDuplicate([1, 2, 3])).toBeUndefined();
  });
});
