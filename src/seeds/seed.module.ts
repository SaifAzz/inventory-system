import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSeed } from './user.seeds';
import { TenantSeed } from './tenant.seeds';
import { SupplierSeed } from './supplier.seeds';
import { CategorySeed } from './category.seeds';
import { User } from '../modules/auth/entities/user.entity';
import { Tenant } from '../modules/tenants/entities/tenant.entity';
import { Supplier } from '../modules/suppliers/entities/supplier.entity';
import { Category } from '../modules/categories/entities/category.entity';

@Module({
  imports: [CommandModule, TypeOrmModule.forFeature([User, Tenant, Supplier, Category])],
  providers: [UserSeed, TenantSeed, SupplierSeed, CategorySeed],
  exports: [UserSeed, TenantSeed, SupplierSeed, CategorySeed],
})
export class SeedModule {}
