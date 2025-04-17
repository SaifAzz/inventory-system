import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../modules/suppliers/entities/supplier.entity';
import { Tenant } from '../modules/tenants/entities/tenant.entity';

@Injectable()
export class SupplierSeed {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  @Command({
    command: 'create:suppliers',
    describe: 'Create sample suppliers for each tenant',
  })
  async create() {
    console.log('Starting supplier seed...');

    try {
      // Get all available tenants
      console.log('Fetching tenants...');
      const tenants = await this.tenantRepository.find();
      console.log(`Found ${tenants.length} tenants`);

      if (tenants.length === 0) {
        console.log('No tenants found. Please run seed:tenants first.');
        return;
      }

      // Create sample suppliers for each tenant
      for (const tenant of tenants) {
        console.log(
          `Creating suppliers for tenant: ${tenant.name} (${tenant.id})`,
        );

        const supplierData = [
          {
            id: 1,
            name: 'Tech Components Inc.',
            email: `tech@${tenant.email.split('@')[0]}.com`,
            phone: '555-123-4567',
            tenantId: tenant.id,
          },
          {
            id: 2,
            name: 'Global Electronics',
            email: `global@${tenant.email.split('@')[0]}.com`,
            phone: '555-234-5678',
            tenantId: tenant.id,
          },
          {
            id: 3,
            name: 'Office Supplies Co.',
            email: `office@${tenant.email.split('@')[0]}.com`,
            phone: '555-345-6789',
            tenantId: tenant.id,
          },
          {
            id: 4,
            name: 'Hardware Solutions',
            email: `hardware@${tenant.email.split('@')[0]}.com`,
            phone: '555-456-7890',
            tenantId: tenant.id,
          },
          {
            id: 5,
            name: 'Digital Innovations',
            email: `digital@${tenant.email.split('@')[0]}.com`,
            phone: '555-567-8901',
            tenantId: tenant.id,
          },
        ];

        // Create each supplier if it doesn't already exist
        for (const data of supplierData) {
          const existingSupplier = await this.supplierRepository.findOne({
            where: { email: data.email, tenantId: tenant.id },
          });

          if (!existingSupplier) {
            console.log(`Creating supplier: ${data.name}`);
            const supplier = this.supplierRepository.create(data);
            await this.supplierRepository.save(supplier);
            console.log(`Supplier created: ${data.name}`);
          } else {
            console.log(`Supplier already exists: ${data.email}`);
          }
        }
      }

      console.log('Supplier seed completed.');
    } catch (error) {
      console.error('Error during supplier seed:', error);
    }
  }
}
