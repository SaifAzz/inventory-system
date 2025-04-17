import { HttpException, HttpStatus } from '@nestjs/common';

export class ProductNotFoundException extends HttpException {
  constructor(id: number) {
    super(`Product with ID ${id} not found`, HttpStatus.NOT_FOUND);
  }
}

export class CategoryNotFoundException extends HttpException {
  constructor() {
    super('Category not found', HttpStatus.NOT_FOUND);
  }
}

export class SuppliersNotFoundException extends HttpException {
  constructor() {
    super('One or more suppliers not found', HttpStatus.NOT_FOUND);
  }
}

export class InvalidProductDataException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
