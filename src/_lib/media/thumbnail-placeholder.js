import { pipe } from "#utils/fp/array.js";

const PLACEHOLDER_COLORS = [
  "green",
  "blue",
  "pink",
  "yellow",
  "purple",
  "orange",
];

/** @param {string} str */
const hashString = (str) =>
  Math.abs(
    [...str].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) | 0, 0),
  );

/** @param {string} itemPath */
const getPlaceholderForPath = (itemPath) =>
  pipe(
    hashString,
    (hash) => hash % PLACEHOLDER_COLORS.length,
    (index) => PLACEHOLDER_COLORS[index],
    (color) => `images/placeholders/${color}.svg`,
  )(itemPath);

export { getPlaceholderForPath, PLACEHOLDER_COLORS };
