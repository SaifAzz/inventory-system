import { Test, TestingModule } from '@nestjs/testing';
import { TenantContextService } from './tenant-context.service';

describe('TenantContextService', () => {
  let service: TenantContextService;
  const testTenantId = 'test-tenant-id';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantContextService],
    }).compile();

    service = module.get<TenantContextService>(TenantContextService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should set and get tenant ID correctly', () => {
    service.setTenantId(testTenantId);
    expect(service.getTenantId()).toBe(testTenantId);
  });

  it('should throw error when tenant context is not set', () => {
    // Clear any existing context first
    service.clearTenantContext();
    
    // We need to set up a new service instance after clearing context
    service = new TenantContextService();
    
    expect(() => {
      service.getTenantId();
    }).toThrow('Tenant context is not set');
  });

  it('should run function with tenant context', async () => {
    const result = await service.runWithTenant(testTenantId, async () => {
      expect(service.getTenantId()).toBe(testTenantId);
      return 'success';
    });

    expect(result).toBe('success');
  });

  it('should clear tenant context', () => {
    service.setTenantId(testTenantId);
    expect(service.getTenantId()).toBe(testTenantId);
    
    service.clearTenantContext();
    
    // We need to set up a new service instance after clearing context
    service = new TenantContextService();
    
    expect(() => {
      service.getTenantId();
    }).toThrow('Tenant context is not set');
  });
}); 