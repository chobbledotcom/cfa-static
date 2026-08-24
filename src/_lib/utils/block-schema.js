/**
 * Block schema definitions for design system blocks.
 *
 * Each block module in `./block-schema/<type>.js` exports:
 *   - `type`   — block type slug
 *   - `fields` — unified field definitions (CMS + doc info per key)
 *   - `docs`   — metadata (summary, template, scss, htmlRoot, notes)
 *   - optionally `containerWidth` ("full" | "narrow"; defaults to "wide")
 *
 * This file aggregates them into:
 *   - `BLOCK_SCHEMAS`    — field definitions per type, used for both
 *     allowed-key checks and runtime value-shape validation. Indexed by
 *     block type; each entry maps field name → `{ type, list?, ... }`.
 *   - `BLOCK_CMS_FIELDS` — CMS field definitions (for .pages.yml generation)
 *   - `BLOCK_DOCS`       — documentation (for BLOCKS_LAYOUT.md generation)
 */

import * as callout from "#utils/block-schema/callout.js";
import * as codeBlock from "#utils/block-schema/code-block.js";
import * as cta from "#utils/block-schema/cta.js";
import * as downloads from "#utils/block-schema/downloads.js";
import * as faqs from "#utils/block-schema/faqs.js";
import * as features from "#utils/block-schema/features.js";
import * as gallery from "#utils/block-schema/gallery.js";
import * as guideCategories from "#utils/block-schema/guide-categories.js";
import * as guideHeader from "#utils/block-schema/guide-header.js";
import * as guideNavigation from "#utils/block-schema/guide-navigation.js";
import * as guidePagesList from "#utils/block-schema/guide-pages-list.js";
import * as hero from "#utils/block-schema/hero.js";
import * as html from "#utils/block-schema/html.js";
import * as iconLinks from "#utils/block-schema/icon-links.js";
import * as iframeEmbed from "#utils/block-schema/iframe-embed.js";
import * as imageBackground from "#utils/block-schema/image-background.js";
import * as imageCards from "#utils/block-schema/image-cards.js";
import * as include from "#utils/block-schema/include.js";
import * as items from "#utils/block-schema/items.js";
import * as itemsArray from "#utils/block-schema/items-array.js";
import * as itemsTextList from "#utils/block-schema/items-text-list.js";
import * as linkButton from "#utils/block-schema/link-button.js";
import * as linkColumns from "#utils/block-schema/link-columns.js";
import * as markdown from "#utils/block-schema/markdown.js";
import * as marqueeImages from "#utils/block-schema/marquee-images.js";
import * as newsMeta from "#utils/block-schema/news-meta.js";
import * as sectionHeader from "#utils/block-schema/section-header.js";
import { CONTAINER_FIELDS } from "#utils/block-schema/shared.js";
import * as snippet from "#utils/block-schema/snippet.js";
import * as splitCallout from "#utils/block-schema/split-callout.js";
import * as splitCode from "#utils/block-schema/split-code.js";
import * as splitFull from "#utils/block-schema/split-full.js";
import * as splitHtml from "#utils/block-schema/split-html.js";
import * as splitIconLinks from "#utils/block-schema/split-icon-links.js";
import * as splitImage from "#utils/block-schema/split-image.js";
import * as stats from "#utils/block-schema/stats.js";

/**
 * Iteration order determines the order that `scripts/generate-blocks-reference.js`
 * emits block types into BLOCKS_LAYOUT.md, so keep it intentional rather than
 * alphabetical.
 */
const BLOCK_MODULES = [
  sectionHeader,
  features,
  imageCards,
  stats,
  codeBlock,
  hero,
  splitImage,
  splitCode,
  splitIconLinks,
  splitHtml,
  splitCallout,
  splitFull,
  cta,
  callout,
  imageBackground,
  items,
  itemsArray,
  itemsTextList,
  linkColumns,
  markdown,
  html,
  iframeEmbed,
  include,
  newsMeta,
  faqs,
  guideCategories,
  guideHeader,
  guideNavigation,
  guidePagesList,
  linkButton,
  gallery,
  marqueeImages,
  iconLinks,
  downloads,
  snippet,
];

/**
 * @typedef {(typeof BLOCK_MODULES)[number]} BlockModule
 */

/**
 * @template T
 * @param {(module: BlockModule) => T} getValue
 * @returns {Record<string, T>}
 */
const indexByType = (getValue) =>
  Object.fromEntries(BLOCK_MODULES.map((m) => [m.type, getValue(m)]));

const DOC_TYPE_MAP = {
  markdown: "string",
  image: "string",
  reference: "string",
};

const BLOCK_SCHEMAS = indexByType((m) => m.fields);

