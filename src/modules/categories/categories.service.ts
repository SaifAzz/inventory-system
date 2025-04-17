import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { TenantContextService } from '../../common/services/tenant-context.service';
import {
  CategoryNotFoundException,
  CategoryAccessDeniedException,
} from '../../common/exceptions/category.exceptions';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly tenantContextService: TenantContextService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const tenantId = this.tenantContextService.getTenantId();
    const category = this.categoryRepository.create({
      ...createCategoryDto,
      tenantId,
    });
    return this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    const tenantId = this.tenantContextService.getTenantId();
    return this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.products', 'product')
      .where('category.tenantId = :tenantId', { tenantId })
      .orderBy('category.name', 'ASC')
      .getMany();
  }

  async findOne(id: number): Promise<Category> {
    const tenantId = this.tenantContextService.getTenantId();

    const category = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.products', 'product')
      .where('category.id = :id AND category.tenantId = :tenantId', {
        id,
        tenantId,
      })
      .getOne();

    if (!category) {
      throw new CategoryNotFoundException(id);
    }

    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const tenantId = this.tenantContextService.getTenantId();
    const category = await this.findOne(id);

    if (category.tenantId !== tenantId) {
      throw new CategoryAccessDeniedException(id);
    }

    const updated = this.categoryRepository.merge(category, updateCategoryDto);
    return this.categoryRepository.save(updated);
  }

  async findByIds(ids: number[]): Promise<Category[]> {
    const tenantId = this.tenantContextService.getTenantId();

    return this.categoryRepository.find({
      where: {
        id: In(ids),
        tenantId,
      },
    });
  }
}
