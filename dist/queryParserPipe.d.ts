export declare class QueryParserPipe {
    parse(query: any): {
        filter: {
            [field: string]: any;
        };
        range: {
            [field: string]: {
                gt?: number;
                gte?: number;
                lt?: number;
                lte?: number;
            };
        };
        sort?: {
            field: string;
            order: 'ASC' | 'DESC';
        }[];
        page: number;
        limit: number;
        relations: string[];
        config?: any;
    };
    private parseFilter;
    private validateFilter;
    private parseRange;
    private validateRange;
    private parseSort;
    private parsePage;
    private parseLimit;
    private parseRelations;
}
