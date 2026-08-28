// Search UI tests
// Tests renderResult, createSearchController, and initSearch behavior

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
  createSearchController,
  handleSubmit,
  initSearch,
  loadPagefind,
  readQueryParam,
  renderResult,
} from "#public/ui/search.js";
import { withTempDirAsync } from "#test/test-utils.js";

// ============================================
// Mock pagefind API
// ============================================

const createMockResult = (overrides = {}) => ({
  url: overrides.url ?? "/products/test-product/",
  meta: {
    title: "Test Product",
    image: "/img/test.jpg",
    ...overrides.meta,
  },
  excerpt: overrides.excerpt ?? "A <mark>test</mark> product description.",
});

const createMockResultHandle = (overrides = {}) => ({
  data: vi.fn(() => Promise.resolve(createMockResult(overrides))),
});

const createMockPagefind = (resultHandles = []) => ({
  init: vi.fn(() => Promise.resolve()),
  search: vi.fn(() => Promise.resolve({ results: resultHandles })),
});

// ============================================
// DOM setup helpers
// ============================================

const SEARCH_HTML = `
  <div class="design-system">
    <form action="/search/" method="get" class="search-box">
      <input type="search" name="q" placeholder="Search" autocomplete="off">
      <button type="submit">Search</button>
    </form>
    <div id="search-results">
      <p class="search-message"></p>
      <ul class="search-results-list"></ul>
      <button class="search-load-more btn btn--secondary" hidden>Load more</button>
    </div>
  </div>
`;

const getElements = () => ({
  list: document.querySelector(".search-results-list"),
  message: document.querySelector(".search-message"),
  loadMore: document.querySelector(".search-load-more"),
  input: document.querySelector("input[type='search']"),
});

const setSearchParam = (value) => {
  const url = new URL(window.location.href);
  url.searchParams.set("q", value);
  window.history.replaceState(null, "", url);
};

/** Set up DOM + pagefind mock, create controller, run a search, return controller */
const searchWith = async (handleCount, query = "test") => {
  document.body.innerHTML = SEARCH_HTML;
  const handles = Array.from({ length: handleCount }, () =>
    createMockResultHandle(),
  );
  window.pagefind = createMockPagefind(handles);
  const controller = createSearchController(getElements());
  await controller.runSearch(query);
  return controller;
};

afterEach(() => {
  document.body.innerHTML = "";
  delete window.pagefind;
  window.history.replaceState(null, "", window.location.pathname);
});

// ============================================
// renderResult
// ============================================

describe("renderResult", () => {
  test("creates list item with link to result URL", () => {
    const el = renderResult(createMockResult());
    expect(el.tagName).toBe("LI");
    expect(el.className).toBe("search-result");
    expect(el.querySelector("a").href).toContain("/products/test-product/");
  });

  test("includes image when meta.image is present", () => {
    const el = renderResult(createMockResult());
    const img = el.querySelector("img");
    expect(img).not.toBeNull();
    expect(img.src).toContain("/img/test.jpg");
    expect(img.loading).toBe("lazy");
    expect(img.className).toBe("search-result__image");
  });

  test("omits image when meta.image is absent", () => {
    const result = createMockResult();
    delete result.meta.image;
    const el = renderResult(result);
    expect(el.querySelector("img")).toBeNull();
  });

  test("displays title from meta", () => {
    const el = renderResult(createMockResult());
    expect(el.querySelector("h3").textContent).toBe("Test Product");
  });

  test("renders excerpt HTML with highlight marks", () => {
    const el = renderResult(createMockResult());
    const excerpt = el.querySelector(".search-result__body p");
    expect(excerpt.innerHTML).toContain("<mark>");
  });

  test("omits excerpt paragraph when not provided", () => {
    const el = renderResult(createMockResult({ excerpt: "" }));
    expect(el.querySelector(".search-result__body p")).toBeNull();
  });
});

