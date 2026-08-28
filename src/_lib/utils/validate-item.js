/**
 * Item-level validation.
 *
 * Checks that collection items have a `name` field. `validateItem` also runs
 * the shared block-schema validator so direct callers receive every item and
 * block error together.
 */

import { collectBlockErrors } from "#utils/block-schema.js";

/**
 * Collect item-level name errors without throwing.
 * Only checks `name` on tagged content items (pages/products/events etc.);
 * utility templates without tags (feeds, sitemaps) are exempt.
 * @param {Record<string, unknown>} data - Item data
 * @param {string} context - Context for error messages (e.g., file path)
 * @returns {string[]}
 */
export const collectItemErrors = (data, context = "") => {
  const isTaggedContent = Array.isArray(data.tags) && data.tags.length > 0;
  const nameError =
    isTaggedContent && !data.eleventyExcludeFromCollections && !data.name
      ? [`Item is missing required "name" field${context}`]
      : [];

  return nameError;
};

/**
 * Validates an item's name and every block against the shared block schemas.
 * Collects every error before throwing so the user sees them all at once.
 *
 * @param {Record<string, unknown>} data - Item data
 * @param {string} context - Context for error messages (e.g., file path)
 * @throws {Error} If any required `name` field is missing
 */
export const validateItem = (data, context = "") => {
  const blockErrors = Array.isArray(data.blocks)
    ? collectBlockErrors(data.blocks, context)
    : [];
  const errors = [...collectItemErrors(data, context), ...blockErrors];
  if (errors.length > 0) throw new Error(errors.join("\n"));
};
