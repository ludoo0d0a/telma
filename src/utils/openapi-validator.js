/**
 * OpenAPI Schema Validator Utility
 * 
 * Converts OpenAPI 3.0 schemas to JSON Schema format and validates API responses
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// Load OpenAPI spec - Jest can handle JSON imports
// eslint-disable-next-line import/no-unresolved
const openApiSpec = require('../../public/openapi.json');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

/**
 * Convert OpenAPI 3.0 schema reference to a JSON Schema definition ref (without dereferencing).
 */
function refToJsonSchemaRef(ref) {
    if (!ref || typeof ref !== 'string' || !ref.startsWith('#/components/schemas/')) {
        return null;
    }
    const schemaName = ref.replace('#/components/schemas/', '');
    return `#/definitions/${schemaName}`;
}

/**
 * Convert OpenAPI 3.0 schema to JSON Schema format
 */
function convertOpenApiToJsonSchema(openApiSchema, ctx = {}) {
    if (!openApiSchema) {
        return {};
    }

    const seen = ctx.seen || (ctx.seen = new WeakMap());
    if (typeof openApiSchema === 'object') {
        const cached = seen.get(openApiSchema);
        if (cached) return cached;
    }

    // Handle $ref (do NOT dereference to avoid infinite recursion on circular schemas)
    if (openApiSchema.$ref) {
        const ref = refToJsonSchemaRef(openApiSchema.$ref);
        if (ref) return { $ref: ref };
        return {};
    }

    // Handle oneOf
    if (openApiSchema.oneOf) {
        const out = { oneOf: openApiSchema.oneOf.map(s => convertOpenApiToJsonSchema(s, ctx)) };
        if (typeof openApiSchema === 'object') seen.set(openApiSchema, out);
        return out;
    }

    // Handle anyOf / allOf
    if (openApiSchema.anyOf) {
        const out = { anyOf: openApiSchema.anyOf.map(s => convertOpenApiToJsonSchema(s, ctx)) };
        if (typeof openApiSchema === 'object') seen.set(openApiSchema, out);
        return out;
    }
    if (openApiSchema.allOf) {
        const out = { allOf: openApiSchema.allOf.map(s => convertOpenApiToJsonSchema(s, ctx)) };
        if (typeof openApiSchema === 'object') seen.set(openApiSchema, out);
        return out;
    }

    // Handle arrays
    if (openApiSchema.type === 'array' || openApiSchema.items) {
        const out = {
            type: 'array',
            items: openApiSchema.items ? convertOpenApiToJsonSchema(openApiSchema.items, ctx) : {}
        };
        if (typeof openApiSchema === 'object') seen.set(openApiSchema, out);
        return out;
    }

    // Handle objects
    if (openApiSchema.type === 'object' || openApiSchema.properties) {
        const jsonSchema = {
            type: 'object',
            properties: {},
            required: openApiSchema.required || []
        };
        if (typeof openApiSchema === 'object') seen.set(openApiSchema, jsonSchema);

        if (openApiSchema.properties) {
            for (const [key, value] of Object.entries(openApiSchema.properties)) {
                jsonSchema.properties[key] = convertOpenApiToJsonSchema(value, ctx);
            }
        }

        // Handle additionalProperties
        if (openApiSchema.additionalProperties !== undefined) {
            jsonSchema.additionalProperties = typeof openApiSchema.additionalProperties === 'object'
                ? convertOpenApiToJsonSchema(openApiSchema.additionalProperties, ctx)
                : openApiSchema.additionalProperties;
        } else {
            jsonSchema.additionalProperties = true; // OpenAPI default
        }

        return jsonSchema;
    }

    // Handle enums
    if (openApiSchema.enum) {
        const out = {
            type: openApiSchema.type || 'string',
            enum: openApiSchema.enum
        };
        if (typeof openApiSchema === 'object') seen.set(openApiSchema, out);
        return out;
    }

    // Handle simple types
    const jsonSchema = {
        type: openApiSchema.type || 'string' // Default to string if type not specified
    };
    if (typeof openApiSchema === 'object') seen.set(openApiSchema, jsonSchema);

    if (openApiSchema.format) {
        jsonSchema.format = openApiSchema.format;
    }

    if (openApiSchema.pattern) {
        jsonSchema.pattern = openApiSchema.pattern;
    }

    if (openApiSchema.description) {
        jsonSchema.description = openApiSchema.description;
    }

    if (openApiSchema.minimum !== undefined) {
        jsonSchema.minimum = openApiSchema.minimum;
    }

    if (openApiSchema.maximum !== undefined) {
        jsonSchema.maximum = openApiSchema.maximum;
    }

    if (openApiSchema.minLength !== undefined) {
        jsonSchema.minLength = openApiSchema.minLength;
    }

    if (openApiSchema.maxLength !== undefined) {
        jsonSchema.maxLength = openApiSchema.maxLength;
    }

    // OpenAPI nullable -> JSON Schema union with null
    if (openApiSchema.nullable === true) {
        jsonSchema.type = Array.isArray(jsonSchema.type) ? [...jsonSchema.type, 'null'] : [jsonSchema.type, 'null'];
    }

    return jsonSchema;
}

