import { HttpException, HttpStatus } from '@nestjs/common';

export class SupplierNotFoundException extends HttpException {
  constructor(id: number) {
    super(`Supplier with ID ${id} not found`, HttpStatus.NOT_FOUND);
  }
}

export class SupplierAccessDeniedException extends HttpException {
  constructor(id: number) {
    super(`Access denied for supplier with ID ${id}`, HttpStatus.FORBIDDEN);
  }
}

export class InvalidSupplierDataException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class SupplierDeletionException extends HttpException {
  constructor(id: number) {
    super(
      `Failed to delete supplier with ID ${id}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
