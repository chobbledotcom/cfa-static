import { describe, expect, test } from "vitest";
import {
  COMMON_FIELDS,
  createEleventyNavigationField,
  createMarkdownField,
  createReferenceField,
  getBodyField,
} from "#scripts/customise-cms/fields.js";

describe("createMarkdownField", () => {
  test("returns code field with markdown when visual editor disabled", () => {
    const field = createMarkdownField("intro", "Intro", false);

    expect(field.type).toBe("code");
    expect(field.options).toEqual({ language: "markdown" });
  });

  test("returns rich-text field when visual editor enabled", () => {
    const field = createMarkdownField("intro", "Intro", true);

    expect(field.type).toBe("rich-text");
    expect(field.options).toBeUndefined();
  });

  test("passes through additional properties", () => {
    const field = createMarkdownField("body", "Body", false, {
      required: true,
    });

    expect(field.required).toBe(true);
    expect(field.name).toBe("body");
  });
});

describe("getBodyField", () => {
  test("returns markdown code field when visual editor disabled", () => {
    const field = getBodyField(false);

    expect(field.name).toBe("body");
    expect(field.type).toBe("code");
  });

  test("returns rich-text field when visual editor enabled", () => {
    const field = getBodyField(true);

    expect(field.name).toBe("body");
    expect(field.type).toBe("rich-text");
  });
});

describe("createReferenceField", () => {
  test("creates multi-reference by default", () => {
    const field = createReferenceField(
      "categories",
      "Categories",
      "categories",
    );

    expect(field.type).toBe("reference");
    expect(field.list).toBe(true);
    expect(field.options).toEqual({
      collection: "categories",
      search: "fields.name",
      value: "{path}",
      label: "{fields.name}",
    });
  });

  test("creates single reference when multiple is false", () => {
    const field = createReferenceField("author", "Author", "team", false);

    expect(field.list).toBeUndefined();
  });
});

describe("COMMON_FIELDS", () => {
  test("requires collection names", () => {
    expect(COMMON_FIELDS.name.required).toBe(true);
  });
});

describe("createEleventyNavigationField", () => {
  test("includes only key and order by default", () => {
    const field = createEleventyNavigationField();
    const names = field.fields.map((f) => f.name);

    expect(field.name).toBe("eleventyNavigation");
    expect(names).toEqual(["key", "order"]);
  });

  test("adds a url field when includeUrl is set", () => {
    const field = createEleventyNavigationField(true);
    const names = field.fields.map((f) => f.name);

    expect(names).toEqual(["key", "order", "url"]);
  });
});