/** @type {Record<string, "full" | "wide" | "narrow">} */
const BLOCK_CONTAINER_WIDTHS = indexByType((m) =>
  "containerWidth" in m ? m.containerWidth : "wide",
);

/** @param {string} blockType */
const getBlockContainerWidth = (blockType) =>
  BLOCK_CONTAINER_WIDTHS[blockType] || "wide";

/**
 * Per-block override of the dispatch path. The default is
 * `design-system/blocks/<type>.html`. A block module exports `template` only
 * when multiple types share one underlying template (e.g. every `split-*`
 * variant points at `design-system/split.html`).
 * @type {Record<string, string | undefined>}
 */
const BLOCK_TEMPLATE_OVERRIDES = indexByType((m) =>
  "template" in m ? m.template : undefined,
);

/**
 * Returns the include-relative template path for a block type. Default is
 * derived from `type`; schema modules can override by exporting a `template`
 * string (used by split-* variants that share one underlying template).
 * Throws on unknown types so dispatching fails loudly rather than silently
 * including a non-existent path.
 *
 * @param {string} blockType
 * @returns {string} e.g. `"design-system/blocks/hero.html"`
 */
const getBlockTemplate = (blockType) => {
  if (!(blockType in BLOCK_SCHEMAS)) {
    throw new Error(
      `Unknown block type "${blockType}". Valid types: ${Object.keys(BLOCK_SCHEMAS).join(", ")}`,
    );
  }
  const override = BLOCK_TEMPLATE_OVERRIDES[blockType];
  if (override) return override;
  return `design-system/blocks/${blockType}.html`;
};

/**
 * Collection allowlist per block type. `null` means the block is available on
 * every collection; an array restricts it to the listed collections.
 * @type {Record<string, string[] | null>}
 */
const BLOCK_ALLOWED_COLLECTIONS = indexByType((m) =>
  "collections" in m ? m.collections : null,
);

/**
 * Returns true when `blockType` is allowed on the given collection.
 * Unrestricted blocks are allowed on every collection.
 * @param {string} blockType
 * @param {string} collectionName
 */
const isBlockAllowedIn = (blockType, collectionName) => {
  const allowed = BLOCK_ALLOWED_COLLECTIONS[blockType];
  return allowed === null || allowed.includes(collectionName);
};

const BLOCK_CMS_FIELDS = indexByType((m) => ({
  ...CONTAINER_FIELDS,
  ...Object.fromEntries(
    Object.entries(m.fields)
      .filter(([, f]) => "label" in f)
      .map(([key, { description, default: _default, ...cmsProps }]) => [
        key,
        cmsProps,
      ]),
  ),
}));

const BLOCK_DOCS = indexByType((m) => ({
  ...m.docs,
  params: Object.fromEntries(
    Object.entries(m.fields).map(([key, field]) => [
      key,
      {
        type: field.list ? "array" : DOC_TYPE_MAP[field.type] || field.type,
        ...(field.required && { required: true }),
        ...(field.default !== undefined && { default: field.default }),
        description: field.description,
      },
    ]),
  ),
}));

/** @param {readonly string[]} arr */
const quoteJoin = (arr) => arr.map((k) => `"${k}"`).join(", ");

/**
 * @typedef {Record<string, unknown>} Block
 */

/** @param {string} t @returns {(v: unknown) => boolean} */
const isTypeof = (t) => (v) => typeof v === t;

/**
 * Per-field-type runtime checks. `image` stores a path string;
 * `reference` stores a collection item slug; `markdown` stores markdown
 * source text passed to markdown-it — all plain strings at runtime.
 * @type {Record<string, { label: string, check: (v: unknown) => boolean }>}
 */
const FIELD_TYPE_CHECKS = {
  string: { label: "a string", check: isTypeof("string") },
  markdown: { label: "a string", check: isTypeof("string") },
  image: { label: "a string", check: isTypeof("string") },
  reference: { label: "a string", check: isTypeof("string") },
  number: { label: "a number", check: isTypeof("number") },
  boolean: { label: "a boolean", check: isTypeof("boolean") },
  object: {
    label: "an object",
    check: (v) => typeof v === "object" && v !== null && !Array.isArray(v),
  },
};

const LIST_CHECK = { label: "an array", check: Array.isArray };

/** Field types for wrapper keys (e.g. `dark`, `compact`) accepted on every block. */
const COMMON_FIELD_TYPES = {
  dark: { type: "boolean" },
  compact: { type: "boolean" },
};

/**
 * Converts a `{type, list?}` field definition map to `[key, spec]` pairs
 * for constructing a per-block lookup table. The returned spec is
 * `undefined` when the declared type has no known runtime check.
 *
 * @param {object} defs
 */
