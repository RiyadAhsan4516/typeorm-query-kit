declare namespace QueryParserTypes {
    interface QuerySort {
        field: string;
        order: 'ASC' | 'DESC';
    }
    interface QueryRange {
        [field: string]: {
            gt?: number;
            gte?: number;
            lt?: number;
            lte?: number;
        };
    }
    interface QueryFilter {
        [field: string]: any;
    }
    interface QueryOptions {
        filter: QueryFilter;
        range: QueryRange;
        sort?: QuerySort[];
        page: number;
        limit: number;
        relations: string[];
        config?: any;
    }
}
export declare class QueryParserPipe {
    parse(query: any): QueryParserTypes.QueryOptions;
    private parseFilter;
    private validateFilter;
    private parseRange;
    private validateRange;
    private parseSort;
    private parsePage;
    private parseLimit;
    private parseRelations;
}
export {};
