import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';

export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const tenantId =
      request.headers['x-tenant-id'] ||
      request.query.tenantId ||
      request.body?.tenantId;

    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    request.tenantId = tenantId;
    return tenantId;
  },
);

export const ApiTenantId = () =>
  ApiHeader({
    name: 'x-tenant-id',
    description: 'Tenant ID for multi-tenant operations',
    required: true,
    example: 'tenant-123',
  });
