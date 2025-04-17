import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Product } from '../../src/modules/products/entities/product.entity';

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  categoryId: number | string;
  supplierIds?: (number | string)[];
}

/**
 * Helper function to make a GET request to the products endpoint
 */
export const getProducts = (
  app: INestApplication,
  tenantId: string,
  page: number = 1,
  limit: number = 10,
) => {
  return request(app.getHttpServer())
    .get(`/v1/products?page=${page}&limit=${limit}`)
    .set('x-tenant-id', tenantId);
};

/**
 * Helper function to search for products
 */
export const searchProducts = (
  app: INestApplication,
  tenantId: string,
  query: string,
) => {
  return request(app.getHttpServer())
    .get(`/v1/products/search?query=${query}`)
    .set('x-tenant-id', tenantId);
};

/**
 * Helper function to get a single product by ID
 */
export const getProductById = (
  app: INestApplication,
  productId: string | number,
  tenantId: string,
) => {
  return request(app.getHttpServer())
    .get(`/v1/products/${productId}`)
    .set('x-tenant-id', tenantId);
};

/**
 * Helper function to create a product
 */
export const createProduct = (
  app: INestApplication,
  productData: CreateProductDto,
  tenantId: string,
) => {
  return request(app.getHttpServer())
    .post('/v1/products')
    .set('x-tenant-id', tenantId)
    .send(productData);
};

/**
 * Helper function to update a product
 */
export const updateProduct = (
  app: INestApplication,
  productId: string | number,
  productData: Partial<CreateProductDto>,
  tenantId: string,
) => {
  return request(app.getHttpServer())
    .put(`/v1/products/${productId}`)
    .set('x-tenant-id', tenantId)
    .send(productData);
};

/**
 * Helper function to delete a product
 */
export const deleteProduct = (
  app: INestApplication,
  productId: string | number,
  tenantId: string,
) => {
  return request(app.getHttpServer())
    .delete(`/v1/products/${productId}`)
    .set('x-tenant-id', tenantId);
};

/**
 * Creates mock product data
 */
export const createMockProduct = (
  id: number = 1,
  name: string = 'Test Product',
  price: number = 100,
  quantity: number = 10,
  categoryId: number = 1,
  supplierIds: number[] = [1],
  tenantId: string = '7272daf4-d2d8-4738-bc2a-a20dd5bf94c6',
): Partial<Product> => {
  return {
    id,
    name,
    price,
    quantity,
    categoryId,
    tenantId,
    suppliers: supplierIds.map((supplierId) => ({
      id: supplierId,
      tenantId,
      name: 'Supplier Name',
      email: 'supplier@example.com',
      phone: '123-456-7890',
      address: 'Supplier Address',
      contactPerson: 'Contact Person',
      notes: 'Notes',
      createdAt: new Date(),
      updatedAt: new Date(),
      products: [],
      tenant: {
        id: tenantId,
        name: 'Tenant Name',
        email: 'tenant@example.com',
        phone: '123-456-7890',
        address: 'Tenant Address',
        apiKey: 'api-key-example',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(0),
      },
    })),
  };
};
