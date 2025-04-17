import { HttpException, HttpStatus } from '@nestjs/common';

export class TenantNotFoundException extends HttpException {
  constructor(id: string) {
    super(`Tenant with ID ${id} not found`, HttpStatus.NOT_FOUND);
  }
}

export class TenantInactiveException extends HttpException {
  constructor(id: string) {
    super(`Tenant with ID ${id} is inactive`, HttpStatus.FORBIDDEN);
  }
}

export class InvalidTenantException extends HttpException {
  constructor() {
    super('Invalid or inactive tenant', HttpStatus.UNAUTHORIZED);
  }
}

export class TenantDeletionException extends HttpException {
  constructor(id: string) {
    super(
      `Failed to delete tenant with ID ${id}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class DuplicateTenantException extends HttpException {
  constructor(name: string) {
    super(`Tenant with name "${name}" already exists`, HttpStatus.CONFLICT);
  }
}
