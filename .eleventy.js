import { EleventyHtmlBasePlugin, RenderPlugin } from "@11ty/eleventy";
import schemaPlugin from "@quasibit/eleventy-plugin-schema";
import config from "#data/config.json" with { type: "json" };

// Path prefix for deployments that serve the site from a subdirectory
// (e.g. a GitHub Pages project site at /cfa-static/). The HTML base plugin
// rewrites rendered URLs; templates and frontend code read `pathPrefix`.
const PATH_PREFIX = process.env.PATH_PREFIX || "/";

// Build tools
import { configureJsBundler } from "#build/js-bundler.js";
import { configureScss } from "#build/scss.js";

// Collections
import { configureCollectionUtils } from "#utils/collection-utils.js";
import { configureGuides } from "#collections/guides.js";
import { configureNews } from "#collections/news.js";
import { configureNavigation } from "#collections/navigation.js";
import { configureTags } from "#collections/tags.js";
import { configureBreadcrumbs } from "#eleventy/breadcrumbs.js";
import { configureCollectionLookup } from "#eleventy/collection-lookup.js";
// Validation
import { configureCollectionValidation } from "#eleventy/validate-collections.js";
// Eleventy plugins
import { configureBlocks } from "#eleventy/blocks.js";
import { configureCacheBuster } from "#eleventy/cache-buster.js";
import { configureCanonicalUrl } from "#eleventy/canonical-url.js";
import { configureCollectionFilter } from "#eleventy/collection-filter.js";
import { configureCapture } from "#eleventy/capture.js";
import { configureFeed } from "#eleventy/feed.js";
import { configureFileInfo } from "#eleventy/file-info.js";
import { amendMarkdown, configureFileUtils } from "#eleventy/file-utils.js";
import { configureGitDates } from "#eleventy/git-dates.js";
import { configureHtmlTransform } from "#eleventy/html-transform.js";
import { configureLayoutAliases } from "#eleventy/layout-aliases.js";
import { configureItemsTextList } from "#eleventy/items-text-list.js";
import { configureLinkList } from "#eleventy/link-list.js";

import { configureRemovePattern } from "#eleventy/remove-pattern.js";
import { configureScreenshots } from "#eleventy/screenshots.js";
import { configureStyleBundle } from "#eleventy/style-bundle.js";
import { configureWrapHashtags } from "#eleventy/wrap-hashtags.js";

// Media
import { configureIconify } from "#media/iconify.js";
import { configureImages, processAndWrapImage } from "#media/image.js";
import { configureInlineAsset } from "#media/inline-asset.js";
import { configureThumbnailPlaceholder } from "#media/thumbnail-placeholder.js";
import { configureUnusedImages } from "#media/unused-images.js";

export default async function (eleventyConfig) {
  eleventyConfig.addWatchTarget("./src/**/*");
  eleventyConfig.setLayoutsDirectory("_layouts");
  if (!config.disable_liquid_cache) {
    eleventyConfig.setLiquidOptions({ cache: true });
  }
  eleventyConfig
    .addPassthroughCopy("src/assets")
    .addPassthroughCopy("src/images")
    .addPassthroughCopy({ "src/assets/favicon/*": "/" });

  // Static analysis: validates template collection references before build
  configureCollectionValidation(eleventyConfig);

  eleventyConfig.addPlugin(schemaPlugin);
  eleventyConfig.addPlugin(RenderPlugin);
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
  eleventyConfig.addGlobalData("pathPrefix", PATH_PREFIX);

  eleventyConfig.amendLibrary("md", amendMarkdown);

  configureBlocks(eleventyConfig);
  configureBreadcrumbs(eleventyConfig);
  configureCacheBuster(eleventyConfig);
  configureCollectionLookup(eleventyConfig);
  configureCollectionUtils(eleventyConfig);
  configureCanonicalUrl(eleventyConfig);
  configureCollectionFilter(eleventyConfig);
  configureCapture(eleventyConfig);
  configureLayoutAliases(eleventyConfig);
  await configureFeed(eleventyConfig);
  configureFileInfo(eleventyConfig);
  configureFileUtils(eleventyConfig);
  configureGitDates(eleventyConfig);
  configureGuides(eleventyConfig);
  configureHtmlTransform(eleventyConfig, processAndWrapImage);
  configureLinkList(eleventyConfig);
  await configureImages(eleventyConfig);
  configureIconify(eleventyConfig);
  configureInlineAsset(eleventyConfig);
  configureItemsTextList(eleventyConfig);
  await configureNavigation(eleventyConfig);
  configureNews(eleventyConfig);
  configureRemovePattern(eleventyConfig);
  configureScreenshots(eleventyConfig);
  configureScss(eleventyConfig);
  configureStyleBundle(eleventyConfig);
  configureTags(eleventyConfig);
  configureThumbnailPlaceholder(eleventyConfig);
  configureUnusedImages(eleventyConfig);
  configureWrapHashtags(eleventyConfig);
  configureJsBundler(eleventyConfig);

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
    },
    pathPrefix: PATH_PREFIX,
    templateFormats: ["liquid", "md", "html"],
    htmlTemplateEngine: "liquid",
    markdownTemplateEngine: "liquid",
  };
}
