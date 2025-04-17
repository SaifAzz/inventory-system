import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { CategoriesService } from '../categories/categories.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { TenantContextService } from '../../common/services/tenant-context.service';

import {
  PaginationParams,
  PaginatedResponse,
} from '../../common/decorators/pagination.decorator';

import {
  ProductNotFoundException,
  CategoryNotFoundException,
  SuppliersNotFoundException,
} from '../../common/exceptions/product.exceptions';

@Injectable({ scope: Scope.REQUEST })
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly categoriesService: CategoriesService,
    private readonly suppliersService: SuppliersService,
    private readonly tenantContext: TenantContextService,
  ) {}

  private get tenantId(): string {
    return this.tenantContext.getTenantId();
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const category = await this.categoriesService.findOne(dto.categoryId);
    if (!category) throw new CategoryNotFoundException();

    const suppliers = await this.suppliersService.findByIds(dto.supplierIds);
    if (suppliers.length !== dto.supplierIds.length) {
      throw new SuppliersNotFoundException();
    }
    const product = this.productRepository.create({
      ...dto,
      tenantId: this.tenantId,
      categoryId: dto.categoryId,
      suppliers,
    });

    return this.productRepository.save(product);
  }

  async findAll(
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<Product>> {
    const tenantId = this.tenantContext.getTenantId();

    const [data, total] = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.suppliers', 'supplier')
      .where('product.tenantId = :tenantId AND product.deletedAt IS NULL', {
        tenantId,
      })
      .take(pagination.perPage)
      .skip((pagination.page - 1) * pagination.perPage)
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page: pagination.page,
        perPage: pagination.perPage,
        totalPages: Math.ceil(total / pagination.perPage),
      },
    };
  }

  async findOne(id: number): Promise<Product> {
    const tenantId = this.tenantContext.getTenantId();

    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.suppliers', 'supplier')
      .where(
        'product.id = :id AND product.tenantId = :tenantId AND product.deletedAt IS NULL',
        {
          id,
          tenantId,
        },
      )
      .getOne();

    if (!product) throw new ProductNotFoundException(id);

    return product;
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (dto.categoryId) {
      const category = await this.categoriesService.findOne(dto.categoryId);
      if (!category) throw new CategoryNotFoundException();
      product.categoryId = dto.categoryId;
    }

    if (dto.supplierIds) {
      const suppliers = await this.suppliersService.findByIds(dto.supplierIds);
      if (suppliers.length !== dto.supplierIds.length) {
        throw new SuppliersNotFoundException();
      }
      product.suppliers = suppliers;
    }

    Object.assign(product, dto);
    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.productRepository.softDelete(id);
  }

  async search(query: string): Promise<Product[]> {
    try {
      const tenantId = this.tenantContext.getTenantId();
      return this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.category', 'category')
        .leftJoinAndSelect('product.suppliers', 'supplier')
        .where(
          '(product.name ILIKE :query OR product.description ILIKE :query) AND product.tenantId = :tenantId AND product.deletedAt IS NULL',
          {
            query: `%${query}%`,
            tenantId,
          },
        )
        .getMany();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async calculateTotalInventoryValue(): Promise<{ totalValue: number }> {
    const tenantId = this.tenantContext.getTenantId();

    const { totalValue } = await this.productRepository
      .createQueryBuilder('product')
      .select('SUM(product.price * product.quantity)', 'totalValue')
      .where('product.tenantId = :tenantId AND product.deletedAt IS NULL', {
        tenantId,
      })
      .getRawOne();

    return { totalValue: parseFloat(totalValue) || 0 };
  }
}
