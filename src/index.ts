export { queryParser } from './queryParser';
export { applyQueryOptions, transformParams } from './queryOptions';

// Optional: Default configuration for common entities
export const defaultConfig: Record<string, any> = {
    user: {
        id: { filterable: true, sortable: true },
        email: { filterable: true, searchable: true },
        createdAt: { filterable: true, sortable: true, rangeable: true },
        updatedAt: { filterable: true, sortable: true, rangeable: true }
    },
    product: {
        id: { filterable: true, sortable: true },
        name: { filterable: true, searchable: true, sortable: true },
        price: { filterable: true, sortable: true, rangeable: true },
        createdAt: { filterable: true, sortable: true, rangeable: true }
    }
    // Add more default configurations as needed
};