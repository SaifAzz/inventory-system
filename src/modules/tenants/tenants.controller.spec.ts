import { Test, TestingModule } from '@nestjs/testing';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

describe('TenantsController', () => {
  let controller: TenantsController;
  let service: TenantsService;

  const mockTenantsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantsController],
      providers: [
        {
          provide: TenantsService,
          useValue: mockTenantsService,
        },
      ],
    }).compile();

    controller = module.get<TenantsController>(TenantsController);
    service = module.get<TenantsService>(TenantsService);
  });

  describe('create', () => {
    it('should create a tenant', async () => {
      const createDto = {
        name: 'Test Tenant',
        email: 'test@example.com',
        phone: '1234567890',
        address: 'Test Address',
        domain: 'test.com',
      };
      const expectedResult = { id: 1, ...createDto };

      mockTenantsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all tenants', async () => {
      const expectedResult = [
        { id: 1, name: 'Tenant 1' },
        { id: 2, name: 'Tenant 2' },
      ];

      mockTenantsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a tenant by id', async () => {
      const tenantId = '1';
      const expectedResult = { id: 1, name: 'Tenant 1' };

      mockTenantsService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(tenantId);

      expect(service.findOne).toHaveBeenCalledWith(tenantId);
      expect(result).toEqual(expectedResult);
    });
  });
});
