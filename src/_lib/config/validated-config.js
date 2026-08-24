/**
 * Centralized configuration validation.
 *
 * All validation runs at module load time. Errors are collected from every
 * validator before throwing so users see every problem at once rather than
 * discovering them one build failure at a time.
 *
 * Exports validated values for use by other modules.
 */
import languages from "#data/languages.json" with { type: "json" };
import site from "#data/site.json" with { type: "json" };
import { baseLanguageErrors } from "#utils/i18n.js";

const siteUrlProtocolErrors = !site.url
  ? []
  : !URL.canParse(site.url)
    ? [`site.json 'url' is not a valid URL: ${site.url}`]
    : ["http:", "https:"].includes(new URL(site.url).protocol)
      ? []
      : [`site.json 'url' must use http or https protocol, got: ${site.url}`];

const siteUrlErrors = !site.url
  ? ["site.json is missing the 'url' field"]
  : [
      ...(site.url.endsWith("/")
        ? [`site.json 'url' must not end with a slash: ${site.url}`]
        : []),
      ...siteUrlProtocolErrors,
    ];

const errors = [...baseLanguageErrors(languages), ...siteUrlErrors];

if (errors.length > 0) {
  const heading =
    errors.length === 1
      ? "Configuration error:"
      : `Configuration errors (${errors.length}):`;
  const body = errors.map((msg, i) => `  ${i + 1}. ${msg}`).join("\n");
  throw new Error(`${heading}\n${body}`);
}

export const siteUrl = site.url;
