/**
 * Builds the /blocks/ gallery page out of blocks.
 *
 * For every block type this emits a section-header (name + summary), a
 * code-block holding the exact YAML you would write, and then the example
 * itself, rendered live by the normal block pipeline. Types restricted to
 * specific collections get an explanatory callout instead of a preview.
 */
import { stringify } from "yaml";
import { BLOCK_EXAMPLES } from "#utils/block-schema.js";

const GALLERY_HEADER = {
  type: "hero",
  badge: "Reference",
  content:
    "# Every block, live\n\nEach section below is one block type: what it's for, the YAML you write, and the same block rendered right underneath. These are the canonical examples the test suite validates - if it's on this page, it works.",
};

export const buildGalleryBlocks = () => [
  GALLERY_HEADER,
  ...BLOCK_EXAMPLES.flatMap(({ type, summary, collections, example }) => [
    { type: "section-header", intro: `## \`${type}\`\n\n${summary}` },
    {
      type: "code-block",
      filename: `${type}.yaml`,
      language: "yaml",
      code: stringify({ blocks: [example] }).trimEnd(),
    },
    collections
      ? {
          type: "callout",
          variant: "info",
          icon: "hugeicons:information-circle",
          name: "Rendered in context",
          content: `This block only renders on ${collections.join(" and ")} pages, so there is no live preview here - the YAML above is still its complete usage.`,
        }
      : example,
  ]),
];
