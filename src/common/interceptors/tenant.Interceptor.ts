import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContextService } from '../services/tenant-context.service';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(private readonly tenantContextService: TenantContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const tenantId =
      request.headers['x-tenant-id'] ||
      request.query.tenantId ||
      request.body?.tenantId;

    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    this.tenantContextService.setTenantId(tenantId);
    request.tenantId = tenantId;

    return next.handle();
  }
}
