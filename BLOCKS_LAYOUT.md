# Design System Blocks Reference

Technical reference for the composable page blocks in the CfA Static design system. Blocks are declared in YAML frontmatter and rendered by the block pipeline.

## Architecture

### Rendering Pipeline

```
frontmatter blocks[] → base.html → blocks.html → render-block.html → [block template]
```

**Layout:** `src/_layouts/base.html` applies `class="design-system"` to `<body>`, loads the design system CSS bundle, and iterates blocks via `blocks.html`.

**Block loop** (`src/_includes/design-system/blocks.html`): Each block becomes a `<section>`. If `block.dark` is true, the section gets `class="dark"`. Container width is determined by block type via the `blockContainerWidth` Liquid filter (registered in `src/_lib/eleventy/blocks.js`, backed by `getBlockContainerWidth()` in `src/_lib/utils/block-schema.js`). Each block module declares its own width via an optional `containerWidth` export; modules that omit it default to `"wide"` (`.container-wide`, 1200px). Other values are `"full"` (no wrapper) and `"narrow"` (`.container-narrow`, 680px).

**Block router** (`src/_includes/design-system/render-block.html`): A Liquid `case` statement dispatching `block.type` to the appropriate include template.

### Common Block Properties

Every block object supports these properties (handled by blocks.html, not the individual templates):

| Property | Type | Effect |
|---|---|---|
| `type` | string | **Required.** Selects which template to render. |
| `dark` | boolean | If true, adds `class="dark"` to the wrapping `<section>` (dark bg + inverted colors). |

### Section Behavior

- Sections use `@mixin section` which applies `$space-3xl` (96px) vertical padding (60% on mobile).
- `section.dark` inverts all CSS custom properties to dark palette.
- Even-numbered sections automatically get `--body-background-alt` background.
- Sections containing `.split-full` have zero padding (panels self-pad).

### CSS Scoping

All design system styles are scoped under `.design-system`. CSS custom properties are declared at `:root` for theme overridability.

### Scroll Animations

Blocks can use `data-reveal` attributes on elements. Values: `""` (fade up), `"left"`, `"right"`, `"scale"`. Activated by IntersectionObserver adding `.is-visible` class. Respects `prefers-reduced-motion`.

---

<!-- BEGIN GENERATED BLOCKS -->

## Block Types

### `section-header`

Standalone section header with rich text intro.

**Component:** `block_section_header`
**Template:** `src/_includes/design-system/blocks/section-header.html`
**SCSS:** `src/css/design-system/_base.scss`
**HTML root:** `<div class="section-header prose">`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `intro` | string | **required** | Rich text content rendered as markdown. Use headings and body text together. |
| `align` | string | `"center"` | Text alignment. `"center"` adds `.text-center`. |
| `class` | string | — | Extra CSS classes. |

---

### `features`

Grid of feature cards with optional icons, names, and descriptions.

**Component:** `block_features`
**Template:** `src/_includes/design-system/blocks/features.html`
**SCSS:** `src/css/design-system/_feature.scss`
**HTML root:** `<ul class="features" role="list"> containing <li><article class="feature"> items`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `items` | array | **required** | Feature objects. Each: `{icon, icon_label, name, description, style}`. Icon can be an Iconify ID (`"prefix:name"`), image path (`"/images/foo.svg"`), or raw HTML/emoji. |
| `intro_content` | string | — | Markdown content rendered above the block in `.prose`. |
| `reveal` | boolean | `true` | Adds `data-reveal` to each item. |
| `center` | boolean | `false` | If true, centers feature text. |

---

### `image-cards`

Grid of cards featuring images with names and optional descriptions.

**Component:** `block_image_cards`
**Template:** `src/_includes/design-system/blocks/image-cards.html`
**SCSS:** `src/css/design-system/_items.scss`
**HTML root:** `<ul class="items" role="list">`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `items` | array | **required** | Card objects. Each: `{image, name, description, link}`. Images processed by `{% image %}` shortcode for responsive srcset + LQIP. |
| `reveal` | boolean | `true` | Adds `data-reveal` to each item. |
| `image_aspect_ratio` | string | — | Aspect ratio for images, e.g. `"16/9"`, `"1/1"`, `"4/3"`. |
| `intro_content` | string | — | Markdown content rendered above the block in `.prose`. |

---

### `stats`

Key metrics displayed as large numbers with labels.

**Component:** `block_stats`
**Template:** `src/_includes/design-system/blocks/stats.html`
**SCSS:** `src/css/design-system/_stats.scss`
**HTML root:** `<dl class="stats">`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `items` | array | **required** | Stat objects: `{value, label}` or pipe-delimited strings `"value|label"`. |
| `intro_content` | string | — | Markdown content rendered above the block in `.prose`. |
| `reveal` | boolean | `true` | Adds `data-reveal` to each stat. |

