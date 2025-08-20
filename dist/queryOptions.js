"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyQueryOptions = applyQueryOptions;
exports.transformParams = transformParams;
// Global param counter for generating unique keys
let paramCounter = 0;
/**
 * Dynamically applies filtering, ranges, sorting, pagination with validation
 */
async function applyQueryOptions(qb, baseAlias, options, config) {
    //  Transform the parameters/options into valid object
    options = await transformParams(options);
    const { filter = {}, range = {}, sort, page = 1, limit = 10, relations = [] } = options;
    const validatedPage = Math.max(1, Number(page) || 1);
    const validatedLimit = Math.min(100, Math.max(1, Number(limit) || 10));
    // Pre-join specified relations
    relations.forEach(relation => {
        if (!isRelationJoined(qb, baseAlias, relation)) {
            qb.leftJoin(`${baseAlias}.${relation}`, relation);
        }
    });
    // Apply filters, ranges, sorting
    applyFilters(qb, baseAlias, filter, config);
    applyRanges(qb, baseAlias, range, config);
    applySorting(qb, baseAlias, sort, config);
    // Pagination
    qb.skip((validatedPage - 1) * validatedLimit).take(validatedLimit);
    return qb;
}
/** ---------------- Helper Functions ---------------- */
function isRelationJoined(qb, parentAlias, relationAlias) {
    return qb.expressionMap.joinAttributes.some(j => j.alias.name === relationAlias && j.parentAlias === parentAlias);
}
// Filtering
function applyFilters(qb, baseAlias, filter, config) {
    for (const [field, value] of Object.entries(filter)) {
        if (value === null || value === undefined)
            continue;
        const { alias, fieldName } = resolveAlias(field, baseAlias);
        if (config && !isFieldAllowed(alias, fieldName, 'filterable', config)) {
            throw new Error(`Filtering not allowed on field: ${field}`);
        }
        const paramKey = generateParamKey(alias, fieldName);
        if (Array.isArray(value)) {
            qb.andWhere(`${alias}.${fieldName} IN (:...${paramKey})`, { [paramKey]: value });
        }
        else if (typeof value === 'object' && !value._raw) {
            applyOperatorFilters(qb, alias, fieldName, value, paramKey, config);
        }
        else if (typeof value === 'string' && isFieldSearchable(alias, fieldName, config)) {
            qb.andWhere(`${alias}.${fieldName} LIKE :${paramKey}`, {
                [paramKey]: `%${escapeLikeString(value)}%`
            });
        }
        else {
            qb.andWhere(`${alias}.${fieldName} = :${paramKey}`, { [paramKey]: value });
        }
    }
}
// Range Queries
function applyRanges(qb, baseAlias, ranges, config) {
    for (const [field, conditions] of Object.entries(ranges)) {
        const { alias, fieldName } = resolveAlias(field, baseAlias);
        if (config && !isFieldAllowed(alias, fieldName, 'rangeable', config)) {
            throw new Error(`Range queries not allowed on field: ${field}`);
        }
        const paramBase = generateParamKey(alias, fieldName);
        if (conditions.gt !== undefined)
            qb.andWhere(`${alias}.${fieldName} > :${paramBase}_gt`, { [`${paramBase}_gt`]: conditions.gt });
        if (conditions.gte !== undefined)
            qb.andWhere(`${alias}.${fieldName} >= :${paramBase}_gte`, { [`${paramBase}_gte`]: conditions.gte });
        if (conditions.lt !== undefined)
            qb.andWhere(`${alias}.${fieldName} < :${paramBase}_lt`, { [`${paramBase}_lt`]: conditions.lt });
        if (conditions.lte !== undefined)
            qb.andWhere(`${alias}.${fieldName} <= :${paramBase}_lte`, { [`${paramBase}_lte`]: conditions.lte });
        if (conditions.gte !== undefined && conditions.lte !== undefined && conditions.gte > conditions.lte) {
            throw new Error(`Invalid range: ${conditions.gte} > ${conditions.lte}`);
        }
    }
}
// Sorting
function applySorting(qb, baseAlias, sort, config) {
    if (!sort) {
        // qb.addOrderBy(`${baseAlias}.created_at`, "DESC");
        return;
    }
    // Ensure array
    const sortArray = Array.isArray(sort) ? sort : [sort];
    sortArray.forEach((s, index) => {
        const { alias, fieldName } = resolveAlias(s.field, baseAlias);
        if (config && !isFieldAllowed(alias, fieldName, 'sortable', config)) {
            throw new Error(`Sorting not allowed on field: ${s.field}`);
        }
        const order = s.order?.toUpperCase() === "ASC" ? "ASC" : "DESC";
        // Use addOrderBy only, no NULLS LAST (compatible with MariaDB/MySQL)
        if (index === 0) {
            qb.orderBy(`${alias}.${fieldName}`, order);
        }
        else {
            qb.addOrderBy(`${alias}.${fieldName}`, order);
        }
    });
}
/** ---------------- Operator Filters ---------------- */
function applyOperatorFilters(qb, alias, fieldName, operators, paramBase, config) {
    for (const [op, value] of Object.entries(operators)) {
        switch (op) {
            case '$ne':
                qb.andWhere(`${alias}.${fieldName} != :${paramBase}_ne`, { [`${paramBase}_ne`]: value });
                break;
            case '$like':
                qb.andWhere(`${alias}.${fieldName} LIKE :${paramBase}_like`, { [`${paramBase}_like`]: `%${escapeLikeString(value)}%` });
                break;
            case '$LIKE':
                qb.andWhere(`${alias}.${fieldName} LIKE :${paramBase}_LIKE`, { [`${paramBase}_LIKE`]: `%${escapeLikeString(value)}%` });
                break;
            case '$in':
                if (!Array.isArray(value))
                    throw new Error(`$in value must be an array`);
                qb.andWhere(`${alias}.${fieldName} IN (:...${paramBase}_in)`, { [`${paramBase}_in`]: value });
                break;
            case '$nin':
                if (!Array.isArray(value))
                    throw new Error(`$nin value must be an array`);
                qb.andWhere(`${alias}.${fieldName} NOT IN (:...${paramBase}_nin)`, { [`${paramBase}_nin`]: value });
                break;
            case '$isNull':
                qb.andWhere(`${alias}.${fieldName} IS ${value ? '' : 'NOT '}NULL`);
                break;
            case '$gt':
                qb.andWhere(`${alias}.${fieldName} > :${paramBase}_gt`, { [`${paramBase}_gt`]: value });
                break;
            case '$gte':
                qb.andWhere(`${alias}.${fieldName} >= :${paramBase}_gte`, { [`${paramBase}_gte`]: value });
                break;
            case '$lt':
                qb.andWhere(`${alias}.${fieldName} < :${paramBase}_lt`, { [`${paramBase}_lt`]: value });
                break;
            case '$lte':
                qb.andWhere(`${alias}.${fieldName} <= :${paramBase}_lte`, { [`${paramBase}_lte`]: value });
                break;
            default:
                throw new Error(`Unsupported operator: ${op}`);
        }
    }
}
/** ---------------- Utilities ---------------- */
function resolveAlias(field, baseAlias) {
    const parts = field.split(".");
    const fieldName = parts.pop();
    const alias = parts.length ? parts.join("_") : baseAlias;
    return { alias, fieldName };
}
function generateParamKey(alias, fieldName) {
    paramCounter++;
    return `${alias}_${fieldName}_${paramCounter}`;
}
function escapeLikeString(str) {
    return str.replace(/[\\%_]/g, "\\$&");
}
function isFieldAllowed(alias, fieldName, operation, config) {
    const entityConfig = config[alias];
    if (!entityConfig)
        return false;
    const fieldConfig = entityConfig[fieldName];
    if (!fieldConfig)
        return false;
    return fieldConfig[operation] !== false;
}
function isFieldSearchable(alias, fieldName, config) {
    if (!config)
        return true;
    return config[alias]?.[fieldName]?.searchable !== false;
}
async function transformParams(params) {
    // Parse JSON strings and convert page/limit to numbers
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const filter = params.filter ? JSON.parse(params.filter) : {};
    const sort = params.sort ? JSON.parse(params.sort) : undefined;
    const range = params.range ? JSON.parse(params.range) : {};
    const relations = params.relations ? JSON.parse(params.relations) : [];
    return { page, limit, filter, range, sort, relations };
}
