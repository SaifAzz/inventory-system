import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { randomUUID } from 'crypto';
import {
  InvalidTenantException,
  TenantIdNotFoundException,
  InvalidTenantIdFormatException,
} from '../../common/exceptions/tenant.exceptions';

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
    try {
      const tenant = await this.tenantRepository
        .createQueryBuilder('tenant')
        .where('tenant.id = :id AND tenant.deletedAt IS NULL', { id })
        .getOne();

      if (!tenant) {
        throw new TenantIdNotFoundException();
      }

      return tenant;
    } catch (error: any) {
      if (error instanceof TenantIdNotFoundException) {
        throw error;
      }

      if (
        error.message &&
        typeof error.message === 'string' &&
        error.message.includes('invalid input syntax for type uuid')
      ) {
        throw new InvalidTenantIdFormatException(id);
      }

      throw error;
    }
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const existingTenant = await this.findOne(id);
    const updated = this.tenantRepository.merge(
      existingTenant,
      updateTenantDto,
    );
    return this.tenantRepository.save(updated);
  }

  async validateTenant(tenantId: string): Promise<Tenant> {
    try {
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
    } catch (error: any) {
      if (error instanceof InvalidTenantException) {
        throw error;
      }

      if (
        error.message &&
        typeof error.message === 'string' &&
        error.message.includes('invalid input syntax for type uuid')
      ) {
        throw new InvalidTenantIdFormatException(tenantId);
      }

      throw error;
    }
  }
}
