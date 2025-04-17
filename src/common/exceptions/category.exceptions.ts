import { HttpException, HttpStatus } from '@nestjs/common';

export class CategoryNotFoundException extends HttpException {
  constructor(id: number) {
    super(`Category with ID ${id} not found`, HttpStatus.NOT_FOUND);
  }
}

export class CategoryAccessDeniedException extends HttpException {
  constructor(id: number) {
    super(`Access denied for category with ID ${id}`, HttpStatus.FORBIDDEN);
  }
}

export class InvalidCategoryDataException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
