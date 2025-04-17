import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { TenantContextService } from '../../common/services/tenant-context.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;
  let tenantContextService: TenantContextService;
  const tenantId = '10ebd848-f530-403e-90c2-cb597bab053e';
  const categoryId = '2';

  const mockCategoriesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockTenantContextService = {
    setTenantId: jest.fn(),
    getTenantId: jest.fn().mockReturnValue(tenantId),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
        {
          provide: TenantContextService,
          useValue: mockTenantContextService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
    tenantContextService =
      module.get<TenantContextService>(TenantContextService);

    // Mock the request with tenant ID
    jest
      .spyOn(tenantContextService, 'setTenantId')
      .mockImplementation(() => {});
  });

  describe('create', () => {
    it('should create a category', async () => {
      const createDto = {
        name: 'Test Category',
        description: 'Test Description',
      };
      const expectedResult = { id: 1, ...createDto };

      mockCategoriesService.create.mockResolvedValue(expectedResult);

      // Set the tenant ID before the test
      tenantContextService.setTenantId(tenantId);

      const result = await controller.create(createDto);

      expect(tenantContextService.setTenantId).toHaveBeenCalledWith(tenantId);
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const expectedResult = [
        { id: 1, name: 'Category 1' },
        { id: 2, name: 'Category 2' },
      ];

      mockCategoriesService.findAll.mockResolvedValue(expectedResult);

      // Set the tenant ID before the test
      tenantContextService.setTenantId(tenantId);

      const result = await controller.findAll();

      expect(tenantContextService.setTenantId).toHaveBeenCalledWith(tenantId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      const expectedResult = { id: 2, name: 'Category 1' };

      mockCategoriesService.findOne.mockResolvedValue(expectedResult);

      // Set the tenant ID before the test
      tenantContextService.setTenantId(tenantId);

      const result = await controller.findOne(categoryId);

      expect(tenantContextService.setTenantId).toHaveBeenCalledWith(tenantId);
      expect(service.findOne).toHaveBeenCalledWith(+categoryId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updateDto = { name: 'Updated Category' };
      const expectedResult = { id: 2, ...updateDto };

      mockCategoriesService.update.mockResolvedValue(expectedResult);

      // Set the tenant ID before the test
      tenantContextService.setTenantId(tenantId);

      const result = await controller.update(categoryId, updateDto);

      expect(tenantContextService.setTenantId).toHaveBeenCalledWith(tenantId);
      expect(service.update).toHaveBeenCalledWith(+categoryId, updateDto);
      expect(result).toEqual(expectedResult);
    });
  });
});
