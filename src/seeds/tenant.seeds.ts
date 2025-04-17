import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../modules/tenants/entities/tenant.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TenantSeed {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  @Command({
    command: 'create:tenants',
    describe: 'Create sample tenants',
  })
  async create() {
    console.log('Starting tenant creation...');

    try {
      // Check if we can find any existing tenants
      const existingCount = await this.tenantRepository.count();
      console.log(`Found ${existingCount} existing tenants`);

      const tenants = [
        {
          id: 'd3af41b2-3fa1-425b-9dd4-bdsce83c008bc',
          name: 'Tenant One',
          email: 'tenant1@example.com',
          phone: '555-123-4567',
          address: '123 Main St, City 1',
          apiKey: uuidv4(),
        },
        {
          id: 'd3af41b2-3fa1-425b-9dd4-bdce83c008ba',
          name: 'Tenant Two',
          email: 'tenant2@example.com',
          phone: '555-234-5678',
          address: '456 Oak Ave, City 2',
          apiKey: uuidv4(),
        },
        {
          id: 'd3af41b2-3fa1-425b-9dd4-bdce83c008bc',
          name: 'Tenant Three',
          email: 'tenant3@example.com',
          phone: '555-345-6789',
          address: '789 Pine Blvd, City 3',
          apiKey: uuidv4(),
        },
      ];

      console.log(`Attempting to create ${tenants.length} tenants...`);

      for (const tenantData of tenants) {
        console.log(`Checking if tenant exists: ${tenantData.email}`);
        const existingTenant = await this.tenantRepository.findOne({
          where: { email: tenantData.email },
        });

        if (!existingTenant) {
          console.log(`Creating new tenant: ${tenantData.name}`);
          const tenant = this.tenantRepository.create(tenantData);
          const savedTenant = await this.tenantRepository.save(tenant);
          console.log(
            `Tenant created: ${savedTenant.name} (${savedTenant.id})`,
          );
        } else {
          console.log(`Tenant already exists: ${tenantData.email}`);
        }
      }

      // Verify tenants were created
      const finalCount = await this.tenantRepository.count();
      console.log(`Final tenant count: ${finalCount}`);

      console.log('Tenant seed completed');
    } catch (error) {
      console.error('Error during tenant seed:', error);
    }
  }
}
