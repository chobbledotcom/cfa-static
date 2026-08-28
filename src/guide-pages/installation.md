---
name: Installation
subtitle: From clone to running dev server
guide-category: getting-started
order: 1
blocks:
  - type: guide-header
  - type: guide-navigation
  - type: markdown
    content: |
      ## Prerequisites

      - Node.js 22 or newer (npm included)
      - Git

      ## Set up

      1. Fork this repository into the account or organization that will own the site
      2. Clone that fork
      3. Set the site's real `name`, `url`, and `description` in `src/_data/site.json`
      4. Run `npm install` to install dependencies
      5. Run `npm run serve` to start the development server at `http://localhost:8080`

      The dev server rebuilds and reloads as you edit. When you want a
      production build, `npm run build` writes the whole site to `_site/`
      and checks every internal link on the way out.

      ## Useful commands

      | Command | What it does |
      | --- | --- |
      | `npm run serve` | Dev server with hot reload |
      | `npm run build` | Production build to `_site/` |
      | `npm test` | Full suite: lint, typecheck, build, tests, coverage |
      | `npm run lint:fix` | Auto-format the codebase |
faqs:
  - question: What are the system requirements?
    answer: Node.js 22 or newer, on any platform. The build has no other services and needs no secrets.
    order: 1
  - question: How long does installation take?
    answer: A couple of minutes - one `npm install` and you're running.
    order: 2
  - question: Do I need to configure anything before it runs?
    answer: Set the real site identity in `src/_data/site.json` first. The build rejects missing or obvious placeholder values so they cannot be published accidentally.
    order: 3
---
