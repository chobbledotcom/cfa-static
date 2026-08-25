---
permalink: false
layout: ""
---

# \_lib Directory Structure

This directory contains all JavaScript modules for the Eleventy build system, organized by concern.

## Directory Layout

```
_lib/
├── build/          # Build tooling (JS bundling, SCSS, themes)
├── collections/    # Domain collections (news, guides, navigation)
├── config/         # Configuration helpers (used by data files)
├── eleventy/       # Eleventy-specific plugins and filters
├── media/          # Image processing and asset handling
├── public/         # Frontend JavaScript (bundled by esbuild)
├── transforms/     # HTML output transforms
└── utils/          # Pure utility functions (no Eleventy dependencies)
```

## Import Aliases

The project uses Node.js subpath imports (defined in `package.json`) for clean imports:

```js
import { memoize } from "#utils/memoize.js";
import { configureNews } from "#collections/news.js";
import { configureImages } from "#media/image.js";
import config from "#data/config.json" with { type: "json" };
```

See `package.json`'s `imports` field for the full alias list.

## Conventions

### Eleventy Plugin Files

Files that register with Eleventy export a `configureX` function, and
`.eleventy.js` runs every configurator from its `CONFIGURATORS` list:

```js
export function configureNews(eleventyConfig) {
  eleventyConfig.addCollection("news", ...);
}
```

Simple standalone filters live in the central registry in
`eleventy/filters.js` rather than one module each; a code-quality test
fails the suite when a registered filter has no template consumer.

### Directory Details

#### `build/`

Build-time tooling that runs during the Eleventy build process:

- `js-bundler.js` - JavaScript bundling
- `scss.js` - SCSS compilation
- `theme-compiler.js` - Compiles theme SCSS files for theme-switcher
- `css-variable-validator.js` - Validates CSS custom properties

#### `collections/`

Domain-specific collections and their associated filters:

- `news.js` - News posts
- `guides.js` - Guide categories and pages
- `navigation.js` - Site navigation rendering

#### `config/`

Configuration helpers separated from data files (required because Eleventy data files cannot have named exports):

- `helpers.js` - Config defaults
- `validated-config.js` - Startup validation for site.json and languages

#### `eleventy/`

Eleventy-specific configuration helpers:

- `filters.js` - Central registry of standalone filters
- `blocks.js` - Block rendering filters
- `breadcrumbs.js` - Breadcrumb + schema.org decorators
- `collection-lookup.js` - O(1) slug/path lookups
- `file-utils.js` - Snippet rendering and markdown filters
- `html-transform.js` - Unified HTML output transform
- `layout-aliases.js` - Auto-registers layout aliases
- `screenshots.js` - Optional post-build screenshot capture
- `validate-collections.js` - Build-time collection reference validation

#### `media/`

Image and asset processing:

- `image.js` - Responsive images, cropping, LQIP
- `image-pipeline.js` - Shared local/external processing steps
- `iconify.js` - Iconify SVG fetching and caching
- `unused-images.js` - Reports unused images after build

#### `public/`

Frontend JavaScript bundled by esbuild (`bundle.js` is the entry).

#### `transforms/`

HTML output transforms applied by `eleventy/html-transform.js`.

#### `utils/`

Pure utility functions with no Eleventy dependencies:

- `block-schema.js` - Block registry and validation
- `sorting.js` - Collection sorting utilities
- `slug-utils.js` - Slug normalization and permalink building
- `schema-helper.js` - Schema.org/structured data helpers
