/**
 * Interactive prompts for CMS customisation
 */

import * as readline from "node:readline";
import {
  getRequiredCollections,
  getSelectableCollections,
  resolveDependencies,
} from "#scripts/customise-cms/collections.js";
import {
  filter,
  map,
  memberOf,
  notMemberOf,
  pipe,
  unique,
} from "#toolkit/fp/array.js";

/**
 * @typedef {import('./config.js').CmsConfig} CmsConfig
 * @typedef {import('./config.js').CmsFeatures} CmsFeatures
 * @typedef {import('./collections.js').CollectionDefinition} CollectionDefinition
 */

/**
 * @typedef {Object} SelectableOption
 * @property {string} name - Option identifier
 * @property {string} label - Display label
 * @property {string} description - Human-readable description
 */

/**
 * Create readline interface
 * @returns {readline.Interface} Readline interface for user input
 */
const createInterface = () =>
  readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

/**
 * Ask a yes/no question
 * @param {readline.Interface} rl - Readline interface
 * @param {string} question - Question to ask
 * @param {boolean} [defaultValue=false] - Default answer if user presses enter
 * @returns {Promise<boolean>} User's answer
 */
const askYesNo = async (rl, question, defaultValue = false) => {
  const defaultHint = defaultValue ? "[Y/n]" : "[y/N]";
  return new Promise((resolve) => {
    rl.question(`${question} ${defaultHint}: `, (answer) => {
      const trimmed = answer.trim().toLowerCase();
      if (trimmed === "") {
        resolve(defaultValue);
      } else {
        resolve(trimmed === "y" || trimmed === "yes");
      }
    });
  });
};

/**
 * Ask a free-text question and return the trimmed answer
 * @param {readline.Interface} rl - Readline interface
 * @param {string} question - Question to ask
 * @param {string} [defaultValue=""] - Default answer if user presses enter
 * @returns {Promise<string>} User's answer
 */
const askFreeText = async (rl, question, defaultValue = "") => {
  const defaultHint = defaultValue ? ` [${defaultValue}]` : "";
  return new Promise((resolve) => {
    rl.question(`${question}${defaultHint}: `, (answer) => {
      const trimmed = answer.trim();
      resolve(trimmed === "" ? defaultValue : trimmed);
    });
  });
};

/**
 * Parse selection input into array of selected names
 * @param {string} input - User's input (comma-separated numbers, "all", "none", or empty)
 * @param {SelectableOption[]} options - Available options to select from
 * @param {string[]} defaults - Default selections if input is empty
 * @returns {string[]} Array of selected option names
 */
const parseSelection = (input, options, defaults) => {
  const trimmed = input.trim().toLowerCase();

  if (trimmed === "" && defaults.length > 0) return defaults;
  if (trimmed === "all") return map((o) => o.name)(options);
  if (trimmed === "none" || trimmed === "") return [];

  const isValidIndex = (n) => n >= 1 && n <= options.length;
  const toName = (n) => options[n - 1].name;
  const toNumber = (n) => Number.parseInt(n.trim(), 10);

  return pipe(
    map(toNumber),
    filter(isValidIndex),
    map(toName),
  )(trimmed.split(","));
};

/**
 * Display options list
 * @param {SelectableOption[]} options - Options to display
 * @param {string[]} defaults - Default selections (marked with *)
 * @returns {void}
 */
const displayOptions = (options, defaults) => {
  for (let i = 0; i < options.length; i++) {
    const isDefault = defaults.includes(options[i].name);
    const marker = isDefault ? "*" : " ";
    console.log(
      `${marker} ${i + 1}. ${options[i].label} - ${options[i].description}`,
    );
  }
  console.log("\n* = previously selected");
};

/**
 * Ask user to select from a list of options
 * @param {readline.Interface} rl - Readline interface
 * @param {string} question - Question to display
 * @param {SelectableOption[]} options - Available options
 * @param {string[]} [defaults=[]] - Default selections
 * @returns {Promise<string[]>} Selected option names
 */
const askMultiSelect = async (rl, question, options, defaults = []) => {
  console.log(`\n${question}`);
  console.log("Enter numbers separated by commas, or 'all' for all options.\n");
  displayOptions(options, defaults);

  return new Promise((resolve) => {
    rl.question("\nYour selection: ", (answer) => {
      resolve(parseSelection(answer, options, defaults));
    });
  });
};

/**
 * Ask collection selection questions
 * @param {readline.Interface} rl - Readline interface
 * @param {string[]} defaultCollections - Previously selected collections
 * @returns {Promise<string[]>} Selected collection names with dependencies resolved
 */
const askCollectionQuestions = async (rl, defaultCollections) => {
  const selectableCollections = getSelectableCollections();
  const selectedCollections = await askMultiSelect(
    rl,
    "Which collections do you want to use?",
    selectableCollections,
    defaultCollections,
  );

  const requiredNames = map((c) => c.name)(getRequiredCollections());
  const allSelected = unique([...requiredNames, ...selectedCollections]);
  const resolved = resolveDependencies(allSelected);

  const addedDeps = filter(notMemberOf([...allSelected, ...requiredNames]))(
    resolved,
  );
  if (addedDeps.length > 0) {
    console.log(
      `\nNote: Also including ${addedDeps.join(", ")} (required dependencies)`,
    );
  }

  return resolved;
};

