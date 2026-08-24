---
name: Configuration
subtitle: The three data files that shape a site
guide-category: advanced-topics
order: 1
blocks:
  - type: guide-header
  - type: guide-navigation
  - type: markdown
    content: |
      Site-wide settings live in `src/_data/` as three JSON files. Change
      them and the whole site follows - a bad value fails the build with
      a message naming the field.

      ## site.json

      Identity: the site's name, canonical `url`, and social links. The
      `url` feeds canonical tags, the sitemap, and the feed. Deployments
      can override it with the `SITE_URL` environment variable, which is
      how the GitHub Pages workflow serves the same site from any origin
      without edits.

      ## config.json

      Feature toggles: breadcrumbs, the theme switcher, navigation style,
      and which collections the search indexes.

      ## strings.json

      Every label and permalink the templates emit, in one place - rename
      "News" or move it to another path without touching a template.

      ## Theming

      Colors, fonts, and spacing are CSS custom properties. Ten prebuilt
      themes ship with the template, and the [theme editor](/theme-editor/)
      lets you tune one visually and export the result.

      ## Languages

      `languages.json` lists the languages the site publishes;
      `translations.json` pairs pages that say the same thing. A page's
      language comes from its URL prefix, and paired pages get `hreflang`
      tags and a footer switcher automatically.
---
