import { queryParser } from '../src';
import { Request, Response, NextFunction } from 'express';

describe('Query Parser', () => {
    let mockRequest : Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction = jest.fn();

    beforeEach(() => {
        mockRequest = {
            query: {}
        };
        mockResponse = {};
    });

    test('should parse basic filter', () => {
        mockRequest.query = {
            filter: '{"name":"John"}'
        };

        queryParser(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockRequest.queryOptions).toBeDefined();
        expect(mockRequest.queryOptions?.filter).toEqual({ name: 'John' });
    });

    // Add more tests for different scenarios
});