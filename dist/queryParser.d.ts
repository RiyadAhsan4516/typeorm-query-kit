import { NextFunction, Response } from "express";
import { ObjectLiteral } from "typeorm";
interface QuerySort {
    field: string;
    order: "ASC" | "DESC";
}
interface QueryRange {
    [field: string]: {
        gt?: number;
        gte?: number;
        lt?: number;
        lte?: number;
    };
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
interface QueryOptions<T extends ObjectLiteral = any> {
    filter?: Partial<Record<keyof T, any>> & Record<string, any>;
    range?: QueryRange;
    sort?: QuerySort | QuerySort[];
    page?: number;
    limit?: number;
    relations?: string[];
    config?: EntityQueryConfig;
}
declare global {
    namespace Express {
        interface Request {
            queryOptions: QueryOptions;
            query: any;
            entityConfig: any;
        }
    }
}
export declare function queryParser(req: Express.Request, res: Response, next: NextFunction): void;
export {};
