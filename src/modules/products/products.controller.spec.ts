import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TenantContextService } from '../../common/services/tenant-context.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;
  let tenantContextService: TenantContextService;

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockTenantContextService = {
    setTenantId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
        {
          provide: TenantContextService,
          useValue: mockTenantContextService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
    tenantContextService =
      module.get<TenantContextService>(TenantContextService);
  });

  describe('create', () => {
    it('should create a product', async () => {
      const tenantId = 'test-tenant-id';
      const createDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        quantity: 100,
        categoryId: 1,
        supplierIds: [1],
      };
      const expectedResult = { id: 1, ...createDto };

      mockProductsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(tenantContextService.setTenantId).toHaveBeenCalledWith(tenantId);
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const tenantId = 'test-tenant-id';
      const pagination = { page: 1, perPage: 10 };
      const expectedResult = {
        data: [{ id: 1, name: 'Product 1' }],
        total: 1,
      };

      mockProductsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(pagination);

      expect(tenantContextService.setTenantId).toHaveBeenCalledWith(tenantId);
      expect(service.findAll).toHaveBeenCalledWith(pagination);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const tenantId = 'test-tenant-id';
      const productId = '1';
      const expectedResult = { id: 1, name: 'Product 1' };

      mockProductsService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(productId);

      expect(tenantContextService.setTenantId).toHaveBeenCalledWith(tenantId);
      expect(service.findOne).toHaveBeenCalledWith(+productId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const tenantId = 'test-tenant-id';
      const productId = '1';
      const updateDto = { name: 'Updated Product' };
      const expectedResult = { id: 1, ...updateDto };

      mockProductsService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(productId, updateDto);

      expect(tenantContextService.setTenantId).toHaveBeenCalledWith(tenantId);
      expect(service.update).toHaveBeenCalledWith(+productId, updateDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      const tenantId = 'test-tenant-id';
      const productId = '1';

      await controller.remove(productId);

      expect(tenantContextService.setTenantId).toHaveBeenCalledWith(tenantId);
      expect(service.remove).toHaveBeenCalledWith(+productId);
    });
  });
});
