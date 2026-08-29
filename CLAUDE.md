# CLAUDE.md - AI Assistant Guide for CfA Static

## Project Overview

**CfA Static** is an Eleventy (11ty) static-site template for small
informational and marketing sites. It runs on **Node.js (≥22)** with **npm**
as the package manager. Pages are assembled from composable, schema-validated
content blocks declared in YAML frontmatter.

### Key Features
- Content types: Pages, News, Guides (categorised documentation), Snippets
- ~35 content blocks (hero, FAQs, callouts, image cards, split layouts,
  galleries, stats…) rendered by a shared block pipeline
- Multi-language publishing with hreflang tags and a language switcher
- 10 pre-built themes with live theme editor
- Responsive images with LQIP (Low Quality Image Placeholders)
- SEO/Schema.org structured data, Atom feed, Pagefind search
- PagesCMS editing layer generated from the block schemas
- No forms, no e-commerce, no user data handling — static informational
  pages only

---

## Quick Reference

### Essential Commands
```bash
npm install          # Install dependencies (Node.js 22+)
npm run build        # Build the site to _site/
npm run serve        # Development server with hot reload
npm test             # Full test suite (lint + build + tests + coverage)
npm run test:unit    # Unit tests only
npm run mutation <src-glob> <test-glob>  # Mutation test ("tests for your tests")
npm run lint         # Check code with Biome
npm run lint:fix     # Auto-fix lint issues
npm run precommit    # Pre-commit checks
```

### Mutation Testing
`npm run mutation` proves your tests actually catch bugs: it mutates operators in
the source file(s), runs the mapped test file(s), and reports which mutants
**survived** (changes no test noticed). The tooling lives in `scripts/mutation/`.

```bash
npm run mutation src/_lib/utils/slug-utils.js test/unit/utils/slug-utils.test.js
npm run mutation 'src/_lib/eleventy/*.js' 'test/unit/eleventy/*.test.js' -- --exhaustive
```

Confirmed-equivalent survivors (no input can distinguish them) go in
`scripts/mutation/equivalent-mutants.txt`, so a run only ever fails on
genuinely *new* gaps. Entries are validated every run and at load time
(deleted files fail loudly), so the list cannot silently rot.

### Directory Structure
```
src/
├── _data/           # Site configuration (config.json, site.json, strings.json)
├── _includes/       # Reusable HTML components
│   └── design-system/blocks/  # One template per content block
├── _layouts/        # base.html — every page renders through it
├── _lib/            # Core JavaScript library
│   ├── build/       # JS bundling, SCSS, theme compilation
│   ├── collections/ # Eleventy collections (news, guides, navigation)
│   ├── config/      # Configuration helpers
│   ├── eleventy/    # Eleventy plugins (blocks, breadcrumbs, feed, …)
│   ├── media/       # Image processing (sharp, eleventy-img)
│   ├── public/      # Frontend JavaScript (bundled by esbuild)
│   └── utils/       # Pure utility functions (block-schema, i18n, fp/, …)
├── css/             # SCSS stylesheets (design-system/ per-block partials)
├── pages/           # Page markdown files (blocks in frontmatter)
├── news/            # News posts
├── guide-categories/, guide-pages/  # Guide content
└── snippets/        # Reusable content snippets

scripts/
├── customise-cms/   # PagesCMS config generator (interactive + CLI)
├── generate-blocks-reference.js  # Regenerates BLOCKS_LAYOUT.md
└── mutation/        # Mutation testing tooling

test/
├── unit/            # Unit tests by feature
├── integration/     # Integration tests (build real sites)
├── code-quality/    # Central allowlists for quality gates
├── test-utils.js    # Shared test utilities & factories
├── test-utils/      # Generic test helpers (assertions, mocking, resources)
└── TEST-QUALITY-CRITERIA.md  # Testing standards
```

### The Block System

