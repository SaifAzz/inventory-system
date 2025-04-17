import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../modules/categories/entities/category.entity';
import { Tenant } from '../modules/tenants/entities/tenant.entity';

@Injectable()
export class CategorySeed {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  @Command({
    command: 'create:categories',
    describe: 'Create sample categories for each tenant',
  })
  async create() {
    console.log('Starting category seed...');

    try {
      // Get all available tenants
      console.log('Fetching tenants...');
      const tenants = await this.tenantRepository.find();
      console.log(`Found ${tenants.length} tenants`);

      if (tenants.length === 0) {
        console.log('No tenants found. Please run seed:tenants first.');
        return;
      }

      // Create sample categories for each tenant
      for (const tenant of tenants) {
        console.log(
          `Creating categories for tenant: ${tenant.name} (${tenant.id})`,
        );

        const categoryData = [
          {
            id: 1,
            name: 'Electronics',
            description: 'Electronic devices and components',
            tenantId: tenant.id,
          },
          {
            id: 2,
            name: 'Office Supplies',
            description: 'Supplies and materials for office use',
            tenantId: tenant.id,
          },
          {
            id: 3,
            name: 'Furniture',
            description: 'Office and home furniture items',
            tenantId: tenant.id,
          },
          {
            id: 4,
            name: 'Software',
            description: 'Software licenses and digital products',
            tenantId: tenant.id,
          },
          {
            id: 5,
            name: 'Networking',
            description: 'Networking equipment and accessories',
            tenantId: tenant.id,
          },
          {
            id: 6,
            name: 'Storage',
            description: 'Storage devices and solutions',
            tenantId: tenant.id,
          },
        ];

        // Create each category if it doesn't already exist
        for (const data of categoryData) {
          const existingCategory = await this.categoryRepository.findOne({
            where: { name: data.name, tenantId: tenant.id },
          });

          if (!existingCategory) {
            console.log(`Creating category: ${data.name}`);
            const category = this.categoryRepository.create(data);
            await this.categoryRepository.save(category);
            console.log(`Category created: ${data.name}`);
          } else {
            console.log(`Category already exists: ${data.name}`);
          }
        }
      }

      console.log('Category seed completed.');
    } catch (error) {
      console.error('Error during category seed:', error);
    }
  }
}
