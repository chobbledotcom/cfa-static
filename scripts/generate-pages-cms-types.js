/**
 * Generate PagesCMS type definitions from .pages.yml schema
 *
 * This script parses .pages.yml and generates src/_lib/types/pages-cms-generated.d.ts
 * with TypeScript interfaces for all PagesCMS-validated data types.
 *
 * Fields marked as `required: true` in .pages.yml become non-optional
 * properties. This allows JSDoc annotations to leverage PagesCMS schema
 * validation.
 *
 * Run: npm run generate-cms-types
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import YAML from "yaml";
import { ROOT_DIR } from "#lib/paths.js";

const PAGES_YML = join(ROOT_DIR, ".pages.yml");

// Freshness tests set PAGES_CMS_TYPES_OUTPUT_PATH to compare regenerated
// output without overwriting the committed file while tsc may be reading it.
const OUTPUT_FILE = process.env.PAGES_CMS_TYPES_OUTPUT_PATH
  ? process.env.PAGES_CMS_TYPES_OUTPUT_PATH
  : join(ROOT_DIR, "src/_lib/types/pages-cms-generated.d.ts");

const SCALAR_TYPE_MAP = {
  string: "string",
  number: "number",
  boolean: "boolean",
  date: "string", // Dates come as ISO strings
  object: "Record<string, unknown>", // An object with no declared fields
  image: "string",
  code: "string",
  "rich-text": "string", // Rich text is a markdown/HTML string
  reference: "string", // References store paths as strings
};

/**
 * Map a PagesCMS field type to a TypeScript type. Object types with
 * declared fields get their own interface before this is reached; an
 * unrecognised type fails the generation loudly rather than emitting
 * a silent `unknown`.
 * @param {{ type?: string, name?: string }} field
 */
const mapFieldType = (field) => {
  const mapped = SCALAR_TYPE_MAP[field.type];
  if (!mapped) {
    throw new Error(
      `No TypeScript mapping for field "${field.name}" of type "${field.type}" - add it to SCALAR_TYPE_MAP`,
    );
  }
  return mapped;
};

/**
 * Generate an interface name from a field name
 * e.g., "image_cards" -> "PagesCMSImageCard"
 */
const generateInterfaceName = (fieldName) => {
  const singular = fieldName
    .replace(/s$/, "")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  return `PagesCMS${singular}`;
};

/**
 * Check if a field is a nested object type
 */
const isNestedObjectType = (field) => field.type === "object" && field.fields;

/**
 * Generate interface name for a nested type
 */
const generateNestedInterfaceName = (parentName, fieldName) => {
  const capitalizedName =
    fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  return `${parentName}${capitalizedName.replace(/s$/, "")}`;
};

/**
 * Get the TypeScript type for a subfield, processing nested objects if needed
 */
const getSubfieldType = (subField, parentInterfaceName, output) => {
  if (!isNestedObjectType(subField)) {
    return mapFieldType(subField);
  }

  const nestedName = generateNestedInterfaceName(
    parentInterfaceName,
    subField.name,
  );
  if (!output.generatedNames.has(nestedName)) {
    registerType(subField, nestedName, output);
  }
  return subField.list ? `${nestedName}[]` : nestedName;
};

/**
 * Extract the properties for a single object-type field
 */
const extractObjectFields = (field, interfaceName, output) =>
  field.fields.map((subField) => ({
    name: subField.name,
    type: getSubfieldType(subField, interfaceName, output),
    required: subField.required === true,
    label: subField.label,
  }));

/**
 * Generate the TypeScript source for one interface
 */
const generateObjectTypeCode = (interfaceName, properties) => {
  const lines = [`export interface ${interfaceName} {`];

  for (const prop of properties) {
    if (prop.label) lines.push(`  /** ${prop.label} */`);
    lines.push(`  ${prop.name}${prop.required ? "" : "?"}: ${prop.type};`);
  }

  lines.push("}");
  return lines.join("\n");
};

/**
 * Generate an interface for an object field and record it in the output.
 * The name is claimed before descending into subfields so re-entrant
 * nesting can never recurse forever.
 */
const registerType = (field, interfaceName, output) => {
  output.generatedNames.add(interfaceName);
  const properties = extractObjectFields(field, interfaceName, output);
  output.interfaces.push(generateObjectTypeCode(interfaceName, properties));
};

/**
 * Resolve a component reference in a field using the components map
 */
const resolveComponentRef = (field, components) => {
  if (!field.component) return field;
  const componentDef = components[field.component];
  if (!componentDef) return field;
  const { component: _c, ...fieldProps } = field;
  return { ...componentDef, ...fieldProps };
};

/**
 * Resolve all component references in a fields array, recursively
 */
const resolveFields = (fields, components) =>
  fields.map((field) => {
    const resolved = resolveComponentRef(field, components);
    if (resolved.fields) {
      return {
        ...resolved,
        fields: resolveFields(resolved.fields, components),
      };
    }
    return resolved;
  });

/**
 * Generate an interface for a top-level object field, once per field name
 */
const registerTopLevelField = (field, output) => {
  if (!isNestedObjectType(field) || output.generatedNames.has(field.name)) {
    return;
  }
  output.generatedNames.add(field.name);
  registerType(field, generateInterfaceName(field.name), output);
};

/**
 * Generate interfaces for every object-typed field across the config
 * @returns {string[]} TypeScript interface sources
 */
const extractAllTypes = (config) => {
  if (!Array.isArray(config.content)) {
    throw new Error(`${PAGES_YML} has no content section - nothing to type`);
  }
  const components = "components" in config ? config.components : {};
  const output = { interfaces: [], generatedNames: new Set() };

  for (const item of config.content) {
    const fields = item.fields ? resolveFields(item.fields, components) : [];
    for (const field of fields) {
      registerTopLevelField(field, output);
    }
  }

  return output.interfaces;
};

const FILE_HEADER = [
  "/**",
  " * @fileoverview Auto-generated PagesCMS types from .pages.yml",
  " *",
  " * Generated by: scripts/generate-pages-cms-types.js",
  " * Do not edit manually - regenerate using: npm run generate-cms-types",
  " *",
  " * These types represent data validated by PagesCMS schema (.pages.yml).",
  " * Fields marked as required: true in the schema are non-optional.",
  " * Use these in JSDoc annotations to leverage validation guarantees.",
  " */",
  "",
];

/**
 * Parse .pages.yml and generate type definitions
 */
const generateTypes = () => {
  const config = YAML.parse(readFileSync(PAGES_YML, "utf-8"));
  const interfaces = extractAllTypes(config);

  const output = [...FILE_HEADER, ...interfaces.flatMap((code) => [code, ""])];

  writeFileSync(OUTPUT_FILE, `${output.join("\n")}\n`);
  console.log(`✓ Generated types to ${OUTPUT_FILE}`);
  console.log(`✓ Generated ${interfaces.length} type interfaces`);
};

generateTypes();