Pages declare a `blocks:` array in frontmatter. Each block has a schema module
in `src/_lib/utils/block-schema/<type>.js` (fields, docs, container width), a
template in `src/_includes/design-system/blocks/<type>.html`, and usually an
SCSS partial in `src/css/design-system/`. The registry in
`src/_lib/utils/block-schema.js` aggregates them; blocks are validated at
build time and unknown types or keys fail the build loudly.

Three artifacts are **generated from the schemas** and enforced fresh by CI:
- `BLOCKS_LAYOUT.md` — `npm run generate-blocks-reference`
- `.pages.yml` — `npm run generate-pages-yml`
- `src/_lib/types/pages-cms-generated.d.ts` — `npm run generate-cms-types`

Regenerate all three after any block schema change.

---

## Import Aliases

Use Node.js subpath imports (defined in `package.json`):

```javascript
import { memoize } from "#utils/memoize.js";
import { configureNews } from "#collections/news.js";
import { configureImages } from "#media/image.js";
import config from "#data/config.json" with { type: "json" };
import { ROOT_DIR } from "#lib/paths.js";
```

**Available aliases:**
| Alias | Path |
|-------|------|
| `#data/*` | `./src/_data/*` |
| `#lib/*` | `./src/_lib/*` |
| `#build/*` | `./src/_lib/build/*` |
| `#collections/*` | `./src/_lib/collections/*` |
| `#config/*` | `./src/_lib/config/*` |
| `#eleventy/*` | `./src/_lib/eleventy/*` |
| `#media/*` | `./src/_lib/media/*` |
| `#transforms/*` | `./src/_lib/transforms/*` |
| `#utils/*` | `./src/_lib/utils/*` |
| `#public/*` | `./src/_lib/public/*` |
| `#guide-categories/*` | `./src/guide-categories/*` |
| `#test/*` | `./test/*` |
| `#scripts/*` | `./scripts/*` |
| `#bin/*` | `./bin/*` |

The generic functional utilities live in `src/_lib/utils/fp/` (imported
via `#utils/fp/...`); shared test helpers live in `test/test-utils/`
(re-exported through `#test/test-utils.js`).

---

## Code Conventions

### Eleventy Plugin Pattern
Files registering with Eleventy export a `configureX` function:

```javascript
export function configureNews(eleventyConfig) {
  eleventyConfig.addCollection("news", ...);
  eleventyConfig.addFilter("someNewsFilter", ...);
}
```

### Functional Programming Style
The codebase uses curried, composable functions extensively:

```javascript
// Use pipe() for function composition
import { pipe, filter, map, sort } from "#utils/fp/array.js";

pipe(
  filter(x => x > 0),
  map(x => x * 2),
  sort((a, b) => a - b)
)(numbers);

// Curried helpers are preferred
const isActive = filter(item => item.active);
const getName = map(item => item.name);
```

### Memoization Pattern
```javascript
import { memoize } from "#utils/memoize.js";

const expensiveComputation = memoize(
  async (input) => { /* ... */ },
  { cacheKey: (args) => JSON.stringify(args[0]) }
);
```

### Available Array Utilities (`#utils/fp/array.js`)
- `pipe(...fns)` - Left-to-right function composition
- `filter(predicate)`, `map(fn)`, `flatMap(fn)`, `reduce(fn, initial)` - Curried array methods
- `sort(comparator)` - Non-mutating sort
- `unique(arr)`, `uniqueBy(getKey)` - Deduplicate arrays
- `filterMap(predicate, transform)` - Filter and map in single pass
- `compact(arr)` - Remove falsy values
- `chunk(arr, size)` - Split into groups
- `pick(keys)` - Extract object properties
- `memberOf(values)`, `notMemberOf(values)` - Membership predicates
- `pluralize(singular, plural?)` - Format counts with pluralization

### Error Handling: Fail Fast, Never Mask

**Throw errors instead of returning fallback values.** When something unexpected happens, fail immediately with a clear error rather than disguising the problem with a default value.