---

### `code-block`

Terminal-style code display with macOS-like toolbar header.

**Component:** `block_code_block`
**Template:** `src/_includes/design-system/blocks/code-block.html`
**SCSS:** `src/css/design-system/_code-block.scss`
**HTML root:** `<div class="code-block">`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `filename` | string | **required** | Displayed in the toolbar header. |
| `code` | string | **required** | Code content. Rendered in `<pre><code>`. |
| `language` | string | — | Sets `data-language` attribute (for future syntax highlighting). |
| `reveal` | boolean | `true` | `data-reveal` value. |

---

### `hero`

Full-width hero banner with optional badge, markdown content, and action buttons.

**Component:** `block_hero`
**Template:** `src/_includes/design-system/blocks/hero.html`
**SCSS:** `src/css/design-system/_hero.scss`
**HTML root:** `<header class="hero">`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `badge` | string | — | Small pill label above the content. Renders as `<span class="badge">`. |
| `content` | string | **required** | Markdown content rendered in `.prose`. Start with a `# Heading`; paragraphs get `body-lg` size, muted color, max-width `$width-narrow` (680px). |
| `buttons` | array | — | Action buttons below the content. Each: `{text, href, variant, size}`. Variants: `"primary"` (filled), `"secondary"` (outlined), `"ghost"` (transparent). Sizes: `"sm"`, `"lg"`, or omit for default. |
| `reveal` | string | — | `data-reveal` value. |
| `class` | string | — | Extra CSS classes on the `<header>`. Use `"gradient"` for gradient bg. |

---

### `split-image`

Two-column layout with text content and a responsive image.

**Component:** `block_split_image`
**Template:** `src/_includes/design-system/split.html`
**SCSS:** `src/css/design-system/_split.scss`
**HTML root:** `<div class="split">`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `subtitle` | string | — | Subtitle with `.text-muted` styling. |
| `content` | string | — | Main content with markdown headings (e.g. `## Heading`). Rendered through `renderContent: "md"` filter, wrapped in `.prose`. |
| `reverse` | boolean | `false` | Reverses column order (content right, figure left) on desktop. |
| `reveal_content` | string | `"left"` | `data-reveal` for the text side. Auto-set to `"right"` when `reverse` is true. |
| `reveal_figure` | string | `"scale"` | `data-reveal` for the figure side. |
| `button` | object | — | `{text, href, variant}`. Rendered below content. Default variant: `"secondary"`. |
| `figure_src` | string | **required** | Image path. |
| `figure_alt` | string | — | Alt text for the image. |
| `figure_caption` | string | — | Visible caption below the image. |

---

### `split-code`

Two-column layout with text content and a code block.

**Component:** `block_split_code`
**Template:** `src/_includes/design-system/split.html`
**SCSS:** `src/css/design-system/_split.scss`
**HTML root:** `<div class="split">`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `subtitle` | string | — | Subtitle with `.text-muted` styling. |
| `content` | string | — | Main content with markdown headings (e.g. `## Heading`). Rendered through `renderContent: "md"` filter, wrapped in `.prose`. |
| `reverse` | boolean | `false` | Reverses column order (content right, figure left) on desktop. |
| `reveal_content` | string | `"left"` | `data-reveal` for the text side. Auto-set to `"right"` when `reverse` is true. |
| `reveal_figure` | string | `"scale"` | `data-reveal` for the figure side. |
| `button` | object | — | `{text, href, variant}`. Rendered below content. Default variant: `"secondary"`. |
| `figure_filename` | string | — | Displayed filename in the code block header. |
| `figure_code` | string | **required** | Code content. |
| `figure_language` | string | — | Syntax highlighting language. |

---

### `split-icon-links`

Two-column layout with text content and an icon-links list.

**Component:** `block_split_icon_links`
**Template:** `src/_includes/design-system/split.html`
**SCSS:** `src/css/design-system/_split.scss`
**HTML root:** `<div class="split">`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `subtitle` | string | — | Subtitle with `.text-muted` styling. |
| `content` | string | — | Main content with markdown headings (e.g. `## Heading`). Rendered through `renderContent: "md"` filter, wrapped in `.prose`. |
| `reverse` | boolean | `false` | Reverses column order (content right, figure left) on desktop. |
| `reveal_content` | string | `"left"` | `data-reveal` for the text side. Auto-set to `"right"` when `reverse` is true. |
| `reveal_figure` | string | `"scale"` | `data-reveal` for the figure side. |
| `button` | object | — | `{text, href, variant}`. Rendered below content. Default variant: `"secondary"`. |
| `figure_items` | array | **required** | Icon-link objects. Each: `{icon, text, url}`. `url` is optional. Icon can be an Iconify ID (`"prefix:name"`), image path, or raw HTML/emoji. |

