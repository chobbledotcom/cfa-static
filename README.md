# CfA Static

A static-site template for small informational and marketing sites, built on
[Eleventy](https://www.11ty.dev/) and [Bun](https://bun.sh/). Pages are
assembled from composable, schema-validated content blocks written in YAML
frontmatter, so engineering-adjacent authors (and AI assistants) can build and
edit pages without touching templates.

Derived from the [Chobble Template](https://github.com/chobbledotcom/chobble-template)
(MIT), cut down to an informational core: no e-commerce, no forms, no user
data handling — just fast, accessible, static pages.

## What's included

- **Content blocks** — ~35 block types (hero, FAQs, callouts, image cards,
  split layouts, galleries, stats…) declared in frontmatter and validated at
  build time with loud, file-specific errors. See [BLOCKS_LAYOUT.md](BLOCKS_LAYOUT.md)
  for the full reference (generated from the block schemas, so it can't drift).
- **Content types** — Pages, News (with Atom feed), Guides (categorised
  documentation pages), and reusable Snippets.
- **Multi-language** — publish the same page in more than one language with
  `hreflang` tags, an `x-default`, and a footer language switcher. See the
  Languages section below.
- **Theming** — CSS custom properties throughout, ten prebuilt themes, a
  visual theme editor at `/theme-editor/` with export.
- **Images** — responsive `srcset` via eleventy-img, base64 LQIP placeholders,
  aspect-ratio cropping, unused-image detection.
- **Search** — static full-text search via Pagefind.
- **SEO** — schema.org JSON-LD (WebSite, Organization, BreadcrumbList,
  BlogPosting, FAQPage), canonical URLs, sitemap, social cards.
- **Editing layer** — a generated [PagesCMS](https://pagescms.org/) config
  (`.pages.yml`) wired to the block schemas, plus `bun run customise-cms`, an
  interactive/non-interactive wizard that tailors the editor to the
  collections a site actually uses.

## Quick start

```bash
bun install          # install dependencies (Bun, not npm)
bun run serve        # dev server with hot reload
bun run build        # build to _site/ (includes internal link check)
bun test             # full suite: lint, typecheck, build, tests, coverage
```

The build needs no secrets and no network services. The deployable artifact is
the `_site/` directory — publish it with any static host or pipeline.

## Configuration

- `src/_data/site.json` — site name, URL, social links
- `src/_data/config.json` — feature toggles (breadcrumbs, theme switcher,
  navigation style, search collections)
- `src/_data/strings.json` — label and permalink overrides
- `src/_data/languages.json` / `translations.json` — languages the site
  publishes and which pages say the same thing in each

## Languages

A site is written in one language until it says otherwise, and nothing in the
template names a language.

- `_data/languages.json` lists every language the site publishes, each with a
  `code`, `hreflang`, `og_locale`, `label`, `home_url` prefix, `home_label` and
  `breadcrumb_label`. Exactly one entry has `is_default: true`.
- `_data/translations.json` pairs the pages that say the same thing, keyed by
  language code, e.g. `[{ "en": "/about/", "de": "/de/ueber-uns/" }]`.

A page's language comes from its URL prefix. The template ships one language
and no translations, which renders with no hreflang tags and no switcher.

## Development

- [Biome](https://biomejs.dev/) linting, [Knip](https://knip.dev/) dead-code
  detection, [jscpd](https://github.com/kucherenko/jscpd) duplicate detection
- TypeScript checking via JSDoc, with a strictness ratchet
- 140+ test files (unit, integration, code-quality) with mutation testing
  (`bun run mutation`)
- [Nix flakes](https://nixos.wiki/wiki/Flakes) with [direnv](https://direnv.net/)
  support

## License

[MIT](LICENSE).
