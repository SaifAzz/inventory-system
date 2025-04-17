import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Category } from '../../src/modules/categories/entities/category.entity';

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

/**
 * Helper function to make a GET request to the categories endpoint
 */
export const getCategories = (app: INestApplication, tenantId: string) => {
  return request(app.getHttpServer())
    .get('/v1/categories')
    .set('x-tenant-id', tenantId);
};

/**
 * Helper function to get a single category by ID
 */
export const getCategoryById = (
  app: INestApplication,
  categoryId: string | number,
  tenantId: string,
) => {
  return request(app.getHttpServer())
    .get(`/v1/categories/${categoryId}`)
    .set('x-tenant-id', tenantId);
};

/**
 * Helper function to create a category
 */
export const createCategory = (
  app: INestApplication,
  categoryData: CreateCategoryDto,
  tenantId: string,
) => {
  return request(app.getHttpServer())
    .post('/v1/categories')
    .set('x-tenant-id', tenantId)
    .send(categoryData);
};

/**
 * Helper function to update a category
 */
export const updateCategory = (
  app: INestApplication,
  categoryId: string | number,
  categoryData: Partial<CreateCategoryDto>,
  tenantId: string,
) => {
  return request(app.getHttpServer())
    .put(`/v1/categories/${categoryId}`)
    .set('x-tenant-id', tenantId)
    .send(categoryData);
};

/**
 * Helper function to delete a category
 */
export const deleteCategory = (
  app: INestApplication,
  categoryId: string | number,
  tenantId: string,
) => {
  return request(app.getHttpServer())
    .delete(`/v1/categories/${categoryId}`)
    .set('x-tenant-id', tenantId);
};

/**
 * Creates mock category data
 */
export const createMockCategory = (
  id: number = 1,
  name: string = 'Test Category',
  description: string = 'Test Description',
  tenantId: string = '10ebd848-f530-403e-90c2-cb597bab053e',
): Partial<Category> => {
  return {
    id,
    name,
    description,
    tenantId,
  };
};
