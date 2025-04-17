import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantsService } from '../../modules/tenants/tenants.service';
import { TenantContextService } from '../services/tenant-context.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly tenantContextService: TenantContextService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return next();
    }

    try {
      const tenant = await this.tenantsService.findOne(tenantId);
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      this.tenantContextService.setTenantId(tenantId);
      next();
    } catch (error) {
      next(error);
    }
  }
}
