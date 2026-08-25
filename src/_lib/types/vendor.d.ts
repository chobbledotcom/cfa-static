/**
 * Shorthand ambient declarations for vendor packages that ship no types.
 * Imports from these modules type as `any`; give a package a real body
 * (like eleventy-dev-server.d.ts does) when a typed surface earns its keep.
 */

declare module "@11ty/eleventy" {
  /** The collection API handed to addCollection callbacks. */
  export interface CollectionApi {
    getAll(): any[];
    getFilteredByTag(tag: string): any[];
    getFilteredByTags(...tags: string[]): any[];
    getFilteredByGlob(glob: string | string[]): any[];
  }
  /** Eleventy's config object; typed loosely on purpose. */
  export type UserConfig = any;
  export const EleventyHtmlBasePlugin: unknown;
  export const RenderPlugin: unknown;
}
declare module "@11ty/eleventy-img";
declare module "@11ty/eleventy-plugin-rss";
declare module "@quasibit/eleventy-plugin-schema";
declare module "markdown-it";
