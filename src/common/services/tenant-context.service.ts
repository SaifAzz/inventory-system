import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable()
export class TenantContextService {
  private readonly storage: AsyncLocalStorage<string>;

  constructor() {
    this.storage = new AsyncLocalStorage<string>();
  }

  setTenantId(tenantId: string): void {
    this.storage.enterWith(tenantId);
  }

  getTenantId(): string {
    const tenantId = this.storage.getStore();
    if (!tenantId) {
      throw new Error('Tenant context is not set');
    }
    return tenantId;
  }

  async runWithTenant<T>(tenantId: string, fn: () => Promise<T>): Promise<T> {
    return this.storage.run(tenantId, fn);
  }

  clearTenantContext(): void {
    this.storage.disable();
  }
}
