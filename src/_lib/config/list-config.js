import { resolveConfigList } from "#utils/config-list.js";

const DEFAULT_LIST_ITEM_FIELDS = ["thumbnail", "link", "date", "subtitle"];

/** @param {unknown} configFields */
const selectListItemFields = (configFields) =>
  resolveConfigList(configFields, DEFAULT_LIST_ITEM_FIELDS);

export { selectListItemFields };
