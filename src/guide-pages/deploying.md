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
      Pages on every push to `main`. Under your repository's
      **Settings → Pages**, set **Source** to **GitHub Actions**. The bundled
      jobs use Ubicloud runners, so a new fork must also configure the
      Ubicloud GitHub integration and billing, or deliberately change both
      jobs to an available runner such as `ubuntu-latest`.

      The workflow works out where the site will be served and passes two
      environment variables into the build:

      - `PATH_PREFIX` - on a project site (`user.github.io/repo/`) every
        internal URL is rewritten under `/repo/`; on a custom domain it's
        just `/`
      - `SITE_URL` - the public site base URL, including `/repo` for a
        project site, feeding canonical URLs, the sitemap, and the feed

      So the same repository deploys correctly to a project subpath or a
      custom domain with no configuration changes.

      ## Any other static host

      `npm run build` produces a self-contained `_site/` directory, and
      the Pages workflow uploads it as its deployment artifact. Point any
      static host - or your own pipeline - at that directory. There is no
      application server and no application-secret requirement.
faqs:
  - question: Why does the first deploy fail?
    answer: Confirm **Settings → Pages → Source** is **GitHub Actions** and that the Ubicloud integration used by the bundled runners is configured. If the site does not use Ubicloud, change both jobs to an approved available runner before re-running the workflow.
    order: 1
  - question: Can I use a custom domain?
    answer: Yes - configure it in the Pages settings. The workflow detects it and builds with no path prefix automatically.
    order: 2
---
