import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSeed } from './user.seeds';
import { TenantSeed } from './tenant.seeds';
import { User } from '../modules/auth/entities/user.entity';
import { Tenant } from '../modules/tenants/entities/tenant.entity';

@Module({
  imports: [CommandModule, TypeOrmModule.forFeature([User, Tenant])],
  providers: [UserSeed, TenantSeed],
  exports: [UserSeed, TenantSeed],
})
export class SeedModule {}
