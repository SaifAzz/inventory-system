import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export interface PaginationParams {
  page: number;
  perPage: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PaginationParams => {
    const request = ctx.switchToHttp().getRequest();
    const page = request.query.page ? parseInt(request.query.page, 10) : 1;
    const perPage = request.query.perPage
      ? parseInt(request.query.perPage, 10)
      : 10;

    const validPage = Math.max(1, page);
    const validPerPage = Math.min(Math.max(1, perPage), 100);

    return {
      page: validPage,
      perPage: validPerPage,
    };
  },
);

export const ApiPagination = () => {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number (starts from 1)',
      example: 1,
    })(target, propertyKey, descriptor);

    ApiQuery({
      name: 'perPage',
      required: false,
      type: Number,
      description: 'Number of items per page (max: 100)',
      example: 10,
    })(target, propertyKey, descriptor);
  };
};
