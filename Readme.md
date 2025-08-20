# typeorm-query-kit

**Magical Query Parsing for TypeORM APIs**

[![npm version](https://img.shields.io/npm/v/typeorm-query-kit.svg)](https://www.npmjs.com/package/typeorm-query-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

A powerful, intuitive query parser middleware that transforms simple HTTP queries into complex TypeORM queries. Filter, sort, paginate, and include relations with elegant query parameters.

## ✨ Features

- **🔍 Advanced Filtering** - Support for operators (`$eq`, `$ne`, `$in`, `$like`, etc.)
- **📊 Smart Sorting** - Multi-field sorting with custom order
- **📄 Built-in Pagination** - Easy pagination with page/limit parameters
- **🎯 Range Queries** - Number and date range filtering
- **🤝 Relation Loading** - Automatic JOINs for related entities
- **🛡️ Security First** - Field-level permission controls
- **⚡ TypeScript Ready** - Full type definitions included
- **🚀 Lightweight** - Zero dependencies (except TypeORM and Express)

## Installation

```bash
npm install typeorm-query-kit
# or
yarn add typeorm-query-kit
```

## Quick Start

```typescript
import express from 'express';
import { queryParser, applyQueryOptions } from 'typeorm-query-kit';
import { getRepository } from 'typeorm';
import { User } from './entities/User';

const app = express();
app.use(queryParser); // Add the middleware

app.get('/users', async (req, res) => {
  try {
    const userRepository = getRepository(User);
    let queryBuilder = userRepository.createQueryBuilder('user');
    
    // Apply query options magically!
    queryBuilder = await applyQueryOptions(queryBuilder, 'user', req.queryOptions);
    
    const [users, total] = await queryBuilder.getManyAndCount();
    
    res.json({
      data: users,
      total,
      page: req.queryOptions.page,
      limit: req.queryOptions.limit
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

## 🎯 Usage Examples

### Basic Filtering
```http
GET /api/users?filter={"name":"John Doe","status":"active"}
```

### Advanced Operators
```http
GET /api/users?filter={"age":{"$gte":18,"$lte":30},"email":{"$like":"@company.com"}}
```

### Sorting
```http
GET /api/products?sort={"field":"price","order":"DESC"}
```

### Multi-field Sorting
```http
GET /api/users?sort=[{"field":"lastName","order":"ASC"},{"field":"firstName","order":"ASC"}]
```

### Pagination
```http
GET /api/products?page=2&limit=20
```

### Range Queries
```http
GET /api/products?range={"price":{"gte":10,"lte":50},"createdAt":{"gte":"2023-01-01"}}
```

### Including Relations
```http
GET /api/users?relations=["profile","orders","orders.items"]
```

### Complex Example
```http
GET /api/orders?
  page=2&
  limit=10&
  filter={"status":"completed","user.role":"VIP"}&
  range={"total":{"gt":100},"createdAt":{"gte":"2023-10-01"}}&
  sort={"field":"createdAt","order":"DESC"}&
  relations=["user","items"]
```

## 🔧 API Reference

### `queryParser` Middleware

Parses incoming query parameters and attaches a `queryOptions` object to the request.

```typescript
app.use(queryParser);
// Now req.queryOptions is available in your routes
```

### `applyQueryOptions(queryBuilder, baseAlias, options, config?)`

Applies the parsed query options to a TypeORM QueryBuilder.

**Parameters:**
- `queryBuilder`: TypeORM SelectQueryBuilder instance
- `baseAlias`: Main entity alias (e.g., 'user', 'product')
- `options`: Query options from `req.queryOptions`
- `config?`: Optional field configuration for security

## 🛡️ Field Configuration

Control which fields can be filtered, sorted, or used in range queries:

```typescript
const fieldConfig = {
  user: {
    id: { filterable: true, sortable: true },
    email: { filterable: true, searchable: true },
    password: { filterable: false }, // Sensitive field
    createdAt: { filterable: true, sortable: true, rangeable: true }
  }
};

// Apply configuration
app.use((req, res, next) => {
  req.entityConfig = fieldConfig;
  next();
});
```

## 🚀 Advanced Usage

### Custom Validation
```typescript
app.use((req, res, next) => {
  // Add custom validation logic before applying queries
  if (req.queryOptions.filter?.email) {
    // Validate email format
  }
  next();
});
```

### Error Handling
```typescript
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (error.message.includes('Invalid filter') || error.message.includes('Range value')) {
    return res.status(400).json({ error: error.message });
  }
  next(error);
});
```

## 📋 Supported Operators

| Operator | Example | Description |
|----------|---------|-------------|
| `$eq` | `{"status":"active"}` | Equality |
| `$ne` | `{"status":{"$ne":"banned"}}` | Not equal |
| `$gt` | `{"age":{"$gt":18}}` | Greater than |
| `$gte` | `{"age":{"$gte":21}}` | Greater than or equal |
| `$lt` | `{"price":{"$lt":100}}` | Less than |
| `$lte` | `{"price":{"$lte":50}}` | Less than or equal |
| `$in` | `{"id":{"$in":[1,2,3]}}` | In array |
| `$nin` | `{"role":{"$nin":["guest"]}}` | Not in array |
| `$like` | `{"name":{"$like":"john"}}` | Case-sensitive search |
| `$isNull` | `{"deletedAt":{"$isNull":true}}` | Is null check |

## 🤝 Contributing

We love contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📚 [Documentation](https://github.com/your-username/typeorm-query-kit/wiki)
- 🐛 [Report Bugs](https://github.com/your-username/typeorm-query-kit/issues)
- 💡 [Request Features](https://github.com/your-username/typeorm-query-kit/issues)
- ❓ [Questions & Discussions](https://github.com/your-username/typeorm-query-kit/discussions)

## 🏆 Credits

Made with ❤️ by [Your Name]

---

**Ready to work some magic?** ✨

```bash
npm install typeorm-query-kit
```

Transform your API queries from mundane to magical today!
```

This README provides:

1. **Eye-catching branding** with emojis and clear structure
2. **Quick start** section for immediate implementation
3. **Comprehensive examples** covering all features
4. **Clear API documentation** with code samples
5. **Advanced usage patterns** for complex scenarios
6. **Operator reference table** for easy lookup
7. **Contribution guidelines** for open-source collaboration
8. **Professional formatting** with badges and sections

The documentation is designed to be both beginner-friendly and comprehensive enough for advanced users. It highlights the magical aspect of your package while providing all the technical details developers need to implement it successfully.