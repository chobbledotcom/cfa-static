---
name: Home
meta_title: CfA Static
meta_description: A static-site template for informational and marketing sites, built from composable content blocks.
permalink: /
eleventyNavigation:
  key: Home
  order: 1
blocks:
  - type: hero
    content: |
      # A static-site template for informational sites

      Build small, fast, accessible marketing and informational sites from composable content blocks - written in YAML, rendered by Eleventy, deployed as a static artifact.
    buttons:
      - text: Browse the guides
        href: /guide/
        variant: primary
        size: lg
      - text: Latest news
        href: /news/
        variant: secondary
        size: lg
  - type: features
    intro_content: |
      ## What's in the box
    items:
      - icon: "hugeicons:cube"
        name: Content blocks
        description: Pages are YAML lists of typed blocks - heroes, FAQs, callouts, image cards - validated at build time with loud errors.
      - icon: "hugeicons:global"
        name: Multi-language
        description: Publish the same page in more than one language, with hreflang tags and a footer language switcher.
      - icon: "hugeicons:paint-brush-01"
        name: Themeable
        description: CSS custom properties throughout, with a visual theme editor and exportable theme files.
      - icon: "hugeicons:rocket"
        name: Static output
        description: One command builds the whole site to a deployable directory - no servers, no database, nothing to patch.
---
