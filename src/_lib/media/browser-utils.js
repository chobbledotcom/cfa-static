import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { ensureDir } from "#eleventy/file-utils.js";
import { ROOT_DIR } from "#lib/paths.js";
import { log, error as logError } from "#utils/console.js";
import { isExternalUrl } from "#utils/url-utils.js";

export { frozenObject } from "#utils/fp/object.js";
export { log };

export const BROWSER_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
  "--no-zygote",
  "--single-process",
];

export const DEFAULT_BASE_URL = "http://localhost:8080";
export const DEFAULT_TIMEOUT = 10000;

/** @param {string} pagePath */
export const sanitizePagePath = (pagePath) =>
  pagePath.replace(/^\//, "").replace(/\/$/, "").replace(/\//g, "-") || "home";

/** @param {string} outputPath */
export const prepareOutputDir = (outputPath) => {
  ensureDir(dirname(outputPath));
};

/**
 * @param {string} pagePath
 * @param {string} baseUrl
 */
export const buildUrl = (pagePath, baseUrl) =>
  isExternalUrl(pagePath)
    ? pagePath
    : `${baseUrl}${pagePath.startsWith("/") ? "" : "/"}${pagePath}`;

/**
 * @param {string} pagePath
 * @param {{ outputDir: string, suffix?: string, extension: string }} options
 */
export const buildOutputPath = (
  pagePath,
  { outputDir, suffix = "", extension },
) => join(outputDir, `${sanitizePagePath(pagePath)}${suffix}.${extension}`);

/**
 * @typedef {{ outputDir: string, baseUrl: string, outputPath: string | null }} BaseOperationOptions
 */

/**
 * @template {object} Options
 * @typedef {BaseOperationOptions & Options} OperationOptions
 */

/**
 * @template {object} Options
 * @typedef {OperationOptions<Options>} OutputPathOpts
 */

/**
 * @template {object} Options
 * @typedef {(opts: OutputPathOpts<Options>, path: string) => string} OutputPathBuilder
 */

/**
 * @template {object} Options
 * @typedef {string | ((opts: OutputPathOpts<Options>) => string)} OutputPathValue
 */

/**
 * @template {object} Options
 * @typedef {{ opts: OperationOptions<Options>, url: string, outputPath: string }} OperationContext
 */

/**
 * @template {object} Options
 * @param {OutputPathValue<Options>} value
 * @param {OutputPathOpts<Options>} opts
 * @returns {string}
 */
const resolveOutputPathValue = (value, opts) =>
  typeof value === "function" ? value(opts) : value;

/**
 * Create a buildOutputPath wrapper with configurable suffix/extension.
 * @template {object} Options
 * @param {{ suffix?: OutputPathValue<Options>, extension: OutputPathValue<Options> }} options
 * @returns {OutputPathBuilder<Options>}
 */
export const createOutputPathBuilder =
  ({ suffix = "", extension }) =>
  (opts, path) => {
    return buildOutputPath(path, {
      outputDir: opts.outputDir,
      suffix: resolveOutputPathValue(suffix, opts),
      extension: resolveOutputPathValue(extension, opts),
    });
  };

/**
 * @template {object} Options
 * @param {string} pagePath
 * @param {OperationOptions<Options>} defaultOpts
 * @param {Partial<OperationOptions<Options>>} userOptions
 * @param {(opts: OperationOptions<Options>, path: string) => string} buildPath
 * @returns {OperationContext<Options>}
 */
export const createOperationContext = (
  pagePath,
  defaultOpts,
  userOptions,
  buildPath,
) => {
  const mergedOptions = { ...defaultOpts, ...userOptions };
  return {
    opts: mergedOptions,
    url: buildUrl(pagePath, mergedOptions.baseUrl),
    outputPath: mergedOptions.outputPath || buildPath(mergedOptions, pagePath),
  };
};

/**
 * Create operation context using a path-builder config.
 * @template {object} O
 * @param {string} pagePath
 * @param {OutputPathOpts<O>} defaultOpts
 * @param {Partial<OutputPathOpts<O>>} userOptions
 * @param {{ suffix?: OutputPathValue<O>, extension: OutputPathValue<O> }} pathConfig
 * @returns {OperationContext<O>}
 */
export const createPathContext = (
  pagePath,
  defaultOpts,
  userOptions,
  pathConfig,
) => {
  const buildPath = createOutputPathBuilder(pathConfig);
  return createOperationContext(pagePath, defaultOpts, userOptions, buildPath);
};

/**
 * Creates an error info factory for page path batch operations
 * @template {string} P
 * @param {P[]} pagePaths
 * @returns {(i: number, reason: Error) => { pagePath: P, error: string }}
 */
export const pathErrorInfo = (pagePaths) => (i, reason) => ({
  pagePath: pagePaths[i],
  error: reason.message,
});

/**
 * @template T
 * @template R
 * @template E
 * @param {T[]} items
 * @param {(item: T) => Promise<R>} operationFn
 * @param {(i: number, reason: Error) => E} makeErrorInfo
 * @returns {Promise<{ results: Awaited<R>[], errors: E[] }>}
 */
export const runBatchOperations = async (items, operationFn, makeErrorInfo) => {
  const settled = await Promise.allSettled(items.map(operationFn));
  return {
    results: settled.flatMap((r) =>
      r.status === "fulfilled" ? [r.value] : [],
    ),
    errors: settled.flatMap((r, i) =>
      r.status === "rejected" ? [makeErrorInfo(i, r.reason)] : [],
    ),
  };
};

/**
 * Create a batch runner that runs an operation across multiple page paths
 * @template R
 * @param {(pagePath: string, options: object) => Promise<R>} operationFn
 * @returns {(pagePaths: string[], options?: object) => Promise<{ results: Awaited<R>[], errors: { pagePath: string, error: string }[] }>}
 */
export const createBatchRunner =
  (operationFn) =>
  (pagePaths, options = {}) =>
    runBatchOperations(
      pagePaths,
      (pagePath) => operationFn(pagePath, options),
      pathErrorInfo(pagePaths),
    );

/**
 * @param {string} baseUrl
 * @param {number} [maxAttempts]
 * @param {number} [delay]
 */
export const waitForServer = async (baseUrl, maxAttempts = 30, delay = 250) => {
  for (let i = 0; i < maxAttempts; i++) {
    const [result] = await Promise.allSettled([fetch(baseUrl)]);
    const isReady =
      result.status === "fulfilled" &&
      (result.value.ok || result.value.status === 404);
    if (isReady) return true;
    await new Promise((r) => setTimeout(r, delay));
  }
  throw new Error(
    `Server at ${baseUrl} did not respond after ${maxAttempts} attempts`,
  );
};

/**
 * @typedef {{ port: number, baseUrl: string, stop: () => Promise<void> }} DevServerHandle
 */

/**
 * Serve a built site directory for browser automation (screenshots,
 * lighthouse). Uses Eleventy Dev Server - the same server behind
 * `npm run serve` - with live reload off so pages are served exactly
 * as built, with no injected scripts.
 * @param {string} siteDir
 * @param {number} [port]
 * @returns {Promise<DevServerHandle>}
 */
export const startServer = async (siteDir, port = 8080) => {
  const { default: EleventyDevServer } = await import(
    "@11ty/eleventy-dev-server"
  );
  const server = EleventyDevServer.getServer("cfa-static-tools", siteDir, {
    liveReload: false,
    portReassignmentRetryCount: 0,
    logger: { info: log, log, error: logError },
  });
  server.serve(port);

  const baseUrl = `http://localhost:${port}`;
  await waitForServer(baseUrl, 30, 250);

  return { port, baseUrl, stop: () => server.close() };
};

/** @param {string} subdir */
export const getDefaultOutputDir = (subdir) => join(ROOT_DIR, subdir);

/**
 * Browser executable used for screenshots and Lighthouse runs: the
 * CHROME_PATH override when set, otherwise Playwright's own Chromium.
 * One resolution path for both tools, so the override works everywhere.
 */
export const getChromePath = async () => {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const { chromium } = await import("playwright");
  return chromium.executablePath();
};

/** @param {string} chromePath */
export const launchChromeHeadless = async (chromePath) => {
  const chromeLauncher = await import("chrome-launcher");
  return chromeLauncher.launch({
    chromePath,
    chromeFlags: ["--headless", ...BROWSER_ARGS],
  });
};

const BROWSER_NOT_INSTALLED_MSG =
  "Browser not found.\n" +
  "Run: npx playwright install chromium\n" +
  "(or point CHROME_PATH at an existing Chromium binary)";

/**
 * Resolve the browser executable and fail loudly if it does not exist.
 * @returns {Promise<string>} Path to the browser executable
 */
export const ensureBrowserInstalled = async () => {
  const execPath = await getChromePath();
  if (!existsSync(execPath)) {
    logError(BROWSER_NOT_INSTALLED_MSG);
    throw new Error(BROWSER_NOT_INSTALLED_MSG);
  }
  return execPath;
};
