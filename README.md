# CfA Static

A static-site template for small informational and marketing sites, built on
[Eleventy](https://www.11ty.dev/) and Node.js (≥22). Pages are
assembled from composable, schema-validated content blocks written in YAML
frontmatter, so engineering-adjacent authors (and AI assistants) can build and
edit pages without touching templates.

Derived from the [Chobble Template](https://github.com/chobbledotcom/chobble-template),
relicensed to MIT here by its sole author, and cut down to an informational
core: no e-commerce, no forms, no user data handling — just fast, accessible,
static pages.

## What's included

- **Content blocks** — ~35 block types (hero, FAQs, callouts, image cards,
  split layouts, galleries, stats…) declared in frontmatter and validated at
  build time with loud, file-specific errors. See [BLOCKS_LAYOUT.md](BLOCKS_LAYOUT.md)
  for the full reference (generated from the block schemas, so it can't drift),
  or the deployed site's `/blocks/` page, where every type renders live next
  to the YAML that produces it — from the same tested fixtures.
- **Content types** — Pages, News (with Atom feed), Guides (categorised
  documentation pages), and reusable Snippets.
- **Multi-language** — publish the same page in more than one language with
  `hreflang` tags, an `x-default`, and a footer language switcher. See the
  Languages section below.
- **Theming** — CSS custom properties throughout, ten prebuilt themes, a
  visual theme editor at `/theme-editor/` with export.
- **Images** — responsive `srcset` via eleventy-img, base64 LQIP placeholders,
  aspect-ratio cropping, unused-image detection.
- **Accessibility** — WCAG 2.2 AA is a build gate, not a hope: every page of
  the built site is checked with axe-core (`npm run check:a11y`), and the
  block gallery renders every block type, so a block cannot ship an
  accessibility defect without failing the check. Pages get a skip link, named
  landmarks, and per-language chrome labels out of the box.
- **Search** — static full-text search via Pagefind.
- **SEO** — schema.org JSON-LD (WebSite, Organization, BreadcrumbList,
  BlogPosting, FAQPage), canonical URLs, sitemap, social cards.
- **Editing layer** — a generated [PagesCMS](https://pagescms.org/) config
  (`.pages.yml`) wired to the block schemas, plus `npm run customise-cms`, an
  interactive/non-interactive wizard that tailors the editor to the
  collections a site actually uses.

## Quick start

```bash
npm install          # install dependencies (Node.js 22+)
npm run serve        # dev server with hot reload
npm run build        # build to _site/ (includes internal link check)
npm test             # full suite: lint, typecheck, build, tests, coverage
npm run check:a11y   # WCAG 2.2 AA check over the built _site/
```

The build needs no secrets and no network services. The deployable artifact is
the `_site/` directory — publish it with any static host or pipeline.

## Starting a site from this template

Each site is a **fork of this repository**, not a dependency of it. A site's
content, configuration, and theme live in the fork, and the template's own
demo content is deleted or replaced there.

After cloning the fork, replace the `name`, `url`, and `description` in
`src/_data/site.json` before building. Missing or obvious placeholder identity
data fails the build rather than being published.

Updates flow one way and only when a site asks for them:

```bash
git remote add upstream https://github.com/chobbledotcom/cfa-static.git
git fetch upstream
git merge upstream/main      # deliberate, reviewed, and never automatic
```

That is the point of the arrangement. A site that has shipped keeps building
exactly as it built yesterday; template changes reach it when someone chooses
to merge them, reviews what changed, and re-runs the site's own checks. The
quality gates travel with the fork, so a site that pulls an update finds out
immediately whether the update broke anything it publishes.

## Deploying to GitHub Pages

The repo ships a workflow (`.github/workflows/pages.yml`) that builds and
deploys to GitHub Pages on every push to `main`. One-time setup: under the
repository's **Settings → Pages**, set **Source** to **GitHub Actions**.

The workflow handles both hosting shapes automatically: on a project site
(`https://<owner>.github.io/<repo>/`) it builds with the `/<repo>/` path
prefix and rewrites internal URLs to match; with a custom domain or a
user/organization site it builds with no prefix. Canonical URLs, the sitemap,
and feeds pick up the deployed origin via `SITE_URL`. Keep `site.json`'s `url`
set to the site's public URL as the fallback for local and non-workflow builds.

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
  (`npm run mutation`)
- [Nix flakes](https://nixos.wiki/wiki/Flakes) with [direnv](https://direnv.net/)
  support

## License

[MIT](LICENSE).
