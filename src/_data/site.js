import siteData from "./site.json" with { type: "json" };

// SITE_URL lets a deployment (e.g. the GitHub Pages workflow) override the
// canonical origin without editing site.json.
const site = {
  ...siteData,
  url: process.env.SITE_URL || siteData.url,
};

export default function () {
  return site;
}
