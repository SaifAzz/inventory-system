import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { TenantContextService } from '../../common/services/tenant-context.service';
import { PaginationParams } from '../../common/decorators/pagination.decorator';
import {
  SupplierNotFoundException,
  InvalidSupplierDataException,
} from '../../common/exceptions/supplier.exceptions';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    private readonly tenantContextService: TenantContextService,
  ) {}

  async create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    const tenantId = this.tenantContextService.getTenantId();

    const existingSupplier = await this.supplierRepository.findOne({
      where: { email: createSupplierDto.email, tenantId },
    });

    if (existingSupplier) {
      throw new InvalidSupplierDataException(
        `Supplier with email ${createSupplierDto.email} already exists`,
      );
    }

    const supplier = this.supplierRepository.create({
      ...createSupplierDto,
      tenantId,
    });
    return this.supplierRepository.save(supplier);
  }

  async findAll(
    pagination: PaginationParams,
  ): Promise<{ data: Supplier[]; total: number }> {
    const tenantId = this.tenantContextService.getTenantId();

    const [data, total] = await this.supplierRepository
      .createQueryBuilder('supplier')
      .leftJoinAndSelect('supplier.products', 'product')
      .where('supplier.tenantId = :tenantId AND supplier.deletedAt IS NULL', {
        tenantId,
      })
      .take(pagination.perPage)
      .skip((pagination.page - 1) * pagination.perPage)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: number): Promise<Supplier> {
    const tenantId = this.tenantContextService.getTenantId();

    const supplier = await this.supplierRepository
      .createQueryBuilder('supplier')
      .leftJoinAndSelect('supplier.products', 'product')
      .where(
        'supplier.id = :id AND supplier.tenantId = :tenantId AND supplier.deletedAt IS NULL',
        {
          id,
          tenantId,
        },
      )
      .getOne();

    if (!supplier) {
      throw new SupplierNotFoundException(id);
    }

    return supplier;
  }

  async update(
    id: number,
    updateSupplierDto: UpdateSupplierDto,
  ): Promise<Supplier> {
    const supplier = await this.findOne(id);
    const updated = this.supplierRepository.merge(supplier, updateSupplierDto);
    return this.supplierRepository.save(updated);
  }

  async findByIds(ids: number[]): Promise<Supplier[]> {
    const tenantId = this.tenantContextService.getTenantId();

    return this.supplierRepository.find({
      where: {
        id: In(ids),
        tenantId,
      },
    });
  }

  async remove(id: number): Promise<void> {
    await this.supplierRepository.delete(id);
  }
}