const specEntries = (defs) =>
  Object.entries(defs).map(([k, d]) => [
    k,
    d.list ? LIST_CHECK : FIELD_TYPE_CHECKS[d.type],
  ]);

const COMMON_SPEC_ENTRIES = specEntries(COMMON_FIELD_TYPES);

/**
 * Pre-computed per-block lookup of `fieldName -> { label, check }`. Built
 * once at module load so `validateBlock` can do a straight dictionary
 * lookup per field instead of branching on `type` + `list` at runtime.
 *
 * @type {Record<string, Record<string, { label: string, check: (v: unknown) => boolean }>>}
 */
const BLOCK_FIELD_SPECS = Object.fromEntries(
  Object.entries(BLOCK_SCHEMAS).map(([blockType, fieldDefs]) => [
    blockType,
    Object.fromEntries([...specEntries(fieldDefs), ...COMMON_SPEC_ENTRIES]),
  ]),
);

/**
 * Pre-computed map of block type → field names that are object-lists
 * whose sub-schema requires `name`. Built once at module load.
 * @type {Record<string, string[]>}
 */
const NAMED_LIST_FIELDS = Object.fromEntries(
  Object.entries(BLOCK_SCHEMAS)
    .map(([type, fields]) => [
      type,
      Object.entries(fields)
        .filter(([, f]) => f.type === "object" && f.list && f.fields?.name)
        .map(([fieldName]) => fieldName),
    ])
    .filter(([, names]) => names.length > 0),
);

/**
 * Validates a single block against its schema.
 *
 * @param {Block} block - Block to validate
 * @param {string} ctx - Context suffix for error messages
 * @returns {string[]} Array of error strings; empty means valid
 */
const validateBlock = (block, ctx) => {
  if (typeof block.type !== "string") {
    return [`Block is missing required "type" field${ctx}`];
  }

  const specs = BLOCK_FIELD_SPECS[block.type];
  if (!specs) {
    return [
      `Unknown block type "${block.type}"${ctx}. Valid types: ${Object.keys(BLOCK_FIELD_SPECS).join(", ")}`,
    ];
  }

  const allowedKeys = [...Object.keys(specs), "type"];
  const unknown = Object.keys(block).filter((k) => !allowedKeys.includes(k));
  const unknownErrors =
    unknown.length > 0
      ? [
          `Block type "${block.type}" has unknown keys: ${quoteJoin(unknown)}${ctx}. Allowed keys: ${quoteJoin(Object.keys(specs))}`,
        ]
      : [];

  const fieldErrors = Object.entries(block).flatMap(([key, value]) => {
    const spec = specs[key];
    const skip =
      !spec || value === undefined || value === null || spec.check(value);
    if (skip) return [];
    const actual = Array.isArray(value) ? "array" : typeof value;
    return [
      `Block "${block.type}" field "${key}" must be ${spec.label} but got ${actual}${ctx}`,
    ];
  });

  return [...unknownErrors, ...fieldErrors];
};

/**
 * Collects validation errors for an array of blocks without throwing.
 * @param {Block[]} blocks - Array of blocks to validate
 * @param {string} context - Context for error messages (e.g., file path)
 * @returns {string[]} Array of error strings
 */
const collectBlockErrors = (blocks, context = "") =>
  blocks.flatMap((block, index) =>
    validateBlock(block, ` (block ${index + 1}${context})`),
  );

/**
 * Validates an array of blocks against their schemas.
 * Collects all errors across all blocks before throwing so the user sees
 * every problem in one build rather than one at a time.
 *
 * @param {Block[]} blocks - Array of blocks to validate
 * @param {string} context - Context for error messages (e.g., file path)
 * @throws {Error} If any block contains unknown keys or invalid type
 */
const validateBlocks = (blocks, context = "") => {
  const errors = collectBlockErrors(blocks, context);
  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }
};

/**
 * Canonical example per block type, in BLOCK_MODULES order. Each entry's
 * `example` is a valid `blocks[]` entry: the block gallery page renders
 * them live and the test suite validates every one against its schema,
 * so each type always has one demonstrable, working usage.
 */
const BLOCK_EXAMPLES = BLOCK_MODULES.map((m) => {
  return {
    type: m.type,
    summary: m.docs.summary,
    collections: "collections" in m ? m.collections : null,
    example: m.example,
  };
});

export {
  BLOCK_CMS_FIELDS,
  BLOCK_DOCS,
  BLOCK_EXAMPLES,
  BLOCK_SCHEMAS,
  collectBlockErrors,
  getBlockContainerWidth,
  getBlockTemplate,
  isBlockAllowedIn,
  NAMED_LIST_FIELDS,
  validateBlock,
  validateBlocks,
};