---

### `split-html`

Two-column layout with text content and custom HTML.

**Component:** `block_split_html`
**Template:** `src/_includes/design-system/split.html`
**SCSS:** `src/css/design-system/_split.scss`
**HTML root:** `<div class="split">`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `subtitle` | string | — | Subtitle with `.text-muted` styling. |
| `content` | string | — | Main content with markdown headings (e.g. `## Heading`). Rendered through `renderContent: "md"` filter, wrapped in `.prose`. |
| `reverse` | boolean | `false` | Reverses column order (content right, figure left) on desktop. |
| `reveal_content` | string | `"left"` | `data-reveal` for the text side. Auto-set to `"right"` when `reverse` is true. |
| `reveal_figure` | string | `"scale"` | `data-reveal` for the figure side. |
| `button` | object | — | `{text, href, variant}`. Rendered below content. Default variant: `"secondary"`. |
| `figure_html` | string | **required** | Raw HTML content for the figure side. |

---

### `split-callout`

Two-column layout with text content and a styled callout box with icon, name, and subtitle.

**Component:** `block_split_callout`
**Template:** `src/_includes/design-system/blocks/split-callout.html`
**SCSS:** `src/css/design-system/_split-callout.scss`
**HTML root:** `<div class="split-callout">`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `subtitle` | string | — | Subtitle with `.text-muted` styling. |
| `content` | string | — | Main content with markdown headings (e.g. `## Heading`). Rendered through `renderContent: "md"` filter, wrapped in `.prose`. |
| `reverse` | boolean | `false` | Reverses column order (content right, figure left) on desktop. |
| `reveal_content` | string | `"left"` | `data-reveal` for the text side. Auto-set to `"right"` when `reverse` is true. |
| `reveal_figure` | string | `"scale"` | `data-reveal` for the figure side. |
| `button` | object | — | `{text, href, variant}`. Rendered below content. Default variant: `"secondary"`. |
| `figure_icon` | string | — | Icon content: Iconify ID (`prefix:name`), emoji, or image path. |
| `figure_name` | string | **required** | Bold heading text in the callout box. |
| `figure_subtitle` | string | — | Supporting text below the name. |
| `figure_variant` | string | `"primary"` | Color scheme: `"primary"`, `"secondary"`, `"gradient"`, or a custom CSS gradient string. |

---

### `split-full`

Full-width two-panel layout with distinct background colors per side.

**Component:** `block_split_full`
**Template:** `src/_includes/design-system/blocks/split-full.html`
**SCSS:** `src/css/design-system/_split.scss`
**HTML root:** `<div class="split-full">`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `variant` | string | — | Color scheme: `"dark-left"`, `"dark-right"`, `"primary-left"`, `"primary-right"`. |
| `left_content` | string | — | Left panel content with markdown headings (e.g. `## Heading`). Rendered as markdown via `.prose`. |
| `left_button` | object | — | `{text, href, variant}`. |
| `right_content` | string | — | Right panel content with markdown headings (e.g. `## Heading`). Rendered as markdown via `.prose`. |
| `right_button` | object | — | `{text, href, variant}`. |
| `reveal_left` | string | — | `data-reveal` for left panel. |
| `reveal_right` | string | — | `data-reveal` for right panel. |

Variants: `"dark-left"` / `"dark-right"` (dark bg + light text), `"primary-left"` / `"primary-right"` (`--color-link` bg + contrast text). Button colors automatically invert in dark/primary panels. The parent `<section>` has zero padding — panels handle their own padding.

---

### `cta`

Call-to-action banner with gradient background.

**Component:** `block_cta`
**Template:** `src/_includes/design-system/blocks/cta.html`
**SCSS:** `src/css/design-system/_cta.scss`
**HTML root:** `<aside class="cta">`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `content` | string | **required** | Markdown content with optional heading (e.g. `## Heading`). `body-lg`, 0.9 opacity, max-width `$width-narrow`. |
| `button` | object | — | `{text, href, variant, size}`. Default variant: `"secondary"`, default size: `"lg"`. |
| `reveal` | string | — | `data-reveal` value. |

---

### `callout`

One-column callout/note with icon, name, and short content — for content warnings, advisories, tips, etc.

**Component:** `block_callout`
**Template:** `src/_includes/design-system/blocks/callout.html`
**SCSS:** `src/css/design-system/_callout.scss`
**HTML root:** `<aside class="callout">`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `variant` | string | `"info"` | Color scheme: `"info"`, `"warning"`, `"success"`, or `"danger"`. |
| `icon` | string | — | Icon content: Iconify ID (`prefix:name`), emoji, or image path. |
| `name` | string | — | Bold heading text. |
| `content` | string | **required** | Markdown content rendered via `renderContent: "md"` inside `.prose`. |

