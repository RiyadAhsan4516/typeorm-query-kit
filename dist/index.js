"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = exports.transformParams = exports.applyQueryOptions = exports.queryParser = void 0;
var queryParser_1 = require("./queryParser");
Object.defineProperty(exports, "queryParser", { enumerable: true, get: function () { return queryParser_1.queryParser; } });
var queryOptions_1 = require("./queryOptions");
Object.defineProperty(exports, "applyQueryOptions", { enumerable: true, get: function () { return queryOptions_1.applyQueryOptions; } });
Object.defineProperty(exports, "transformParams", { enumerable: true, get: function () { return queryOptions_1.transformParams; } });
// Optional: Default configuration for common entities
exports.defaultConfig = {
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
