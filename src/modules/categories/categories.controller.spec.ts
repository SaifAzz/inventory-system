import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { TenantContextService } from '../../common/services/tenant-context.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;
  let tenantContextService: TenantContextService;

  const mockCategoriesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockTenantContextService = {
    setTenantId: jest.fn(),
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
  });

  describe('create', () => {
    it('should create a category', async () => {
      const tenantId = '10ebd848-f530-403e-90c2-cb597bab053e';
      const createDto = {
        name: 'Test Category',
        description: 'Test Description',
      };
      const expectedResult = { id: 1, ...createDto };

      mockCategoriesService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(tenantId, createDto);

      expect(tenantContextService.setTenantId).toHaveBeenCalledWith(tenantId);
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const tenantId = '10ebd848-f530-403e-90c2-cb597bab053e';
      const expectedResult = [
        { id: 1, name: 'Category 1' },
        { id: 2, name: 'Category 2' },
      ];

      mockCategoriesService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(tenantId);

      expect(tenantContextService.setTenantId).toHaveBeenCalledWith(tenantId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      const tenantId = '10ebd848-f530-403e-90c2-cb597bab053e';
      const categoryId = '2';
      const expectedResult = { id: 2, name: 'Category 1' };

      mockCategoriesService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(tenantId, categoryId);

      expect(tenantContextService.setTenantId).toHaveBeenCalledWith(tenantId);
      expect(service.findOne).toHaveBeenCalledWith(+categoryId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const tenantId = '10ebd848-f530-403e-90c2-cb597bab053e';
      const categoryId = '2';
      const updateDto = { name: 'Updated Category' };
      const expectedResult = { id: 2, ...updateDto };

      mockCategoriesService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(tenantId, categoryId, updateDto);

      expect(tenantContextService.setTenantId).toHaveBeenCalledWith(tenantId);
      expect(service.update).toHaveBeenCalledWith(+categoryId, updateDto);
      expect(result).toEqual(expectedResult);
    });
  });
});