---

### `image-background`

Full-width image background with hero-style overlay content (badge, markdown content, buttons) and optional parallax.

**Component:** `block_image_background`
**Template:** `src/_includes/design-system/blocks/image-background.html`
**SCSS:** `src/css/design-system/_image-background.scss`
**HTML root:** `<div class="image-background">`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `image` | string | **required** | Image path. |
| `image_alt` | string | `"Background image"` | Alt text. |
| `class` | string | — | Extra CSS classes. |
| `badge` | string | — | Small pill label above the content. Renders as `<span class="badge">`. |
| `content` | string | — | Markdown overlay content rendered in `.prose` inside the `<figcaption>`. |
| `buttons` | array | — | Action buttons below the content. Each: `{text, href, variant, size}`. Variants: `"primary"` (filled), `"secondary"` (outlined), `"ghost"` (transparent). Sizes: `"sm"`, `"lg"`, or omit for default. |
| `reveal` | string | — | `data-reveal` value. |
| `parallax` | boolean | `false` | Enables CSS `animation-timeline: scroll()` parallax effect. |
| `tint` | boolean | `false` | Applies a dark gradient overlay for text legibility over the background image. |

Image processed via `{% image %}` at widths 2560/1920/1280/960/640, cropped to 16/9. Parallax uses `animation-timeline: scroll()` for native CSS scroll-driven translation.

---

### `items`

Displays an Eleventy collection as a card grid or horizontal slider.

**Component:** `block_items`
**Template:** `src/_includes/design-system/blocks/items.html`
**SCSS:** `src/css/design-system/_items.scss`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `collection` | string | **required** | Name of an Eleventy collection (e.g. `"news"`, `"guideCategories"`). |
| `intro_content` | string | — | Markdown content rendered above the block in `.prose`. |
| `horizontal` | boolean | `false` | If true, renders as a horizontal slider instead of a wrapping grid. |
| `masonry` | boolean | `false` | If true, renders as a masonry grid using uWrap for zero-reflow height prediction. |
| `filter` | object | — | Filter object: `{property, includes, equals}`. `property` is a dot-notation path (e.g. `"url"`, `"data.name"`). When the resolved value is an array, the operator runs against each element (per-element exact match for `equals`, per-element substring for `includes`). `includes` matches substring; `equals` matches exact value. |
| `image_aspect_ratio` | string | — | Aspect ratio for images, e.g. `"16/9"`, `"1/1"`, `"4/3"`. |

---

### `items-array`

Renders items from an explicit list of paths. The collection is inferred dynamically from each item's path. Directory paths (ending in `/` or with no `.md` extension) expand to every item in that directory.

**Component:** `block_items_array`
**Template:** `src/_includes/design-system/blocks/items-array.html`
**SCSS:** `src/css/design-system/_items.scss`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `items` | array | — | Array of path strings. Each entry may be a file path (e.g. `src/news/example.md`) or a directory path (e.g. `src/news` or `src/news/`), in which case every item in that directory is included in place. |
| `intro_content` | string | — | Markdown content rendered above the block in `.prose`. |
| `horizontal` | boolean | `false` | If true, renders as a horizontal slider instead of a wrapping grid. |
| `masonry` | boolean | `false` | If true, renders as a masonry grid using uWrap for zero-reflow height prediction. |
| `filter` | object | — | Filter object: `{property, includes, equals}`. `property` is a dot-notation path (e.g. `"url"`, `"data.name"`). When the resolved value is an array, the operator runs against each element (per-element exact match for `equals`, per-element substring for `includes`). `includes` matches substring; `equals` matches exact value. |
| `image_aspect_ratio` | string | — | Aspect ratio for images, e.g. `"16/9"`, `"1/1"`, `"4/3"`. |

---

### `items-text-list`

Renders a collection as a comma-separated inline list of links, with optional introductory markdown text prepended. Excludes the current page from the list.

**Component:** `block_items_text_list`
**Template:** `src/_includes/design-system/blocks/items-text-list.html`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `collection` | string | **required** | Name of an Eleventy collection (e.g. `"services"`, `"events"`). |
| `intro_content` | string | — | Markdown content rendered above the block in `.prose`. |

---

### `link-columns`

Renders a collection as a plain-text unordered list of links arranged in responsive CSS columns. Optionally strips matching text via a regex so repetitive prefixes/suffixes can be removed.

