import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Tenant } from '../modules/tenants/entities/tenant.entity';
import { Product } from '../modules/products/entities/product.entity';
import { Category } from '../modules/categories/entities/category.entity';
import { Supplier } from '../modules/suppliers/entities/supplier.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Tenant, Product, Category, Supplier],
  synchronize: process.env.NODE_ENV !== 'production',
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  logging:
    process.env.NODE_ENV !== 'production' ? ['error', 'warn'] : ['error'],
  autoLoadEntities: true,
  migrations: ['dist/migrations/*.js'],
  migrationsRun: true,
};
