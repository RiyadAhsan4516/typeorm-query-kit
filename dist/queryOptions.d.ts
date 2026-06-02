import { ObjectLiteral, SelectQueryBuilder } from "typeorm";
interface QueryOptions<T extends ObjectLiteral> {
    filter?: Partial<Record<keyof T, any>> & Record<string, any>;
    range?: Record<string, {
        gt?: number;
        gte?: number;
        lt?: number;
        lte?: number;
    }>;
    sort?: {
        field: string;
        order: "ASC" | "DESC";
    };
    page?: number;
    limit?: number;
    relations?: string[];
}
interface FieldConfig {
    filterable?: boolean;
    sortable?: boolean;
    rangeable?: boolean;
    searchable?: boolean;
}
interface EntityQueryConfig {
    [entity: string]: {
        [field: string]: FieldConfig;
    };
}
/**
 * Dynamically applies filtering, ranges, sorting, pagination with validation
 */
export declare function applyQueryOptions<T extends ObjectLiteral>(qb: SelectQueryBuilder<T>, baseAlias: string, options: QueryOptions<T>, config?: EntityQueryConfig): Promise<SelectQueryBuilder<T>>;
export declare function transformParams(params: any): Promise<{
    page: number;
    limit: number;
    filter: any;
    range: any;
    sort: any;
    relations: any;
}>;
export {};