**Component:** `block_link_columns`
**Template:** `src/_includes/design-system/blocks/link-columns.html`
**SCSS:** `src/css/design-system/_link-columns.scss`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `collection` | string | **required** | Name of an Eleventy collection (e.g. `"locations"`, `"services"`). |
| `intro_content` | string | — | Markdown content rendered above the block in `.prose`. |
| `filter` | object | — | Filter object: `{property, includes, equals}`. `property` is a dot-notation path (e.g. `"url"`, `"data.name"`). When the resolved value is an array, the operator runs against each element (per-element exact match for `equals`, per-element substring for `includes`). `includes` matches substring; `equals` matches exact value. |
| `remove_text` | string | — | Regex pattern (JavaScript syntax, global flag implied). Each match is removed from every link's display text and the result is trimmed. Useful for stripping repetitive prefixes like `"Service in "` so links render tidier. |

---

### `markdown`

Renders markdown content as rich text.

**Component:** `block_markdown`
**Template:** `src/_includes/design-system/blocks/markdown.html`
**SCSS:** `src/css/design-system/_prose.scss`
**HTML root:** `<div class="prose">`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `content` | string | **required** | Markdown content. Passed through `renderContent: "md"` filter. |

---

### `html`

Outputs raw HTML without processing.

**Component:** `block_html`
**Template:** `src/_includes/design-system/blocks/html.html`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `content` | string | **required** | Raw HTML. Output directly with `{{ block.content }}`. |

No wrapping element. Useful for custom embeds, iframes, or one-off HTML.

---

### `iframe-embed`

Third-party iframe embed (itch.io widgets, Buttondown, Bandcamp, Stripe buttons, etc).

