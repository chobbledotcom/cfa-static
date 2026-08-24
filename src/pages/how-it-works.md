---
name: How It Works
meta_title: How it works
meta_description: The pipeline from a YAML frontmatter file to a deployed static page, step by step.
blocks:
  - type: hero
    badge: Under the hood
    content: |
      # How a page gets built

      From a markdown file with YAML frontmatter to a validated, rendered, deployable static page - here's the whole pipeline.
  - type: split-code
    subtitle: "Step 1 - Write"
    content: |
      ## Pages are lists of blocks

      Every page is a markdown file whose frontmatter declares a `blocks`
      array. Each entry has a `type` plus that block's fields - the full
      vocabulary is on the [blocks page](/blocks/), rendered live.
    figure_filename: src/pages/example.md
    figure_language: yaml
    figure_code: "---\nname: Example\npermalink: /example/\nblocks:\n  - type: hero\n    content: |\n      # Hello\n  - type: markdown\n    content: Body text here.\n---"
  - type: split-code
    subtitle: "Step 2 - Validate"
    content: |
      ## The build checks every block

      Unknown block types and unknown keys fail the build with an error
      naming the file and the block - typos never reach production. The
      same schemas generate the editor config and the reference docs, so
      none of them can drift apart.
    reverse: true
    figure_filename: terminal
    figure_language: text
    figure_code: "[11ty] Block type \"herro\" is unknown\n(block 1 in ./src/pages/example.md).\nValid types: section-header, features,\nimage-cards, stats, code-block, hero, ..."
  - type: split-code
    subtitle: "Step 3 - Build"
    content: |
      ## One command, one directory

      Eleventy renders every page, processes images into responsive
      formats, bundles CSS and JS, builds the search index, and checks
      every internal link. The result is a plain `_site/` directory.
    figure_filename: terminal
    figure_language: bash
    figure_code: "npm run build\n# -> _site/\n#    index.html, blocks/, guide/, news/ ...\n#    css/, assets/, images/, pagefind/"
  - type: split-code
    subtitle: "Step 4 - Deploy"
    content: |
      ## Push to deploy

      A GitHub Actions workflow builds and publishes the site to GitHub
      Pages on every push to `main` - project subpaths and custom domains
      both work without editing anything. `_site/` is also uploaded as a
      build artifact, so any other static host can serve it instead.
    reverse: true
    figure_filename: .github/workflows/pages.yml
    figure_language: yaml
    figure_code: "- name: Build Site\n  env:\n    PATH_PREFIX: ${{ steps.pages.outputs.base_path }}/\n    SITE_URL: ${{ steps.pages.outputs.base_url }}\n  run: npm run build"
  - type: cta
    content: |
      ## See every block live

      The blocks page renders each block type next to the exact YAML that produces it.
    button:
      text: Browse the blocks
      href: /blocks/
      size: lg
---
