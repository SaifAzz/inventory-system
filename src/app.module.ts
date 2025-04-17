import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './modules/products/products.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TenantsModule } from './modules/tenants/tenants.module';

import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { TenantContextService } from './common/services/tenant-context.service';
import { TenantsService } from './modules/tenants/tenants.service';
import { Tenant } from './modules/tenants/entities/tenant.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Tenant]),
    ProductsModule,
    SuppliersModule,
    CategoriesModule,
    TenantsModule,
  ],
  providers: [TenantContextService, TenantsService, TenantMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).exclude('v1/tenants').forRoutes('*');
  }
}