// ============================================
// loadPagefind
// ============================================

describe("loadPagefind", () => {
  test("returns cached window.pagefind when already loaded", async () => {
    const mockPf = createMockPagefind();
    window.pagefind = mockPf;
    const result = await loadPagefind();
    expect(result).toBe(mockPf);
  });

  test("imports pagefind from the site's path prefix and initialises it", async () => {
    await withTempDirAsync("search-pagefind", async (dir) => {
      // A real module on disk stands in for the built site's
      // /pagefind/pagefind.js, reached through the data-path-prefix
      // attribute exactly as a deployed page would reach it.
      mkdirSync(join(dir, "pagefind"), { recursive: true });
      writeFileSync(
        join(dir, "pagefind/pagefind.js"),
        [
          "export const init = () => {",
          "  globalThis.__pagefindInits = (globalThis.__pagefindInits || 0) + 1;",
          "};",
          "export const options = (value) => {",
          "  globalThis.__pagefindOptions = value;",
          "};",
          "",
        ].join("\n"),
      );
      const tag = document.createElement("script");
      tag.dataset.pathPrefix = `${dir}/`;
      document.body.append(tag);
      window.pagefind = undefined;

      try {
        const pagefind = await loadPagefind();

        expect(globalThis.__pagefindInits).toBe(1);
        expect(globalThis.__pagefindOptions).toEqual({ baseUrl: `${dir}/` });
        expect(typeof pagefind.init).toBe("function");
      } finally {
        tag.remove();
        delete globalThis.__pagefindInits;
        delete globalThis.__pagefindOptions;
      }
    });
  });
});

// ============================================
// readQueryParam
// ============================================

describe("readQueryParam", () => {
  test("returns q param from URL", () => {
    setSearchParam("hello");

    expect(readQueryParam()).toBe("hello");
  });

  test("returns null when no q param", () => {
    expect(readQueryParam()).toBeNull();
  });
});

// ============================================
// handleSubmit
// ============================================

