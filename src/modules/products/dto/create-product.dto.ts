import { IsNotEmpty, IsNumber, IsArray, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    example: 'Product Name',
    description: 'The name of the product',
  })
  name: string;

  @ApiProperty({
    example: 'Product description',
    description: 'The description of the product',
  })
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  @ApiProperty({ example: 99.99, description: 'The price of the product' })
  price: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @ApiProperty({
    description: 'The quantity in stock',
    example: 100,
  })
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'The ID of the product category',
    example: 1,
  })
  categoryId: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @ApiProperty({
    description: 'Array of supplier IDs',
    example: [1, 2, 3],
    type: [Number],
  })
  supplierIds: number[];
}
