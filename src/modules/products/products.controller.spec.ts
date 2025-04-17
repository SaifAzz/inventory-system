import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TenantContextService } from '../../common/services/tenant-context.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;
  let tenantContextService: TenantContextService;
  const tenantId = '7272daf4-d2d8-4738-bc2a-a20dd5bf94c6';
  const productId = '1';
  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    search: jest.fn(),
  };

  const mockTenantContextService = {
    setTenantId: jest.fn(),
    getTenantId: jest.fn().mockReturnValue(tenantId),
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

    // Mock the request with tenant ID
    jest
      .spyOn(tenantContextService, 'setTenantId')
      .mockImplementation(() => {});
  });

  describe('create', () => {
    it('should create a product', async () => {
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

      // Set the tenant ID before the test
      tenantContextService.setTenantId(tenantId);

      const result = await controller.create(createDto);

      expect(tenantContextService.setTenantId).toHaveBeenCalledWith(tenantId);
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const pagination = { page: 1, perPage: 10 };
      const expectedResult = {
        data: [{ id: 1, name: 'Product 1' }],
        total: 1,
      };

      mockProductsService.findAll.mockResolvedValue(expectedResult);

      // Set the tenant ID before the test
      tenantContextService.setTenantId(tenantId);

      const result = await controller.findAll(pagination);

      expect(tenantContextService.setTenantId).toHaveBeenCalledWith(tenantId);
      expect(service.findAll).toHaveBeenCalledWith(pagination);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const expectedResult = { id: 1, name: 'Product 1' };

      mockProductsService.findOne.mockResolvedValue(expectedResult);

      // Set the tenant ID before the test
      tenantContextService.setTenantId(tenantId);

      const result = await controller.findOne(productId);

      expect(tenantContextService.setTenantId).toHaveBeenCalledWith(tenantId);
      expect(service.findOne).toHaveBeenCalledWith(+productId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateDto = { name: 'Updated Product' };
      const expectedResult = { id: 1, ...updateDto };

      mockProductsService.update.mockResolvedValue(expectedResult);

      // Set the tenant ID before the test
      tenantContextService.setTenantId(tenantId);

      const result = await controller.update(productId, updateDto);

      expect(tenantContextService.setTenantId).toHaveBeenCalledWith(tenantId);
      expect(service.update).toHaveBeenCalledWith(+productId, updateDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      // Set the tenant ID before the test
      tenantContextService.setTenantId(tenantId);

      await controller.remove(productId);

      expect(tenantContextService.setTenantId).toHaveBeenCalledWith(tenantId);
      expect(service.remove).toHaveBeenCalledWith(+productId);
    });
  });
});