/**
 * Ask conditional feature questions for no_index (hiding from listings)
 * @param {readline.Interface} rl - Readline interface
 * @param {string[]} collections - Selected collection names
 * @param {Partial<CmsFeatures>} defaultFeatures - Default feature values
 * @returns {Promise<{no_index: boolean}>} No index selection
 */
const askNoIndexQuestion = async (rl, collections, defaultFeatures) => {
  const hasPagesOrNews = collections.some(memberOf(["pages", "news"]));

  return {
    no_index: hasPagesOrNews
      ? await askYesNo(
          rl,
          "Do you want to hide pages/news from listings (no_index field)?",
          defaultFeatures.no_index ?? false,
        )
      : false,
  };
};

/**
 * Parse a comma-separated string into an array of slugified names
 * @param {string} input - Comma-separated names (e.g., "clients, services")
 * @returns {string[]} Array of slugified names
 */
const parseCustomCollectionNames = (input) => {
  if (!input) return [];
  return input
    .split(",")
    .map((s) => s.trim().toLowerCase().replace(/\s+/g, "-"))
    .filter((s) => s.length > 0);
};

/**
 * Ask about custom blocks collections
 * @param {readline.Interface} rl - Readline interface
 * @param {string[]} defaultCustomCollections - Previously configured custom collections
 * @returns {Promise<string[]>} Custom collection names
 */
const askCustomBlocksCollectionsQuestion = async (
  rl,
  defaultCustomCollections,
) => {
  const defaultValue = defaultCustomCollections.join(", ");
  const answer = await askFreeText(
    rl,
    "Enter custom blocks collections (comma-separated, e.g., 'clients, services'), or leave empty for none",
    defaultValue,
  );
  return parseCustomCollectionNames(answer);
};

/**
 * Ask feature questions
 * @param {readline.Interface} rl - Readline interface
 * @param {string[]} collections - Selected collection names
 * @param {Partial<CmsFeatures>} defaultFeatures - Default feature values
 * @returns {Promise<CmsFeatures>} All feature selections
 */
const askFeatureQuestions = async (rl, collections, defaultFeatures) => {
  console.log("\n--- Optional Features ---\n");

  const baseFeatures = {
    permalinks: await askYesNo(
      rl,
      "Do you want custom permalinks on items?",
      defaultFeatures.permalinks ?? false,
    ),
    redirects: await askYesNo(
      rl,
      "Do you want redirect_from support (for URL redirects)?",
      defaultFeatures.redirects ?? false,
    ),
    faqs: await askYesNo(
      rl,
      "Do you want FAQs on items?",
      defaultFeatures.faqs ?? false,
    ),
    galleries: await askYesNo(
      rl,
      "Do you want image galleries on items?",
      defaultFeatures.galleries ?? false,
    ),
    external_navigation_urls: await askYesNo(
      rl,
      "Do you want to link to external URLs in your navigation?",
      defaultFeatures.external_navigation_urls ?? false,
    ),
    use_visual_editor: await askYesNo(
      rl,
      "Do you want to use a visual rich-text editor instead of markdown?",
      defaultFeatures.use_visual_editor ?? false,
    ),
  };

  const noIndexFeatures = await askNoIndexQuestion(
    rl,
    collections,
    defaultFeatures,
  );
  return {
    ...baseFeatures,
    ...noIndexFeatures,
  };
};

/**
 * Ask about src folder structure
 * @param {readline.Interface} rl - Readline interface
 * @param {boolean} defaultHasSrc - Default answer
 * @returns {Promise<boolean>} Whether template has src folder
 */
const askSrcFolderQuestion = async (rl, defaultHasSrc) => {
  return await askYesNo(
    rl,
    "Does your template have a 'src' folder?",
    defaultHasSrc ?? true,
  );
};

/**
 * Main question flow
 * @param {CmsConfig | null} [existingConfig=null] - Existing configuration to use as defaults
 * @returns {Promise<CmsConfig>} Complete CMS configuration
 */
export const askQuestions = async (existingConfig = null) => {
  const rl = createInterface();

  try {
    const defaultCollections = existingConfig?.collections || [];
    const defaultFeatures = existingConfig?.features || {};
    const defaultHasSrc = existingConfig?.hasSrcFolder ?? true;
    const defaultCustomBlocksCollections =
      existingConfig?.customBlocksCollections || [];

    console.log("\n--- Template Configuration ---\n");
    const hasSrcFolder = await askSrcFolderQuestion(rl, defaultHasSrc);

    const collections = await askCollectionQuestions(rl, defaultCollections);
    const features = await askFeatureQuestions(
      rl,
      collections,
      defaultFeatures,
    );

    const customBlocksCollections = await askCustomBlocksCollectionsQuestion(
      rl,
      defaultCustomBlocksCollections,
    );

    return {
      collections,
      features,
      hasSrcFolder,
      customBlocksCollections,
    };
  } finally {
    rl.close();
  }
};
