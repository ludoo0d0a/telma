/**
 * OpenAPI Schema Validator Utility
 * 
 * Converts OpenAPI 3.0 schemas to JSON Schema format and validates API responses
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// Load OpenAPI spec - Jest can handle JSON imports
// eslint-disable-next-line import/no-unresolved
const openApiSpec = require('../../../public/openapi.json');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

/**
 * Convert OpenAPI 3.0 schema reference to JSON Schema
 */
function resolveSchemaRef(ref) {
    if (!ref || !ref.startsWith('#/components/schemas/')) {
        return null;
    }
    
    const schemaName = ref.replace('#/components/schemas/', '');
    return openApiSpec.components.schemas[schemaName];
}

/**
 * Convert OpenAPI 3.0 schema to JSON Schema format
 */
function convertOpenApiToJsonSchema(openApiSchema) {
    if (!openApiSchema) {
        return {};
    }

    // Handle $ref
    if (openApiSchema.$ref) {
        const resolved = resolveSchemaRef(openApiSchema.$ref);
        if (resolved) {
            return convertOpenApiToJsonSchema(resolved);
        }
        return {};
    }

    // Handle oneOf
    if (openApiSchema.oneOf) {
        return {
            oneOf: openApiSchema.oneOf.map(s => convertOpenApiToJsonSchema(s))
        };
    }

    // Handle arrays
    if (openApiSchema.type === 'array' || openApiSchema.items) {
        return {
            type: 'array',
            items: openApiSchema.items ? convertOpenApiToJsonSchema(openApiSchema.items) : {}
        };
    }

    // Handle objects
    if (openApiSchema.type === 'object' || openApiSchema.properties) {
        const jsonSchema = {
            type: 'object',
            properties: {},
            required: openApiSchema.required || []
        };

        if (openApiSchema.properties) {
            for (const [key, value] of Object.entries(openApiSchema.properties)) {
                jsonSchema.properties[key] = convertOpenApiToJsonSchema(value);
            }
        }

        // Handle additionalProperties
        if (openApiSchema.additionalProperties !== undefined) {
            jsonSchema.additionalProperties = openApiSchema.additionalProperties;
        } else {
            jsonSchema.additionalProperties = true; // OpenAPI default
        }

        return jsonSchema;
    }

    // Handle enums
    if (openApiSchema.enum) {
        return {
            type: openApiSchema.type || 'string',
            enum: openApiSchema.enum
        };
    }

    // Handle simple types
    const jsonSchema = {
        type: openApiSchema.type || 'string' // Default to string if type not specified
    };

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

    return jsonSchema;
}

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

    return convertOpenApiToJsonSchema(schema);
}

/**
 * Validate response data against OpenAPI schema
 */
export function validateResponse(path, method, statusCode, data) {
    const schema = getResponseSchema(path, method, statusCode);
    
    if (!schema) {
        console.warn(`No schema found for ${method} ${path} ${statusCode}`);
        return { valid: true, errors: [] };
    }

    const validate = ajv.compile(schema);
    const valid = validate(data);

    return {
        valid,
        errors: validate.errors || []
    };
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

