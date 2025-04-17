import { Test, TestingModule } from '@nestjs/testing';
import { TenantInterceptor } from './tenant.Interceptor';
import { TenantContextService } from '../services/tenant-context.service';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('TenantInterceptor', () => {
  let interceptor: TenantInterceptor;
  let tenantContextService: TenantContextService;

  const mockTenantContextService = {
    setTenantId: jest.fn(),
    getTenantId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantInterceptor,
        {
          provide: TenantContextService,
          useValue: mockTenantContextService,
        },
      ],
    }).compile();

    interceptor = module.get<TenantInterceptor>(TenantInterceptor);
    tenantContextService = module.get<TenantContextService>(TenantContextService);
    
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should set tenant ID from header', () => {
      const tenantId = 'test-tenant-id';
      const context = createMockExecutionContext({
        headers: { 'x-tenant-id': tenantId },
        query: {},
        body: {},
      });
      const handler = createMockCallHandler();

      interceptor.intercept(context, handler);

      expect(tenantContextService.setTenantId).toHaveBeenCalledWith(tenantId);
      expect(context.switchToHttp().getRequest().tenantId).toBe(tenantId);
    });

    it('should set tenant ID from query params', () => {
      const tenantId = 'test-tenant-id';
      const context = createMockExecutionContext({
        headers: {},
        query: { tenantId },
        body: {},
      });
      const handler = createMockCallHandler();

      interceptor.intercept(context, handler);

      expect(tenantContextService.setTenantId).toHaveBeenCalledWith(tenantId);
      expect(context.switchToHttp().getRequest().tenantId).toBe(tenantId);
    });

    it('should set tenant ID from request body', () => {
      const tenantId = 'test-tenant-id';
      const context = createMockExecutionContext({
        headers: {},
        query: {},
        body: { tenantId },
      });
      const handler = createMockCallHandler();

      interceptor.intercept(context, handler);

      expect(tenantContextService.setTenantId).toHaveBeenCalledWith(tenantId);
      expect(context.switchToHttp().getRequest().tenantId).toBe(tenantId);
    });

    it('should throw error when tenant ID is not provided', () => {
      const context = createMockExecutionContext({
        headers: {},
        query: {},
        body: {},
      });
      const handler = createMockCallHandler();

      expect(() => {
        interceptor.intercept(context, handler);
      }).toThrow('Tenant ID is required');
    });

    it('should call next handler and return its result', () => {
      const tenantId = 'test-tenant-id';
      const context = createMockExecutionContext({
        headers: { 'x-tenant-id': tenantId },
        query: {},
        body: {},
      });
      const result = { data: 'test-data' };
      const handler = createMockCallHandler(result);

      const observable = interceptor.intercept(context, handler);
      
      let actualResult;
      observable.subscribe(data => {
        actualResult = data;
      });
      
      expect(actualResult).toEqual(result);
    });
  });
});

function createMockExecutionContext(request: any = {}): ExecutionContext {
  // Ensure request has headers, query, and body properties with defaults
  const defaultRequest = {
    headers: {},
    query: {},
    body: {},
    ...request
  };
  
  const mockContext = {
    switchToHttp: () => ({
      getRequest: () => defaultRequest,
    }),
  } as ExecutionContext;
  
  return mockContext;
}

function createMockCallHandler(returnValue: any = 'test'): CallHandler {
  return {
    handle: () => of(returnValue),
  } as CallHandler;
} 