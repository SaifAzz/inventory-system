import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { TenantInterceptor } from '../../common/interceptors/tenant.Interceptor';
import { ApiTenantId } from '../../common/decorators/tenant-id.decorator';
import {
  Pagination,
  ApiPagination,
  PaginationParams,
} from '../../common/decorators/pagination.decorator';

@ApiTags('Suppliers')
@ApiTenantId()
@UseInterceptors(TenantInterceptor)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new supplier' })
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(createSupplierDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all suppliers' })
  @ApiPagination()
  findAll(@Pagination() pagination: PaginationParams) {
    return this.suppliersService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a supplier by id' })
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a supplier' })
  update(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(+id, updateSupplierDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a supplier' })
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(+id);
  }
}
