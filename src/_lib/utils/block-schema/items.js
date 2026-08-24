import {
  collectionField,
  IMAGE_ASPECT_RATIO_FIELD,
  ITEMS_COMMON_FIELDS,
} from "#utils/block-schema/shared.js";

export const type = "items";

export const fields = {
  collection: collectionField(
    'Name of an Eleventy collection (e.g. `"news"`, `"guideCategories"`).',
  ),
  ...ITEMS_COMMON_FIELDS,
  image_aspect_ratio: IMAGE_ASPECT_RATIO_FIELD,
};

export const docs = {
  summary:
    "Displays an Eleventy collection as a card grid or horizontal slider.",
  scss: "src/css/design-system/_items.scss",
};

export const example = {
  type: "items",
  collection: "news",
  intro_content:
    "## A collection as cards\n\nThis example renders the `news` collection.",
};
