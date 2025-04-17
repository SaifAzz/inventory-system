import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { randomUUID } from 'crypto';
import {
  TenantNotFoundException,
  InvalidTenantException,
  TenantDeletionException,
} from './exceptions/tenant.exceptions';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const tenant = this.tenantRepository.create({
      ...createTenantDto,
      apiKey: randomUUID(),
      isActive: true,
    });

    return this.tenantRepository.save(tenant);
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository
      .createQueryBuilder('tenant')
      .where('tenant.deletedAt IS NULL')
      .getMany();
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository
      .createQueryBuilder('tenant')
      .where('tenant.id = :id AND tenant.deletedAt IS NULL', { id })
      .getOne();

    if (!tenant) {
      throw new TenantNotFoundException(id);
    }

    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const existingTenant = await this.findOne(id);
    const updated = this.tenantRepository.merge(
      existingTenant,
      updateTenantDto,
    );
    return this.tenantRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    try {
      await this.findOne(id);
      await this.tenantRepository.softDelete(id);
    } catch (error) {
      if (error instanceof TenantNotFoundException) {
        throw error;
      }
      throw new TenantDeletionException(id);
    }
  }

  async validateTenant(tenantId: string): Promise<Tenant> {
    const tenant = await this.tenantRepository
      .createQueryBuilder('tenant')
      .where(
        'tenant.id = :tenantId AND tenant.isActive = true AND tenant.deletedAt IS NULL',
        { tenantId },
      )
      .getOne();

    if (!tenant) {
      throw new InvalidTenantException();
    }

    return tenant;
  }
}
