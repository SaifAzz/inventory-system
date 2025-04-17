import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../modules/auth/entities/user.entity';
import { Tenant } from '../modules/tenants/entities/tenant.entity';

@Injectable()
export class UserSeed {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  @Command({
    command: 'create:users',
    describe: 'Create sample users with tenant IDs',
  })
  async create() {
    console.log('Starting user seed...');

    try {
      // Get all available tenants
      console.log('Fetching tenants...');
      const tenants = await this.tenantRepository.find();
      console.log(`Found ${tenants.length} tenants`);

      if (tenants.length === 0) {
        console.log('No tenants found. Please run seed:tenants first.');
        return;
      }

      console.log('Tenant IDs:');
      tenants.forEach((tenant) => {
        console.log(`- ${tenant.id}: ${tenant.name} (${tenant.email})`);
      });

      const adminPassword = await bcrypt.hash('admin123', 10);
      const userPassword = await bcrypt.hash('user123', 10);

      // Create admin users for each tenant
      console.log('Creating admin users...');
      for (const tenant of tenants) {
        const adminEmail = `admin@${tenant.email.split('@')[0]}.com`;
        console.log(`Checking if admin exists: ${adminEmail}`);

        const existingAdmin = await this.userRepository.findOne({
          where: { email: adminEmail },
        });

        if (!existingAdmin) {
          console.log(`Creating admin for tenant ${tenant.name}`);
          const admin = this.userRepository.create({
            email: adminEmail,
            password: adminPassword,
            tenantId: tenant.id,
            roles: ['admin'],
          });
          await this.userRepository.save(admin);
          console.log(
            `Admin user created for tenant ${tenant.name}: ${adminEmail}`,
          );
        } else {
          console.log(`Admin user already exists for tenant ${tenant.name}`);
        }
      }

      // Create regular users for each tenant
      console.log('Creating regular users...');
      for (const tenant of tenants) {
        const userEmail = `user@${tenant.email.split('@')[0]}.com`;
        console.log(`Checking if user exists: ${userEmail}`);

        const existingUser = await this.userRepository.findOne({
          where: { email: userEmail },
        });

        if (!existingUser) {
          console.log(`Creating user for tenant ${tenant.name}`);
          const user = this.userRepository.create({
            email: userEmail,
            password: userPassword,
            tenantId: tenant.id,
            roles: ['user'],
          });
          await this.userRepository.save(user);
          console.log(
            `Regular user created for tenant ${tenant.name}: ${userEmail}`,
          );
        } else {
          console.log(`Regular user already exists for tenant ${tenant.name}`);
        }
      }

      // Create a multi-tenant user if there are at least 2 tenants
      if (tenants.length >= 2) {
        console.log('Creating multi-tenant user...');
        const multiTenantEmail = 'multitenant@example.com';
        const existingMultiTenant = await this.userRepository.findOne({
          where: { email: multiTenantEmail },
        });

        if (!existingMultiTenant) {
          console.log(
            `Creating multi-tenant user with default tenant ${tenants[0].name}`,
          );
          const multiTenantUser = this.userRepository.create({
            email: multiTenantEmail,
            password: userPassword,
            tenantId: tenants[0].id, // Assign the first tenant as default
            roles: ['user'],
          });
          await this.userRepository.save(multiTenantUser);
          console.log(
            `Multi-tenant user created with default tenant ${tenants[0].name}`,
          );
        } else {
          console.log('Multi-tenant user already exists');
        }
      }

      console.log('User seed completed.');
    } catch (error) {
      console.error('Error during user seed:', error);
    }
  }

  @Command({
    command: 'create:superadmin',
    describe: 'Create a super admin user with access to all tenants',
  })
  async createSuperAdmin() {
    console.log('Creating super admin...');

    try {
      const superAdminEmail = 'superadmin@system.com';
      const superAdminPassword = await bcrypt.hash('superadmin123', 10);

      const existingSuperAdmin = await this.userRepository.findOne({
        where: { email: superAdminEmail },
      });

      if (!existingSuperAdmin) {
        console.log(`Creating super admin: ${superAdminEmail}`);
        const superAdmin = this.userRepository.create({
          email: superAdminEmail,
          password: superAdminPassword,
          roles: ['superadmin', 'admin'],
        });
        await this.userRepository.save(superAdmin);
        console.log(`Super admin created: ${superAdminEmail}`);
      } else {
        console.log('Super admin already exists');
      }
    } catch (error) {
      console.error('Error creating super admin:', error);
    }
  }
}
