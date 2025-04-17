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
  id: number | string = 1,
  name: string = 'Test Product',
  price: number = 100,
  quantity: number = 10,
  categoryId: number | string = 1,
  supplierIds: (number | string)[] = [1],
  tenantId: string = '7272daf4-d2d8-4738-bc2a-a20dd5bf94c6',
): Partial<Product> => {
  return {
    id,
    name,
    price,
    quantity,
    categoryId,
    tenantId,
    suppliers: supplierIds.map(id => ({ id })),
  };
}; 