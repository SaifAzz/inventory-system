import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tenant } from '../src/modules/tenants/entities/tenant.entity';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { VersioningType } from '@nestjs/common';
import { AuthService } from '../src/modules/auth/auth.service';
import { TenantContextService } from '../src/common/services/tenant-context.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { createMockRepository } from './helpers/createMockRepository';
import { JwtStrategy } from '../src/modules/auth/strategies/jwt.strategy';
describe('TenantsController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  const mockTenantRepository = createMockRepository();
  const mockQueryBuilder = mockTenantRepository.createQueryBuilder();

  // Mock JWT Service
  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock.jwt.token'),
    verify: jest.fn().mockReturnValue({
      sub: 'test-user-id',
      email: 'test@example.com',
      tenantId: 'tenant-1',
      roles: ['admin'],
    }),
  };

  // Mock Auth Service
  const mockAuthService = {
    validateUser: jest.fn().mockResolvedValue({
      id: 'test-user-id',
      email: 'test@example.com',
      tenantId: 'tenant-1',
      roles: ['admin'],
    }),
    login: jest.fn().mockResolvedValue({
      access_token: 'mock.jwt.token',
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        roles: ['admin'],
        tenantId: 'tenant-1',
      },
    }),
  };

  // Mock Tenant Context Service
  const mockTenantContextService = {
    getTenantId: jest.fn().mockReturnValue('tenant-1'),
    setTenantId: jest.fn(),
  };

  // Mock JWT Auth Guard
  const mockJwtAuthGuard = {
    canActivate: jest.fn((context) => {
      const req = context.switchToHttp().getRequest();
      const authHeader = req.headers['authorization'];

      if (!authHeader) {
        return false; // No token => Unauthorized
      }
      return true; // Token exists => Authorized
    }),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(Tenant))
      .useValue(mockTenantRepository)
      .overrideProvider(JwtService)
      .useValue(mockJwtService)
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .overrideProvider(TenantContextService)
      .useValue(mockTenantContextService)
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideProvider(JwtStrategy) // <--- ADD THIS
      .useValue({
        validate: jest.fn().mockResolvedValue({
          id: 'test-user-id',
          email: 'test@example.com',
          tenantId: 'tenant-1',
          roles: ['admin'],
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: ['1'],
    });
    await app.init();

    jwtToken = mockJwtService.sign();

    jest.clearAllMocks(); // reset mocks
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/v1/tenants (GET)', () => {
    it('should return all tenants', async () => {
      const tenants = [
        { id: 'tenant-1', name: 'Tenant One' },
        { id: 'tenant-2', name: 'Tenant Two' },
      ];
      mockQueryBuilder.getMany.mockResolvedValue(tenants);

      const response = await request(app.getHttpServer())
        .get('/v1/tenants')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return 403 without token', async () => {
      await request(app.getHttpServer()).get('/v1/tenants').expect(403);
    });
  });

  describe('/v1/tenants/:id (GET)', () => {
    it('should return tenant by id', async () => {
      const tenant = { id: 'tenant-1', name: 'Tenant One' };
      mockQueryBuilder.getOne.mockResolvedValue(tenant);

      const response = await request(app.getHttpServer())
        .get('/v1/tenants/tenant-1')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toMatchObject(tenant);
    });

    it('should return 404 if tenant not found', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/v1/tenants/non-existent')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404);
    });
  });
});