```javascript
// BAD - masks the problem, makes debugging harder
const getPage = (slug) => pages.find(p => p.slug === slug) ?? { title: "Unknown" };
const parseConfig = (json) => { try { return JSON.parse(json); } catch { return {}; } };

// GOOD - fails immediately, stack trace points to the problem
const getPage = (slug) => {
  const page = pages.find(p => p.slug === slug);
  if (!page) throw new Error(`Page not found: ${slug}`);
  return page;
};
```

**Why this matters:**
- Silent fallbacks hide bugs until they cause bigger problems downstream
- Stack traces from early errors point directly to the root cause
- Fallback values often propagate through the system causing confusing behavior
- "It works but shows wrong data" is harder to debug than "it crashed here"

**Code quality tests enforce this:**
- `nullish-coalescing.test.js` - Bans `??` outside collections (where defaults belong)
- `data-fallbacks.test.js` - Bans `item.data.foo || fallback` patterns
- `try-catch-usage.test.js` - Allowlist-only for try/catch blocks

**Rare exceptions** (all require explicit allowlisting):
- Browser localStorage (users can corrupt it)
- User-provided input at system boundaries (frontmatter from markdown files)

---

## Linting Rules (Biome)

The project enforces strict code quality via Biome. Key rules:

### Must Follow
- **Use arrow functions** - `useArrowFunction: error`
- **Use template literals** - `useTemplate: error`
- **Use const** - `useConst: error`
- **No var** - `noVar: error`
- **No ==** - `noDoubleEquals: error` (use `===`)
- **No unused imports/variables** - `noUnusedImports: error`, `noUnusedVariables: error`
- **No forEach** - `noForEach: error` (use `for...of` or curried `map`/`filter`)
- **No accumulating spread** - `noAccumulatingSpread: error` (push into one array, or use `flatMap`)
- **Max cognitive complexity: 7** - `noExcessiveCognitiveComplexity` (30 in tests)
- **No console.log** - except in `build/` and `test/`
- **No skipped/focused tests** - `noSkippedTests: error`, `noFocusedTests: error`

### Formatting
- 2-space indentation
- Run `npm run lint:fix` to auto-format

---

## Testing Requirements

### Test Framework
- **Vitest** with happy-dom for DOM simulation (config in `vitest.config.js`)
- Tests in `/test/unit/` and `/test/integration/`
- Shared utilities in `/test/test-utils.js`

### Running Tests Efficiently

**Do NOT run `npm test` to diagnose a specific issue.** The full suite is slow (lint + build + unit tests + coverage). Running it repeatedly while iterating wastes minutes every loop.

Instead:
1. **Target the specific file** - `npx vitest run test/unit/path/to/file.test.js` runs in seconds
2. **Target a single test** - `npx vitest run test/unit/foo.test.js -t "describes the failing case"`
3. **Scope by directory** - `npx vitest run test/unit/collections/` for a subsystem

**If you genuinely need the full suite output** (e.g. finding which test broke after a wide change):
1. Run it **once**, redirecting to a file: `npm test > /tmp/test-output.txt 2>&1`
2. Grep that file repeatedly: `grep -n "×" /tmp/test-output.txt` (vitest marks failing tests with `×`)
3. **Never** pipe `npm test | grep ...` and re-run — you pay the full suite cost each time

Only run the full `npm test` once at the end to confirm everything passes before committing.

### Test Quality Criteria (ALL tests must satisfy)

1. **Tests Production Code, Not Reimplementations**
   - Call actual imported production functions
   - Never copy-paste production logic into tests
   - Import constants, don't hardcode

2. **Not Tautological**
   - Don't assert values you just set
   - Verify behavior after production code executes

3. **Tests Behavior, Not Implementation Details**
   - Verify observable outcomes
   - Refactoring shouldn't break tests

4. **Has Clear Failure Semantics**
   - Test names describe specific behavior
   - When test fails, root cause is obvious

5. **Isolated and Repeatable**
   - Clean up after tests (temp files, global state)
   - No dependencies on other tests
   - No time-dependent flakiness

6. **Tests One Thing**
   - Single reason to fail
   - If you need "and" in description, split the test

