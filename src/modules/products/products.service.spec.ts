import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CategoriesService } from '../categories/categories.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { TenantContextService } from '../../common/services/tenant-context.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category } from '../categories/entities/category.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { Tenant } from '../tenants/entities/tenant.entity';

describe('ProductsService', () => {
  let module: TestingModule;
  let service: ProductsService;
  let productRepository: Repository<Product>;
  let categoriesService: CategoriesService;
  let suppliersService: SuppliersService;
  let tenantContextService: TenantContextService;

  const tenantId = 'test-tenant-id';
  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    getOne: jest.fn(),
    getMany: jest.fn(),
    select: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };

  const mockTenant = { id: tenantId, name: 'Test Tenant' } as Tenant;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          },
        },
        {
          provide: CategoriesService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: SuppliersService,
          useValue: {
            findByIds: jest.fn(),
          },
        },
        {
          provide: TenantContextService,
          useValue: {
            getTenantId: jest.fn().mockReturnValue(tenantId),
          },
        },
      ],
    }).compile();

    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    categoriesService = module.get<CategoriesService>(CategoriesService);
    suppliersService = module.get<SuppliersService>(SuppliersService);
    tenantContextService =
      module.get<TenantContextService>(TenantContextService);
  });

  beforeEach(async () => {
    // Get a new instance of ProductsService for each test
    service = await module.resolve(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        quantity: 10,
        categoryId: 1,
        supplierIds: [1],
      };

      const category: Category = {
        id: 1,
        name: 'Test Category',
        description: 'Description',
        tenantId,
        products: [],
        tenant: mockTenant,
        deletedAt: undefined,
      };

      const suppliers: Supplier[] = [
        {
          id: 1,
          name: 'Test Supplier',
          email: 'supplier@test.com',
          phone: '1234567890',
          tenantId,
          products: [],
          tenant: mockTenant,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const expectedProduct = {
        id: 1,
        ...createProductDto,
        tenantId,
        categoryId: 1,
        suppliers,
      };

      jest.spyOn(categoriesService, 'findOne').mockResolvedValue(category);
      jest.spyOn(suppliersService, 'findByIds').mockResolvedValue(suppliers);
      jest
        .spyOn(productRepository, 'create')
        .mockReturnValue(expectedProduct as any);
      jest
        .spyOn(productRepository, 'save')
        .mockResolvedValue(expectedProduct as any);

      expect(await service.create(createProductDto)).toEqual(expectedProduct);
      expect(categoriesService.findOne).toHaveBeenCalledWith(1);
      expect(suppliersService.findByIds).toHaveBeenCalledWith([1]);
      expect(productRepository.create).toHaveBeenCalledWith({
        ...createProductDto,
        tenantId,
        categoryId: 1,
        suppliers,
      });
      expect(productRepository.save).toHaveBeenCalledWith(expectedProduct);
    });

    it('should throw error if category not found', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        quantity: 10,
        categoryId: 999,
        supplierIds: [1],
      };

      jest.spyOn(categoriesService, 'findOne').mockResolvedValue(null as any);

      await expect(service.create(createProductDto)).rejects.toThrow();
      expect(categoriesService.findOne).toHaveBeenCalledWith(999);
    });

    it('should throw error if suppliers not found', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        quantity: 10,
        categoryId: 1,
        supplierIds: [999],
      };

      const category: Category = {
        id: 1,
        name: 'Test Category',
        description: 'Description',
        tenantId,
        products: [],
        tenant: mockTenant,
        deletedAt: undefined,
      };

      jest.spyOn(categoriesService, 'findOne').mockResolvedValue(category);
      jest.spyOn(suppliersService, 'findByIds').mockResolvedValue([]);

      await expect(service.create(createProductDto)).rejects.toThrow();
      expect(categoriesService.findOne).toHaveBeenCalledWith(1);
      expect(suppliersService.findByIds).toHaveBeenCalledWith([999]);
    });
  });

  describe('findAll', () => {
    it('should return products with pagination', async () => {
      const pagination = { page: 1, perPage: 10 };
      const products = [
        { id: 1, name: 'Product 1' },
        { id: 2, name: 'Product 2' },
      ];
      const totalProducts = 2;

      mockQueryBuilder.getManyAndCount.mockResolvedValue([
        products,
        totalProducts,
      ]);

      const result = await service.findAll(pagination);

      expect(result.data).toEqual(products);
      expect(result.meta.total).toEqual(totalProducts);
      expect(result.meta.page).toEqual(pagination.page);
      expect(result.meta.perPage).toEqual(pagination.perPage);
      expect(result.meta.totalPages).toEqual(
        Math.ceil(totalProducts / pagination.perPage),
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'product.tenantId = :tenantId AND product.deletedAt IS NULL',
        { tenantId },
      );
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const product = { id: 1, name: 'Test Product' };
      mockQueryBuilder.getOne.mockResolvedValue(product);

      expect(await service.findOne(1)).toEqual(product);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'product.id = :id AND product.tenantId = :tenantId AND product.deletedAt IS NULL',
        { id: 1, tenantId },
      );
    });

    it('should throw error if product not found', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'product.id = :id AND product.tenantId = :tenantId AND product.deletedAt IS NULL',
        { id: 999, tenantId },
      );
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product',
      };
      const existingProduct = {
        id: 1,
        name: 'Test Product',
        categoryId: 1,
        suppliers: [{ id: 1 }],
      };
      const updatedProduct = {
        ...existingProduct,
        ...updateProductDto,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(existingProduct as any);
      jest
        .spyOn(productRepository, 'save')
        .mockResolvedValue(updatedProduct as any);

      expect(await service.update(1, updateProductDto)).toEqual(updatedProduct);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(productRepository.save).toHaveBeenCalledWith({
        ...existingProduct,
        ...updateProductDto,
      });
    });
  });

  describe('calculateTotalInventoryValue', () => {
    it('should calculate the total inventory value', async () => {
      const totalValue = 5000;
      mockQueryBuilder.getRawOne.mockResolvedValue({ totalValue });

      const result = await service.calculateTotalInventoryValue();

      expect(result).toEqual({ totalValue });
      expect(mockQueryBuilder.select).toHaveBeenCalledWith(
        'SUM(product.price * product.quantity)',
        'totalValue',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'product.tenantId = :tenantId AND product.deletedAt IS NULL',
        { tenantId },
      );
    });

    it('should return 0 if no products found', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValue({ totalValue: null });

      const result = await service.calculateTotalInventoryValue();

      expect(result).toEqual({ totalValue: 0 });
    });
  });
});
