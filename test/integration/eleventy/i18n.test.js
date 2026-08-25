/**
 * A site that publishes the same page in more than one language has to say so
 * in the rendered HTML: the language on the html element, a reciprocal
 * hreflang set with an x-default, the locale tags, a way to change language,
 * and a breadcrumb trail that does not send a reader back to the base
 * language. None of that is visible from the resolver's unit tests, so it is
 * checked here against a built site.
 */

import { describe, expect, test } from "vitest";
import { ABOUT_GROUP, DE, EN } from "#test/fixtures/languages.js";
import { useSharedSite } from "#test/test-site-factory.js";

const LANGUAGES = [EN, DE];
const TRANSLATIONS = [ABOUT_GROUP];

const alternatesOf = (doc) =>
  [...doc.querySelectorAll('link[rel="alternate"]')].map((link) => [
    link.getAttribute("hreflang"),
    link.getAttribute("href"),
  ]);

const schemaOf = (doc) =>
  JSON.parse(
    doc.querySelector('script[type="application/ld+json"]').textContent,
  );

const languageLinksOf = (doc) =>
  [...doc.querySelectorAll("footer .language-links a")].map((link) => [
    link.getAttribute("hreflang"),
    link.getAttribute("href"),
    link.textContent.trim(),
  ]);

describe("a site publishing two languages", () => {
  const getSite = useSharedSite({
    config: { placeholder_images: false, show_breadcrumbs: true },
    dataFiles: [
      { filename: "languages.json", data: LANGUAGES },
      { filename: "translations.json", data: TRANSLATIONS },
    ],
    files: [
      {
        path: "pages/about.md",
        frontmatter: {
          name: "About",
          title: "About",
          permalink: "/about/",
          blocks: [{ type: "markdown", content: "# About" }],
        },
      },
      {
        path: "pages/ueber-uns.md",
        frontmatter: {
          name: "Über uns",
          title: "Über uns",
          permalink: "/de/ueber-uns/",
          blocks: [{ type: "markdown", content: "# Über uns" }],
        },
      },
      {
        path: "pages/untranslated.md",
        frontmatter: {
          name: "Only English",
          title: "Only English",
          permalink: "/only-english/",
          blocks: [{ type: "markdown", content: "# Only English" }],
        },
      },
    ],
  });

  test("names each page's language on the html element", async () => {
    const english = await getSite().getDoc("/about/index.html");
    const german = await getSite().getDoc("/de/ueber-uns/index.html");
    expect(english.documentElement.getAttribute("lang")).toBe("en");
    expect(german.documentElement.getAttribute("lang")).toBe("de");
  });

  test("gives both pages the same reciprocal hreflang set", async () => {
    const expected = [
      ["en-GB", "https://cfa-static.example.com/about/"],
      ["x-default", "https://cfa-static.example.com/about/"],
      ["de", "https://cfa-static.example.com/de/ueber-uns/"],
    ];
    expect(alternatesOf(await getSite().getDoc("/about/index.html"))).toEqual(
      expected,
    );
    expect(
      alternatesOf(await getSite().getDoc("/de/ueber-uns/index.html")),
    ).toEqual(expected);
  });

  test("writes no hreflang for a page nobody has translated", async () => {
    expect(
      alternatesOf(await getSite().getDoc("/only-english/index.html")),
    ).toEqual([]);
  });

  test("names the locale and its alternates", async () => {
    const doc = await getSite().getDoc("/de/ueber-uns/index.html");
    const content = (property) =>
      [...doc.querySelectorAll(`meta[property="${property}"]`)].map((meta) =>
        meta.getAttribute("content"),
      );
    expect(content("og:locale")).toEqual(["de_DE"]);
    expect(content("og:locale:alternate")).toEqual(["en_GB"]);
  });

  test("links the other language from the footer", async () => {
    expect(
      languageLinksOf(await getSite().getDoc("/about/index.html")),
    ).toEqual([["de", "/de/ueber-uns/", "Deutsch"]]);
    expect(
      languageLinksOf(await getSite().getDoc("/de/ueber-uns/index.html")),
    ).toEqual([["en-GB", "/about/", "English"]]);
  });

  test("offers a language's home page where the page has no counterpart", async () => {
    expect(
      languageLinksOf(await getSite().getDoc("/only-english/index.html")),
    ).toEqual([["de", "/de/", "Deutsch"]]);
  });

  test("keeps a translated page's breadcrumbs in its own language", async () => {
    const doc = await getSite().getDoc("/de/ueber-uns/index.html");
    // The trail is a navigation landmark, and the landmark carries the name.
    const landmark = doc.querySelector("nav:has(> ol.breadcrumbs)");
    expect(landmark.getAttribute("aria-label")).toBe("Brotkrumennavigation");
    const first = landmark.querySelector("a");
    expect(first.getAttribute("href")).toBe("/de/");
    expect(first.textContent.trim()).toBe("Startseite");
  });

  test("publishes the page's own language in its schema", async () => {
    // meta.json carries one site-wide language, so without an override a German
    // page claimed English in its JSON-LD while its html element said German.
    const schema = schemaOf(await getSite().getDoc("/de/ueber-uns/index.html"));
    const languages = schema["@graph"]
      .map((item) => item.inLanguage)
      .filter(Boolean);
    expect(languages.length).toBeGreaterThan(0);
    expect([...new Set(languages)]).toEqual(["de"]);
  });

  test("says the same thing in the breadcrumb schema", async () => {
    // The visible trail and the BreadcrumbList come from one filter, so a
    // German page cannot show one trail and publish another.
    const schema = schemaOf(await getSite().getDoc("/de/ueber-uns/index.html"));
    const list = schema["@graph"].find(
      (item) => item["@type"] === "BreadcrumbList",
    );
    expect(
      list.itemListElement.map((entry) => [entry.item.name, entry.item["@id"]]),
    ).toEqual([
      ["Startseite", "https://cfa-static.example.com/de/"],
      ["Über uns", "https://cfa-static.example.com/de/ueber-uns/"],
    ]);
  });
});
