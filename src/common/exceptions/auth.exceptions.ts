import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidCredentialsException extends HttpException {
  constructor() {
    super('Invalid credentials', HttpStatus.UNAUTHORIZED);
  }
}

export class MissingTenantIdException extends HttpException {
  constructor() {
    super('Tenant ID is required', HttpStatus.UNAUTHORIZED);
  }
}

export class UserAlreadyExistsException extends HttpException {
  constructor(email: string) {
    super(`User with email ${email} already exists`, HttpStatus.CONFLICT);
  }
}

export class UserExistsInAnotherTenantException extends HttpException {
  constructor(email: string) {
    super(
      `User with email ${email} already exists in another tenant`,
      HttpStatus.FORBIDDEN,
    );
  }
}

export class UserNotInTenantException extends HttpException {
  constructor(email: string, tenantId: string) {
    super(
      `User with email ${email} does not have access to tenant ${tenantId}`,
      HttpStatus.FORBIDDEN,
    );
  }
} 