**Component:** `block_iframe_embed`
**Template:** `src/_includes/design-system/blocks/iframe-embed.html`
**SCSS:** `src/css/design-system/_iframe-embed.scss`
**HTML root:** `<div class="iframe-embed">`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `src` | string | **required** | Full URL of the iframe to embed. |
| `name` | string | **required** | Accessible name (rendered as the iframe's `title` attribute). |
| `width` | number | — | Fixed pixel width. Omit to fill the container. |
| `height` | number | — | Fixed pixel height. Required for non-responsive embeds unless `aspect_ratio` is set. |
| `aspect_ratio` | string | — | CSS `aspect-ratio` for responsive height, e.g. `"16/9"`. Alternative to `height`. |
| `max_width` | string | — | CSS max-width on the wrapper, e.g. `"560px"`. |
| `sandbox` | string | — | Space-separated sandbox tokens, e.g. `"allow-scripts allow-same-origin allow-forms"`. |
| `allow` | string | — | `allow` attribute for iframe permissions policy. |
| `scrolling` | string | — | Legacy `scrolling` attribute, e.g. `"no"`. |
| `intro_content` | string | — | Markdown content rendered above the block in `.prose`. |

Provide either `height` for a fixed-height embed or `aspect_ratio` (e.g. `16/9`) for a responsive one. Use `max_width` to cap the embed width within the container.

---

### `include`

Includes an arbitrary template file.

**Component:** `block_include`
**Template:** `src/_includes/design-system/blocks/include.html`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `file` | string | **required** | Path to the template file to include. |

Escape hatch for custom content that doesn't fit the block system. The `file` value is passed straight to `{% include %}`.

---

### `news-meta`

Renders a news post's metadata: author name plus the post date.

**Component:** `block_news_meta`
**Template:** `src/_includes/design-system/blocks/news-meta.html`

News-only block. No parameters. Reads `author` from the page data and renders it as plain text, falling back to a date-only block when there is no author.

---

### `faqs`

Renders question/answer pairs as a definition list. Available on all page types.

**Component:** `block_faqs`
**Template:** `src/_includes/design-system/blocks/faqs.html`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `items` | array | **required** | FAQ question/answer pairs. Answers support markdown formatting. Falls back to page-level `faqs` array if omitted. |
| `intro_content` | string | — | Markdown content rendered above the block in `.prose`. |

Define FAQs inline via `items`, or omit to fall back to the page-level `faqs` array (useful for pages and guide pages that declare FAQs in frontmatter). Answers are rendered as markdown.

---

### `guide-categories`

Displays the site-wide guide categories.

**Component:** `block_guide_categories`
**Template:** `src/_includes/design-system/blocks/guide-categories.html`

No block-level parameters. Uses the global `collections.guide-categories`, minus any category with a `property` — those belong to a single property's guide and are listed by the `property-guides` block on the property page instead.

---

### `guide-header`

Renders a guide page's heading: title and optional subtitle.

**Component:** `block_guide_header`
**Template:** `src/_includes/design-system/blocks/guide-header.html`

Guide-only block. No parameters. Reads `title` and `subtitle` from the page data.

---

### `guide-navigation`

Renders a 'Back to <category>' breadcrumb link for a guide page.

**Component:** `block_guide_navigation`
**Template:** `src/_includes/design-system/blocks/guide-navigation.html`

Guide-page-only block. No parameters. Renders nothing when the page has no `guide-category` field.

---

### `guide-pages-list`

Lists the guide pages that belong to the current guide category (filtered via `guidesByCategory`).

**Component:** `block_guide_pages_list`
**Template:** `src/_includes/design-system/blocks/guide-pages-list.html`

Guide-category-only block. No parameters. A guide page with a `property` is only listed when the category carries the same `property`. Renders nothing when there are no pages left to show.

---

### `link-button`

Standalone centered button linking to an anchor or URL.

**Component:** `block_link_button`
**Template:** `src/_includes/design-system/blocks/link-button.html`
**SCSS:** `src/css/design-system/_link-button.scss`
**HTML root:** `<div class="link-button">`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `text` | string | **required** | Button label. |
| `href` | string | **required** | Link URL or anchor (e.g. `"#contact"`, `"/about"`). |
| `variant` | string | `"primary"` | `"primary"`, `"secondary"`, or `"ghost"`. |
| `size` | string | — | `"sm"`, `"lg"`, or omit for default. |
| `reveal` | string | — | `data-reveal` value. |

---

### `gallery`

Image grid with optional aspect ratio cropping and captions.

**Component:** `block_gallery`
**Template:** `src/_includes/design-system/blocks/gallery.html`
**SCSS:** `src/css/design-system/_items.scss`
**HTML root:** `<ul class="items" role="list">`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `items` | array | **required** | Image objects. Each: `{image, caption}`. Images processed by `{% image %}` shortcode. |
| `aspect_ratio` | string | — | Aspect ratio for images (e.g. `"16/9"`, `"1/1"`, `"4/3"`). Default: no cropping. |
| `intro_content` | string | — | Markdown content rendered above the block in `.prose`. |
| `masonry` | boolean | `false` | If true, renders as a masonry grid using uWrap for zero-reflow height prediction. |
| `horizontal` | boolean | `false` | If true, renders as a horizontal slider instead of a wrapping grid. |

---

### `marquee-images`

Continuously scrolling marquee of images (e.g. brand logos, partner badges).

**Component:** `block_marquee_images`
**Template:** `src/_includes/design-system/blocks/marquee-images.html`
**SCSS:** `src/css/design-system/_marquee-images.scss`
**HTML root:** `<div class="marquee-images">`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `items` | array | **required** | Image objects. Each: `{image, alt, link_url}`. `image` is a path; `alt` is optional alt text; `link_url` is an optional URL to wrap the image in a link. Images are processed via the `{% image %}` shortcode for responsive formats and proper URL normalization. |
| `speed` | string | `"30s"` | CSS animation duration for one full scroll cycle (e.g. `"20s"`, `"45s"`). Slower = longer duration. |
| `height` | string | `"50px"` | CSS height for the images (e.g. `"60px"`, `"80px"`). Width scales proportionally. |
| `intro_content` | string | — | Markdown content rendered above the block in `.prose`. |

---

### `icon-links`

Vertical list of links with icons, rendered as a flex column stack.

**Component:** `block_icon_links`
**Template:** `src/_includes/design-system/blocks/icon-links.html`
**SCSS:** `src/css/design-system/_icon-links.scss`
**HTML root:** `<ul class="icon-links" role="list">`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `intro_content` | string | — | Markdown content rendered above the block in `.prose`. |
| `items` | array | **required** | Link objects. Each: `{icon, text, url}`. `url` is optional — items without it render as plain text. Icon can be an Iconify ID (`"prefix:name"`), image path, or raw HTML/emoji. |
| `reveal` | boolean | `true` | Adds `data-reveal` to each link item. |

---

### `downloads`

List of downloadable files. Each item auto-detects its icon from the file extension and its size from the filesystem at build time.

**Component:** `block_downloads`
**Template:** `src/_includes/design-system/blocks/downloads.html`
**SCSS:** `src/css/design-system/_downloads.scss`
**HTML root:** `<ul class="downloads" role="list">`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `intro_content` | string | — | Markdown content rendered above the block in `.prose`. |
| `items` | array | **required** | Download objects. Each: `{file, label}`. `file` is a site-relative URL path; `label` is the visible text. |
| `reveal` | boolean | `true` | Adds `data-reveal` to each download item. |

The `file` path is resolved against `src/` (e.g. `/files/guide.pdf` reads from `src/files/guide.pdf`). Missing files cause a build error. Ensure the containing directory is configured as a passthrough-copy target so the file is also served to the browser.

---

### `snippet`

Renders blocks from a named snippet file, enabling reusable block compositions.

**Component:** `block_snippet`
**Template:** `src/_includes/design-system/blocks/snippet.html`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `reference` | string | **required** | Filename of the snippet (without `.md` extension) from `src/snippets/`. |

The referenced snippet must exist in `src/snippets/` and have a `blocks` frontmatter array. The snippet block is transparent — it renders no wrapping section element, so each inner block renders its own section directly.

---


<!-- END GENERATED BLOCKS -->

<!-- BEGIN GENERATED BLOCK COLUMNS -->

## Multi-Column Layouts

Any collection can shape its first section's blocks by adding an entry to `src/_data/blockLayouts.json`, keyed by a tag that appears on the page (e.g. `news`, `pages`). Two optional keys are supported: `before` pulls blocks into a full-width lead section, and `columns` pulls the remainder into a responsive column grid.

```json
{
  "news": {
    "before": ["hero"],
    "columns": [
      { "types": ["gallery"] },
      { "types": ["markdown", "features"] }
    ]
  }
}
```

### Matching semantics

- `before` is a **claim queue** of block types, processed in order. Each listed type claims the first unclaimed block of that type in page order; claimed blocks render full-width above the columns section in the order they were claimed (slot order, not page order). Listing a type twice claims two blocks of that type.
- `columns` runs after `before`. Each column's `types` list is its own claim queue, processed in order. Listing the same type twice (e.g. `["markdown", "cta", "markdown"]`) claims two blocks of that type.
- Columns are processed in order. For each listed type, the first unclaimed block of that type in the page's block array is taken. A type listed across two columns therefore splits the first two matching blocks between them.
- Blocks **inside a column** render in slot order (the order their types appear in the config), not the page's original block order.
- Unclaimed blocks — including duplicates beyond the queue length and any types not listed at all — fall through to the regular full-width rendering below the column section, preserving their original order.
- If no blocks match any column for a page, columns mode is disabled for that page and blocks render as normal. `before` still applies if it claims any blocks. Ship an empty `blockLayouts.json` to keep the feature off by default.

### Disallowed block types

These block types are rejected at build time if listed inside any column (they need full viewport width or already use a two-pane layout). They are allowed inside `before`, which renders full-width:

- `bunny-video-background`
- `hero`
- `image-background`
- `marquee-images`
- `video-background`
- `split-callout`
- `split-code`
- `split-full`
- `split-html`
- `split-icon-links`
- `split-image`

### Rendering

`before` blocks render as full-width sections (each wrapped in its block type's container width) above the column section, in claim order. Matched `columns` blocks render inside `<section class="block-columns-section">` → `<div class="container-wide">` → `<div class="block-columns block-columns-N">` (where `N` is the column count). Each column is a `<div class="block-column">` using flexbox to stack its children with consistent spacing. At mobile widths (below `md`), all columns collapse to a single stack.

<!-- END GENERATED BLOCK COLUMNS -->

---

## Right column (site-wide sidebar)

Create `src/snippets/right-content.md` to render a sidebar `<aside class="right-column">` beside `<main>` on every page that uses `base.html`. Presence of the file is the switch — no frontmatter flags or config. The body element gets a `two-columns` class (otherwise `one-column`), and the grid activates at the `lg` breakpoint; below it the sidebar stacks under the main content.

Two content modes:

- **Blocks** — give the snippet a `blocks:` frontmatter array. Blocks render directly (via `render-block.html`), without the full-width section wrappers and background striping that page blocks get, since those don't make sense in a narrow column. Only column-safe block types are allowed: the same types disallowed inside `blockLayouts.json` columns (see "Disallowed block types" above) fail the build with `Block type "X" is not supported inside the right-content sidebar.`
- **Markdown** — plain snippet body content renders inside a `.prose` wrapper, with `{% opening_times %}` and `{% recurring_events %}` support like other snippets.

The aside is a sibling of `<main>`, not a child, so sidebar text never enters the Pagefind search index (`data-pagefind-body` lives on `<main>`). Sidebar width is themable via the `--right-column-width` token (default `16rem`), declared at `:root` like the other sizing tokens.

Relationship to `blockLayouts.json` columns: that system splits a page's own blocks into columns per collection; the right column is shared site-wide furniture. They compose — the `.page-columns` grid wraps whatever `main` renders, including block-columns layouts.

### Banner hoisting

When the sidebar is active and a page's **first** block is `image-background`, that block is hoisted above the `.page-columns` grid so the banner spans the full width (content + sidebar) instead of being squeezed into the main column. All remaining blocks render inside `<main>` as usual. Without the sidebar, no hoisting happens.

---

## Supporting Components

These are not blocks themselves but are used by multiple blocks.

### Icon (`icon.html`, `icon-badge.html`)

**Files:** `src/_includes/design-system/icon.html`, `src/_includes/design-system/icon-badge.html`
**SCSS:** `src/css/design-system/_icon.scss`

Renders icons in three formats:
- **Iconify ID** (`"prefix:name"`): Rendered as `<iconify-icon>` web component.
- **Image path** (starts with `/`): Rendered as `<img>`.
- **Raw content**: Output as-is (emoji, HTML entity).

`icon-badge.html` wraps the icon in an accessible container with a tinted background.

### Video Iframe (`video-iframe.html`)

**File:** `src/_includes/design-system/video-iframe.html`

Shared iframe renderer. YouTube IDs produce privacy-respecting `youtube-nocookie.com` URLs. Custom URLs (starting with `http`) are embedded directly. Supports `background: true` mode for auto-playing background videos.

### Video Cards (`video-cards.html`)

**File:** `src/_includes/design-system/video-cards.html`
**SCSS:** `src/css/design-system/_items.scss` (`.video-cards` variant)

Not a block type in `render-block.html` — used via direct `{% include %}`. Renders YouTube/custom video thumbnails with click-to-play lazy loading. Thumbnails processed via `{% image %}`. Play button SVG overlay. Iframe stored in `<template>` element, injected on click. Hover transform disabled on video cards.

---

## Styling Primitives

### Containers

| Class | Max-width | Usage |
|---|---|---|
| `.container` | 900px (`$width-default`) | Default container for non-block contexts (property, guide includes). Flex-col with `$space-lg` gap. |
| `.container-wide` | 1200px (`$width-wide`) | Wide content. Default for block wrappers. |
| `.container-narrow` | 680px (`$width-narrow`) | Prose-width content. Default for `icon-links` blocks. |

### Grid Classes

| Class | Columns | Usage |
|---|---|---|
| `.features` | `auto-fit, minmax(280px, 1fr)` | Feature cards. |
| `.grid` | 1 → 2 (md) → 3 (lg) | Generic grid. |
| `.grid--2` | 1 → 2 (md) | Two-column grid. |
| `.grid--4` | 1 → 2 (sm) → 4 (lg) | Four-column grid. |

### Button Classes

| Class | Style |
|---|---|
| `.btn--primary` | Filled, `--color-link` bg, contrast text. Lifts on hover. |
| `.btn--secondary` | Outlined, `--color-link` border/text. Fills on hover. |
| `.btn--ghost` | Transparent. Subtle bg on hover. |
| `.btn--lg` | Larger padding + font. |
| `.btn--sm` | Smaller padding + font. |

### Utility Classes

| Class | Effect |
|---|---|
| `.prose` | Flex-col with `$space-md` gap. Themed list markers. |
| `.stack` | Alias for flex-col layout. |
| `.stack--sm` | Flex-col with `$space-sm` gap. |
| `.text-center` | `text-align: center`. |
| `.text-muted` | `color: var(--color-text-muted)`. |

---

## Design Tokens

### Spacing Scale (8px base unit)

| Token | Value |
|---|---|
| `$space-xs` | 8px |
| `$space-sm` | 16px |
| `$space-md` | 24px |
| `$space-lg` | 32px |
| `$space-xl` | 48px |
| `$space-2xl` | 64px |
| `$space-3xl` | 96px |
| `$space-4xl` | 128px |

### Breakpoints

| Token | Value | Usage |
|---|---|---|
| `$bp-sm` | 650px | Small tablets. |
| `$bp-md` | 768px | Tablets / 2-col layouts. |
| `$bp-lg` | 1000px | Desktop / 3-4 col layouts. |
| `$bp-xl` | 1200px | Wide desktop. |

### Border Radius

| Token | Value |
|---|---|
| `$radius-sm` | 4px |
| `$radius-md` | 8px |
| `$radius-lg` | 12px |
| `$radius-xl` | 16px |
| `$radius-2xl` | 24px |
| `$radius-full` | 9999px |

### Typography Scale

| Token | Size |
|---|---|
| `$font-size-xs` | 0.75rem (12px) |
| `$font-size-sm` | 0.875rem (14px) |
| `$font-size-base` | 1rem (16px) |
| `$font-size-md` | 1.125rem (18px) |
| `$font-size-lg` | 1.25rem (20px) |
| `$font-size-xl` | 1.5rem (24px) |
| `$font-size-2xl` | 2rem (32px) |
| `$font-size-3xl` | 2.5rem (40px) |
| `$font-size-4xl` | 3rem (48px) |
| `$font-size-5xl` | 4rem (64px) |

---

## File Index

Per-block template and SCSS paths are listed in the generated [Block Types](#block-types) section above (the **Template:** and **SCSS:** lines), so they can never drift from the schemas.

### Key Layout Files

| File | Purpose |
|---|---|
| `src/_layouts/base.html` | Base HTML shell, loads CSS/JS, applies `.design-system` to body |
| `src/_includes/design-system/blocks.html` | Block loop: iterates blocks, wraps in sections + containers |
| `src/_includes/design-system/render-block.html` | Block router: dispatches block.type to template |

### Example Page

`src/pages/blocks.md` demonstrates every block type and doubles as the visual regression page for themes.
