import { afterEach, describe, expect, test, vi } from "vitest";

/**
 * validated-config runs its checks at module load, so each test mocks
 * site.json and re-imports the module fresh.
 */
const importWithSite = async (site) => {
  vi.doMock("#data/site.json", () => ({ default: site }));
  vi.resetModules();
  return import("#config/validated-config.js");
};

afterEach(() => {
  vi.doUnmock("#data/site.json");
  vi.resetModules();
  vi.unstubAllEnvs();
});

describe("validated-config", () => {
  test("throws with a singular heading for one config error", async () => {
    await expect(
      importWithSite({ name: "Example Site", url: "https://example.com/" }),
    ).rejects.toThrow(/Configuration error:\n.*must not end with a slash/s);
  });

  test("throws with a plural heading listing every error", async () => {
    await expect(
      importWithSite({ name: "Example Site", url: "ftp://example.com/" }),
    ).rejects.toThrow(
      /Configuration errors \(2\):[\s\S]*1\..*slash[\s\S]*2\..*http or https/,
    );
  });

  test("exports the validated site url", async () => {
    const mod = await importWithSite({
      name: "Example Site",
      url: "https://example.com",
    });
    expect(mod.siteUrl).toBe("https://example.com");
  });

  test("SITE_URL env overrides the canonical origin", async () => {
    vi.stubEnv("SITE_URL", "https://deployed.example.org");
    const mod = await importWithSite({
      name: "Example Site",
      url: "https://example.com",
    });
    expect(mod.siteUrl).toBe("https://deployed.example.org");
  });
});
