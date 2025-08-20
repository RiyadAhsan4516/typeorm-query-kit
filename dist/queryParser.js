"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryParser = queryParser;
function queryParser(req, res, next) {
    try {
        let { filter, range, sort, page, limit, relations } = req.query;
        req.queryOptions = {
            filter: parseFilter(filter),
            range: parseRange(range),
            sort: parseSort(sort),
            page: parsePage(page),
            limit: parseLimit(limit),
            relations: parseRelations(relations),
            config: req.entityConfig // Optional: can be set by middleware earlier
        };
        next();
    }
    catch (error) {
        next(error);
    }
}
function parseFilter(filter) {
    if (!filter)
        return {};
    try {
        const parsed = typeof filter === 'string' ? JSON.parse(filter) : filter;
        validateFilter(parsed);
        return parsed;
    }
    catch (error) {
        throw new Error(`Invalid filter format: ${error.message}`);
    }
}
function validateFilter(filter) {
    const validOperators = ['$eq', '$ne', '$gt', '$gte', '$lt', '$lte', '$like', '$like', '$in', '$nin', '$isNull'];
    for (const [, value] of Object.entries(filter)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            // Validate operator syntax
            for (const [operator, opValue] of Object.entries(value)) {
                if (operator.startsWith('$') && !validOperators.includes(operator)) {
                    throw new Error(`Invalid operator '${operator}'. Valid operators: ${validOperators.join(', ')}`);
                }
                // Special validation for $isNull which expects boolean
                if (operator === '$isNull' && typeof opValue !== 'boolean') {
                    throw new Error('$isNull operator requires a boolean value');
                }
            }
        }
    }
}
function parseRange(range) {
    if (!range)
        return {};
    try {
        const parsed = typeof range === 'string' ? JSON.parse(range) : range;
        validateRange(parsed);
        return parsed;
    }
    catch (error) {
        throw new Error(`Invalid range format: ${error.message}`);
    }
}
function validateRange(range) {
    if (typeof range !== 'object' || range === null) {
        throw new Error('Range must be an object');
    }
    const validOperators = ['gt', 'gte', 'lt', 'lte'];
    for (const [field, conditions] of Object.entries(range)) {
        if (typeof conditions !== 'object' || conditions === null) {
            throw new Error(`Range conditions for ${field} must be an object`);
        }
        for (const [operator, value] of Object.entries(conditions)) {
            if (!validOperators.includes(operator)) {
                throw new Error(`Invalid range operator '${operator}'. Valid operators: ${validOperators.join(', ')}`);
            }
            if (typeof value !== 'number') {
                throw new Error(`Range value for ${field}.${operator} must be a number`);
            }
        }
    }
}
function parseSort(sort) {
    if (!sort)
        return undefined;
    try {
        const sortParsed = typeof sort === "string" ? JSON.parse(sort) : sort;
        const sortArray = Array.isArray(sortParsed) ? sortParsed : [sortParsed];
        return sortArray.map((s) => {
            if (!s.field || typeof s.field !== "string") {
                throw new Error("Sort field is required and must be a string");
            }
            return {
                field: s.field,
                order: s.order?.toUpperCase() === "DESC" ? "DESC" : "ASC",
            };
        });
    }
    catch (error) {
        throw new Error(`Invalid sort format: ${error.message}`);
    }
}
function parsePage(page) {
    const defaultPage = 1;
    if (!page)
        return defaultPage;
    const parsed = parseInt(String(page), 10);
    if (isNaN(parsed) || parsed < 1) {
        throw new Error('Page must be a positive integer');
    }
    return parsed;
}
function parseLimit(limit) {
    const defaultLimit = 10;
    const maxLimit = 100;
    if (!limit)
        return defaultLimit;
    const parsed = parseInt(String(limit), 10);
    if (isNaN(parsed)) {
        throw new Error('Limit must be a number');
    }
    if (parsed < 1) {
        throw new Error('Limit must be at least 1');
    }
    return Math.min(parsed, maxLimit);
}
function parseRelations(relations) {
    if (!relations)
        return [];
    if (typeof relations === 'string') {
        return relations.split(',').map(r => r.trim()).filter(Boolean);
    }
    if (Array.isArray(relations)) {
        return relations.map(String).filter(Boolean);
    }
    return [];
}
