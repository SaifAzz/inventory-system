# Inventory Management System

A modular inventory management system for an ERP project built with NestJS and TypeORM. This system provides a robust backend for inventory management with multi-tenant SaaS architecture.

## Features

- **Multi-tenant SaaS Architecture**: Secure isolation of data between different tenants
- **Product Management**: Create, read, update, and delete products with proper validation
- **Category Management**: Organize products into categories
- **Supplier Management**: Manage product suppliers with proper relationship handling
- **Advanced Search**: Search products by name or description
- **Inventory Valuation**: Calculate the total value of inventory
- **Role-based Access Control**: Secure endpoints with role-based permissions
- **API Documentation**: Comprehensive API documentation using Swagger

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Documentation**: Swagger
- **Authentication**: JWT

## Project Structure

```
src/
├── common/            # Common utilities, interceptors, decorators
├── config/            # Configuration settings
├── modules/
│   ├── auth/          # Authentication module
│   ├── categories/    # Categories module
│   ├── products/      # Products module
│   ├── suppliers/     # Suppliers module
│   └── tenants/       # Tenants module
└── seeds/             # Database seed data
```

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd inventory-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env` and update the values:
```bash
cp .env.example .env
```

4. Environment variables to configure:
```
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=inventory_management
NODE_ENV=development
JWT_SECRET=your_secret_key
```

### Running the Application

```bash
# Development
npm run start

# Watch mode
npm run start:dev

# Production mode
npm run start:prod
```

### Database Setup

```bash
# Run migrations
npm run migration:run

# Seed the database with initial data
npm run seed
```

## API Documentation

After starting the application, visit:
```
http://localhost:3000/api
```

This will open the Swagger UI where you can explore and test all available endpoints.

## Multi-tenant Usage

All API requests must include a tenant identifier through one of these methods:
- `x-tenant-id` header
- `tenantId` query parameter
- `tenantId` in the request body

## Key Endpoints

- **Categories**:
  - `GET /categories` - List all categories
  - `POST /categories` - Create a new category

- **Products**:
  - `GET /products` - List all products (with pagination)
  - `POST /products` - Create a new product
  - `GET /products/:id` - Get a product by ID
  - `PATCH /products/:id` - Update a product
  - `DELETE /products/:id` - Delete a product
  - `GET /products/search?query=...` - Search products by name

- **Suppliers**:
  - `GET /suppliers` - List all suppliers
  - `POST /suppliers` - Create a new supplier

## Business Logic

- Product price must be greater than 0
- Product quantity cannot be negative
- Supplier email must be unique and valid
- Soft deletion is implemented for products
- Products must be associated with valid categories and suppliers

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## License

[MIT](LICENSE)


tenant-id : af971c81-54ca-4e66-ac40-a2f6714745a0
email: admin@tenant2.com
password: admin@tenant2.com