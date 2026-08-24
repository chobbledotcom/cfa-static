import { frozenObject } from "#toolkit/fp/object.js";

const DEFAULTS = frozenObject({
  sticky_mobile_nav: true,
  horizontal_nav: true,
  collapse_mobile_menu: false,
  show_breadcrumbs: false,
  externalLinksTargetBlank: false,
  homepage_footer_markdown: null,
  placeholder_images: true,
  enable_theme_switcher: false,
  timezone: "Europe/London",
  list_item_fields: ["link", "subtitle", "thumbnail"],
  nav_thumbnails: false,
  navigation_content_anchor: false,
  screenshots: {},
  use_visual_editor: false,
  default_image_widths: [240, 480, 900, 1300],
  search_collections: ["news", "pages", "guides"],
  linkify_urls: true,
});

export { DEFAULTS };
