/**
 * Site configuration types
 *
 * Types for site-wide configuration after defaults are applied.
 */

/**
 * Screenshot configuration (optional feature)
 */
export type ScreenshotConfig = {
  enabled?: boolean;
  autoCapture?: boolean;
  collections?: string[];
  pages?: string[];
  outputDir?: string;
  port?: number;
  viewport?: string;
  timeout?: number;
  limit?: number;
};

/**
 * Site configuration after defaults are applied.
 * Values with defaults in DEFAULTS are guaranteed non-null.
 */
export type SiteConfig = {
  // Guaranteed by DEFAULTS (never null after config loading)
  sticky_mobile_nav: boolean;
  horizontal_nav: boolean;
  collapse_mobile_menu: boolean;
  show_breadcrumbs: boolean;
  externalLinksTargetBlank: boolean;
  placeholder_images: boolean;
  enable_theme_switcher: boolean;
  timezone: string;
  list_item_fields: string[];
  navigation_content_anchor: boolean;
  nav_thumbnails: boolean;
  use_visual_editor: boolean;
  default_image_widths: number[];
  search_collections: string[];
  linkify_urls: boolean;

  // Optional (may be null)
  homepage_footer_markdown: string | null;
  screenshots: ScreenshotConfig | null;

  // Derived (computed from other config values)
  internal_link_suffix: string;
};

/**
 * Site info from site.json
 */
export type SiteInfo = {
  url: string;
  name: string;
  logo?: string;
};
