/**
 * Field builders for non-item collections.
 *
 * These collections don't follow the standard "item" layout (title, subtitle,
 * thumbnail, body, meta). Instead each one has a bespoke field list — e.g.
 * `pages` carries layout and navigation fields, `snippets` is just name +
 * body.
 */

import { blocksFieldFor } from "#scripts/customise-cms/blocks.js";
import {
  COMMON_FIELDS,
  createEleventyNavigationField,
} from "#scripts/customise-cms/fields.js";
import { compact } from "#toolkit/fp/array.js";

/**
 * @typedef {import('./generator-helpers.js').CmsConfig} CmsConfig
 * @typedef {import('./generator-helpers.js').CmsField} CmsField
 * @typedef {import('./generator-helpers.js').FieldContext} FieldContext
 */

/**
 * Field builders for each collection type - functions that accept config and fields
 * @param {CmsConfig} config - CMS configuration
 * @param {FieldContext} fields - Precomputed fields
 * @returns {Record<string, () => CmsField[]>} Map of collection names to field builder functions
 */
export const getCollectionFieldBuilders = (config, fields) => ({
  pages: () =>
    compact([
      COMMON_FIELDS.name,
      COMMON_FIELDS.subtitle,
      COMMON_FIELDS.meta_title,
      COMMON_FIELDS.meta_description,
      createEleventyNavigationField(config.features.external_navigation_urls),
      { name: "layout", type: "string" },
      config.features.no_index && COMMON_FIELDS.no_index,
      blocksFieldFor("pages", config.features.use_visual_editor),
    ]),

  "guide-categories": () =>
    compact([
      COMMON_FIELDS.name,
      COMMON_FIELDS.subtitle,
      COMMON_FIELDS.order,
      { name: "icon", type: "image", label: "Icon" },
    ]),

  snippets: () => [COMMON_FIELDS.name, fields.body],
});
