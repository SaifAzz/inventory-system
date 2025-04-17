import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { Category } from '../categories/entities/category.entity';
import { TenantsModule } from '../tenants/tenants.module';
import { ProductsService } from './products.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { CategoriesService } from '../categories/categories.service';
import { ProductsController } from './products.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Supplier, Category]),
    TenantsModule,
  ],
  providers: [ProductsService, SuppliersService, CategoriesService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
