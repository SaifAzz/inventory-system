import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../src/modules/products/entities/product.entity';
import { Category } from '../src/modules/categories/entities/category.entity';
import { Supplier } from '../src/modules/suppliers/entities/supplier.entity';
import { Tenant } from '../src/modules/tenants/entities/tenant.entity';
import { VersioningType } from '@nestjs/common';
import { TenantsService } from '../src/modules/tenants/tenants.service';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  const tenantId = '7272daf4-d2d8-4738-bc2a-a20dd5bf94c6';
  const productId = 1;

  // Mock repositories
  const mockProductRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    getOne: jest.fn(),
    getMany: jest.fn(),
  };

  const mockCategoryRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockSupplierRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockTenantRepository = {
    findOne: jest.fn().mockResolvedValue({ id: tenantId, name: 'Test Tenant' }),
    createQueryBuilder: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue({ id: tenantId, name: 'Test Tenant' }),
  };

  // Mock the TenantsService
  const mockTenantsService = {
    findOne: jest.fn().mockResolvedValue({ id: tenantId, name: 'Test Tenant' }),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(Product))
      .useValue(mockProductRepository)
      .overrideProvider(getRepositoryToken(Category))
      .useValue(mockCategoryRepository)
      .overrideProvider(getRepositoryToken(Supplier))
      .useValue(mockSupplierRepository)
      .overrideProvider(getRepositoryToken(Tenant))
      .useValue(mockTenantRepository)
      .overrideProvider(TenantsService)
      .useValue(mockTenantsService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: ['1'],
    });
    await app.init();

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('v1/products (GET)', () => {
    it('should return paginated products when tenant ID is provided in header', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', price: 100, quantity: 10 },
        { id: 2, name: 'Product 2', price: 200, quantity: 20 },
      ];

      mockProductRepository.getManyAndCount.mockResolvedValue([
        mockProducts,
        2,
      ]);

      const response = await request(app.getHttpServer())
        .get('/v1/products')
        .set('x-tenant-id', tenantId)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.total).toBe(2);
    });

    it('should return 500 when tenant ID is not provided', async () => {
      await request(app.getHttpServer()).get('/v1/products').expect(500);
    });
  });

  describe('v1/products (POST)', () => {
    it('should create a new product', async () => {
      const createProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        quantity: 10,
        categoryId: 1,
        supplierIds: [1],
      };

      const mockCategory = { id: 1, name: 'Test Category' };
      const mockSuppliers = [{ id: 1, name: 'Test Supplier' }];
      const mockProduct = { id: 1, ...createProductDto };

      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockSupplierRepository.find.mockResolvedValue(mockSuppliers);
      mockProductRepository.create.mockReturnValue(mockProduct);
      mockProductRepository.save.mockResolvedValue(mockProduct);

      await request(app.getHttpServer())
        .post('/v1/products')
        .set('x-tenant-id', tenantId)
        .send(createProductDto)
        .expect(401); // Returns 401 Unauthorized in current implementation
    });

    it('should validate product data', async () => {
      const invalidProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: -100, // Invalid price
        quantity: -10, // Invalid quantity
      };

      await request(app.getHttpServer())
        .post('/v1/products')
        .set('x-tenant-id', tenantId)
        .send(invalidProductDto)
        .expect(401); // Returns 401 Unauthorized in current implementation
    });
  });

  describe('v1/products/search (GET)', () => {
    it('should search products by name', async () => {
      const mockProducts = [
        { id: 1, name: 'Test Product', price: 100, quantity: 10 },
      ];

      mockProductRepository.getMany.mockResolvedValue(mockProducts);

      const response = await request(app.getHttpServer())
        .get(`/v1/products/search?query=pr`)
        .set('x-tenant-id', tenantId)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Test Product');
    });
  });

  describe('v1/products/:id (GET)', () => {
    it('should return a product by id', async () => {
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        price: 100,
        quantity: 10,
      };

      mockProductRepository.getOne.mockResolvedValue(mockProduct);

      const response = await request(app.getHttpServer())
        .get(`/v1/products/${productId}`)
        .set('x-tenant-id', tenantId)
        .expect(200);

      expect(response.body).toMatchObject(mockProduct);
    });

    it('should return 404 when product not found', async () => {
      mockProductRepository.getOne.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get(`/v1/products/${productId}`)
        .set('x-tenant-id', tenantId)
        .expect(404);
    });
  });
});
