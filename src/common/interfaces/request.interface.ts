import { Request } from 'express';
import { Tenant } from '../../modules/tenants/entities/tenant.entity';

export interface RequestWithTenant extends Request {
  tenant?: Tenant;
}