describe("handleSubmit", () => {
  test("calls runSearch with trimmed input value", () => {
    const controller = {
      input: { value: "  widgets  " },
      runSearch: vi.fn(),
    };
    const event = { preventDefault: vi.fn() };

    handleSubmit(controller)(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(controller.runSearch).toHaveBeenCalledWith("widgets");
  });

  test("updates URL with query parameter", () => {
    const controller = {
      input: { value: "gadgets" },
      runSearch: vi.fn(),
    };

    handleSubmit(controller)({ preventDefault: vi.fn() });

    expect(window.location.search).toContain("q=gadgets");
  });

  test("does not search when input is empty", () => {
    const controller = {
      input: { value: "   " },
      runSearch: vi.fn(),
    };

    handleSubmit(controller)({ preventDefault: vi.fn() });

    expect(controller.runSearch).not.toHaveBeenCalled();
  });
});

// ============================================
// createSearchController
// ============================================

describe("createSearchController", () => {
  test("uses custom loader when provided", async () => {
    document.body.innerHTML = SEARCH_HTML;
    const pagefind = createMockPagefind([createMockResultHandle()]);
    const loader = vi.fn(() => Promise.resolve(pagefind));
    const controller = createSearchController(getElements(), loader);

    await controller.runSearch("test");
    expect(loader).toHaveBeenCalled();
    expect(pagefind.search).toHaveBeenCalledWith("test");
    expect(document.querySelectorAll(".search-result").length).toBe(1);
  });

  test("clears results when query is empty", async () => {
    document.body.innerHTML = SEARCH_HTML;
    window.pagefind = createMockPagefind();
    const controller = createSearchController(getElements());

    await controller.runSearch("");
    expect(document.querySelector(".search-message").textContent).toBe("");
    expect(document.querySelector(".search-results-list").innerHTML).toBe("");
    expect(document.querySelector(".search-load-more").hidden).toBe(true);
  });

  test("displays message for no results", async () => {
    await searchWith(0, "nonexistent");
    expect(document.querySelector(".search-message").textContent).toBe(
      "No results found.",
    );
    expect(document.querySelector(".search-load-more").hidden).toBe(true);
  });

  test("renders results and shows count message", async () => {
    await searchWith(2);
    expect(document.querySelector(".search-message").textContent).toBe(
      "2 results found.",
    );
    expect(document.querySelectorAll(".search-result").length).toBe(2);
  });

  test("single result uses singular message and hides load-more", async () => {
    await searchWith(1);
    expect(document.querySelector(".search-message").textContent).toBe(
      "1 result found.",
    );
    expect(document.querySelector(".search-load-more").hidden).toBe(true);
  });

  test("shows first page and exposes showMore for remaining", async () => {
    const controller = await searchWith(12);
    expect(document.querySelectorAll(".search-result").length).toBe(10);
    expect(document.querySelector(".search-load-more").hidden).toBe(false);

    await controller.showMore();

    expect(document.querySelectorAll(".search-result").length).toBe(12);
    expect(document.querySelector(".search-load-more").hidden).toBe(true);
  });

  test("new search clears previous results", async () => {
    document.body.innerHTML = SEARCH_HTML;
    const pagefind = createMockPagefind([
      createMockResultHandle({ url: "/first/" }),
      createMockResultHandle({ url: "/second/" }),
    ]);
    window.pagefind = pagefind;
    const controller = createSearchController(getElements());

    await controller.runSearch("first query");
    expect(document.querySelectorAll(".search-result").length).toBe(2);

    pagefind.search = vi.fn(() =>
      Promise.resolve({
        results: [createMockResultHandle({ url: "/third/" })],
      }),
    );
    await controller.runSearch("second query");
    expect(document.querySelectorAll(".search-result").length).toBe(1);
  });

  test("passes input element through on returned controller", () => {
    document.body.innerHTML = SEARCH_HTML;
    const elements = getElements();
    window.pagefind = createMockPagefind();
    const controller = createSearchController(elements);
    expect(controller.input).toBe(elements.input);
  });
});

// ============================================
// initSearch
// ============================================

describe("initSearch", () => {
  test("does nothing when #search-results is absent", () => {
    document.body.innerHTML = "<div>No search here</div>";
    expect(() => initSearch()).not.toThrow();
  });

  test("populates input from URL query param", () => {
    document.body.innerHTML = SEARCH_HTML;
    window.pagefind = createMockPagefind();

    setSearchParam("hello");

    initSearch();

    expect(document.querySelector("input[type='search']").value).toBe("hello");
  });

  test("populates page input, not unrelated navigation search box", () => {
    document.body.innerHTML = `
      <body class="design-system">
        <nav>
          <form class="search-box">
            <input type="search" name="q" id="nav-input">
          </form>
        </nav>
        <main>
          <div data-pagefind-ignore>
            <div class="design-system">
              <form action="/search/" method="get" class="search-box">
                <input type="search" name="q" id="page-input">
              </form>
            </div>
            <div id="search-results">
              <p class="search-message"></p>
              <ul class="search-results-list"></ul>
              <button class="search-load-more" hidden></button>
            </div>
          </div>
        </main>
      </body>
    `;
    window.pagefind = createMockPagefind();

    setSearchParam("hello");

    initSearch();

    expect(document.querySelector("#page-input").value).toBe("hello");
    expect(document.querySelector("#nav-input").value).toBe("");
  });

  test("form submit with empty input does not search", () => {
    document.body.innerHTML = SEARCH_HTML;
    window.pagefind = createMockPagefind();

    initSearch();
    document.querySelector("input[type='search']").value = "   ";
    document
      .querySelector(".search-box")
      .dispatchEvent(new Event("submit", { cancelable: true }));

    expect(window.pagefind.search).not.toHaveBeenCalled();
  });
});
