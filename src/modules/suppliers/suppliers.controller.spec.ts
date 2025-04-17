import { Test, TestingModule } from '@nestjs/testing';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { TenantContextService } from '../../common/services/tenant-context.service';

describe('SuppliersController', () => {
  let controller: SuppliersController;
  let service: SuppliersService;
  let tenantContextService: TenantContextService;

  const mockSuppliersService = {
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
      controllers: [SuppliersController],
      providers: [
        {
          provide: SuppliersService,
          useValue: mockSuppliersService,
        },
        {
          provide: TenantContextService,
          useValue: mockTenantContextService,
        },
      ],
    }).compile();

    controller = module.get<SuppliersController>(SuppliersController);
    service = module.get<SuppliersService>(SuppliersService);
    tenantContextService =
      module.get<TenantContextService>(TenantContextService);
  });

  describe('create', () => {
    it('should create a supplier', async () => {
      const tenantId = 'test-tenant-id';
      const createDto = {
        name: 'Test Supplier',
        email: 'test@example.com',
        phone: '1234567890',
        address: 'Test Address',
      };
      const expectedResult = { id: 1, ...createDto };

      mockSuppliersService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(tenantContextService.setTenantId).toHaveBeenCalledWith(tenantId);
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all suppliers', async () => {
      const tenantId = 'test-tenant-id';
      const pagination = { page: 1, perPage: 10 };
      const expectedResult = {
        data: [{ id: 1, name: 'Supplier 1' }],
        total: 1,
      };

      mockSuppliersService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(pagination);

      expect(tenantContextService.setTenantId).toHaveBeenCalledWith(tenantId);
      expect(service.findAll).toHaveBeenCalledWith(pagination);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a supplier by id', async () => {
      const tenantId = 'test-tenant-id';
      const supplierId = '1';
      const expectedResult = { id: 1, name: 'Supplier 1' };

      mockSuppliersService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(supplierId);

      expect(tenantContextService.setTenantId).toHaveBeenCalledWith(tenantId);
      expect(service.findOne).toHaveBeenCalledWith(+supplierId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a supplier', async () => {
      const tenantId = 'test-tenant-id';
      const supplierId = '1';
      const updateDto = { name: 'Updated Supplier' };
      const expectedResult = { id: 1, ...updateDto };

      mockSuppliersService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(supplierId, updateDto);

      expect(tenantContextService.setTenantId).toHaveBeenCalledWith(tenantId);
      expect(service.update).toHaveBeenCalledWith(+supplierId, updateDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove a supplier', async () => {
      const tenantId = 'test-tenant-id';
      const supplierId = '1';

      await controller.remove(supplierId);

      expect(tenantContextService.setTenantId).toHaveBeenCalledWith(tenantId);
      expect(service.remove).toHaveBeenCalledWith(+supplierId);
    });
  });
});