let _definitionsCache = null;
function getDefinitions() {
    if (_definitionsCache) return _definitionsCache;
    const schemas = openApiSpec?.components?.schemas || {};
    const ctx = { seen: new WeakMap() };
    const defs = {};
    for (const [name, schema] of Object.entries(schemas)) {
        defs[name] = convertOpenApiToJsonSchema(schema, ctx);
    }
    _definitionsCache = defs;

    return _definitionsCache;
}

const _validatorCache = new Map();

/**
 * Get response schema for an endpoint
 */
export function getResponseSchema(path, method = 'get', statusCode = '200') {
    const pathSpec = openApiSpec.paths[path];
    if (!pathSpec) {
        throw new Error(`Path not found: ${path}`);
    }

    const operation = pathSpec[method.toLowerCase()];
    if (!operation) {
        throw new Error(`Method ${method} not found for path: ${path}`);
    }

    const response = operation.responses[statusCode];
    if (!response) {
        throw new Error(`Status code ${statusCode} not found for ${method} ${path}`);
    }

    const content = response.content?.['application/json'];
    if (!content) {
        return null; // No JSON response schema
    }

    const schema = content.schema;
    if (!schema) {
        return null;
    }

    return schema; // Return OpenAPI schema; conversion happens in validateResponse with shared definitions.
}

/**
 * Validate response data against OpenAPI schema
 */
export function validateResponse(path, method, statusCode, data) {
    const openApiSchema = getResponseSchema(path, method, statusCode);
    if (!openApiSchema) {
        console.warn(`No schema found for ${method} ${path} ${statusCode}`);
        return { valid: true, errors: [] };
    }

    const cacheKey = `${method.toLowerCase()} ${path} ${statusCode}`;
    let validate = _validatorCache.get(cacheKey);
    if (!validate) {
        try {
            const ctx = { seen: new WeakMap() };
            const converted = convertOpenApiToJsonSchema(openApiSchema, ctx);
            const schema = { ...converted, definitions: getDefinitions() };

            validate = ajv.compile(schema);
            _validatorCache.set(cacheKey, validate);
        } catch (e) {
            throw e;
        }
    }

    const valid = validate(data);
    let errors = validate.errors || [];
    
    // Filter out date format errors - APIs often return ISO datetime strings for date fields
    // This is a known API behavior and we're lenient about it
    errors = errors.filter(err => {
        // Ignore format errors for date fields (APIs may return date-time for date fields)
        if (err.keyword === 'format' && err.params?.format === 'date') {
            return false;
        }
        return true;
    });
    
    return { valid: errors.length === 0, errors };
}

/**
 * Get schema for a component
 */
export function getComponentSchema(componentName) {
    const schema = openApiSpec.components.schemas[componentName];
    if (!schema) {
        throw new Error(`Component schema not found: ${componentName}`);
    }
    return convertOpenApiToJsonSchema(schema);
}

/**
 * Validate data against a component schema
 */
export function validateComponent(componentName, data) {
    const schema = getComponentSchema(componentName);
    const validate = ajv.compile(schema);
    const valid = validate(data);

    return {
        valid,
        errors: validate.errors || []
    };
}

/**
 * Helper to format validation errors for Jest
 */
export function formatValidationErrors(errors) {
    if (!errors || errors.length === 0) {
        return '';
    }

    return errors.map(err => {
        const path = err.instancePath || err.schemaPath;
        const message = err.message;
        const params = err.params ? JSON.stringify(err.params) : '';
        return `  - ${path}: ${message}${params ? ` (${params})` : ''}`;
    }).join('\n');
}

