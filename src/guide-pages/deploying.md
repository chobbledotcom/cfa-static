---
name: Deploying
subtitle: GitHub Pages by default, any static host by artifact
guide-category: getting-started
order: 3
blocks:
  - type: guide-header
  - type: guide-navigation
  - type: markdown
    content: |
      ## GitHub Pages

      The repository ships a workflow that builds and deploys to GitHub
      Pages on every push to `main`. One-time setup: under your
      repository's **Settings → Pages**, set **Source** to
      **GitHub Actions**. That's all.

      The workflow works out where the site will be served and passes two
      environment variables into the build:

      - `PATH_PREFIX` - on a project site (`user.github.io/repo/`) every
        internal URL is rewritten under `/repo/`; on a custom domain it's
        just `/`
      - `SITE_URL` - the deployed origin, feeding canonical URLs, the
        sitemap, and the feed

      So the same repository deploys correctly to a project subpath or a
      custom domain with no configuration changes.

      ## Any other static host

      `npm run build` produces a self-contained `_site/` directory, and
      the build workflow also uploads it as an artifact named `site`.
      Point any static host - or your own pipeline - at that directory.
      There are no servers and no secrets in the build.
faqs:
  - question: Why does the first deploy fail?
    answer: GitHub Pages needs enabling once - set **Settings → Pages → Source** to **GitHub Actions**, then re-run the workflow.
    order: 1
  - question: Can I use a custom domain?
    answer: Yes - configure it in the Pages settings. The workflow detects it and builds with no path prefix automatically.
    order: 2
---