### Test Utilities
```javascript
import {
  createMockEleventyConfig,  // Mock Eleventy config
  item,                      // Collection item factory
  withTempDir, withTempFile, // Temp file management
  expectProp, expectDataArray, // Assertion helpers
} from "#test/test-utils.js";
```

---

## Common Patterns

### Collection Creation
```javascript
// In src/_lib/collections/[name].js
export const configureNews = (eleventyConfig) => {
  eleventyConfig.addCollection("news", (collectionApi) => {
    return collectionApi.getFilteredByTag("news")
      .filter(item => !item.data.no_index)
      .sort(sortByDateDescending);
  });
};
```

### Adding a Content Block
1. Create the schema module `src/_lib/utils/block-schema/<type>.js`
   (`type`, `fields`, `docs`, optional `containerWidth`/`template`/`collections`)
2. Register it in `BLOCK_MODULES` in `src/_lib/utils/block-schema.js`
3. Create the template `src/_includes/design-system/blocks/<type>.html`
4. Add SCSS in `src/css/design-system/` and forward it from `_index.scss`
5. Regenerate: `npm run generate-blocks-reference && npm run generate-pages-yml && npm run generate-cms-types`

### Image Processing
```javascript
import { configureImages } from "#media/image.js";

// In templates, use the image shortcode:
// {% image "photo.jpg", "Alt text", "class-names", "(max-width: 768px) 100vw, 50vw" %}
```

---

## File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Eleventy plugins | `configure*.js` | `configureNews.js` |
| Collections | `[plural-noun].js` | `news.js`, `guides.js` |
| Utilities | `[noun]-utils.js` | `slug-utils.js`, `collection-utils.js` |
| Tests | `[feature].test.js` | `news.test.js` |
| SCSS | `_[component].scss` | `_buttons.scss` |

---

## Important Files

| File | Purpose |
|------|---------|
| `.eleventy.js` | Main Eleventy configuration - registers all plugins |
| `src/_lib/utils/block-schema.js` | Block registry - single source of truth for the block system |
| `src/_data/config.json` | Site feature toggles |
| `src/_data/site.json` | Site name, URL, social links |
| `src/_data/strings.json` | Customizable UI labels and permalinks |
| `BLOCKS_LAYOUT.md` | Generated block reference (do not edit by hand) |
| `.pages.yml` | Generated PagesCMS config (do not edit by hand) |
| `biome.json` | Linting and formatting rules |
| `vitest.config.js` | Vitest test configuration |
| `test/TEST-QUALITY-CRITERIA.md` | Detailed testing standards |

---

## Anti-Patterns to Avoid

1. **Don't use bun/yarn/pnpm** - This project uses npm (`package-lock.json` is enforced)
2. **Don't use `forEach`** - Use `for...of` loops or curried `map`/`filter`
3. **Don't accumulate with spread** - Push into one array (or use `flatMap`) for O(1) appends
4. **Don't use `var`** - Always use `const` (or `let` when reassignment needed)
5. **Don't use `==`** - Always use `===`
6. **Don't add console.log** - Except in build scripts and tests
7. **Don't exceed complexity 7** - Break complex functions into smaller pieces
8. **Don't hardcode magic values** - Import constants from production code
9. **Don't create tautological tests** - Verify behavior, not assignments
10. **Don't return fallbacks for errors** - Throw errors instead of masking problems with default values
11. **Don't hand-edit generated files** - `BLOCKS_LAYOUT.md`, `.pages.yml`, and
    `pages-cms-generated.d.ts` are regenerated from the block schemas

---

## When Making Changes

1. **Read existing code first** - Understand patterns before modifying
2. **Follow existing conventions** - Match the style of surrounding code
3. **Run tests** - `npm test` before committing
4. **Run linter** - `npm run lint:fix` to auto-fix issues
5. **Keep functions small** - Stay under the complexity limit of 7
6. **Use functional patterns** - Prefer `pipe`, curried functions, immutability
7. **Write tests** - Follow the 6 mandatory test quality criteria
8. **Use import aliases** - Keep imports clean with `#` prefixes
9. **Regenerate derived artifacts** after block schema changes
