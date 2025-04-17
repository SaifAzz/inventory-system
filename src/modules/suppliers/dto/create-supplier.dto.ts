import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({
    example: 'Supplier Co.',
    description: 'The name of the supplier',
  })
  name: string;

  @IsEmail()
  @ApiProperty({
    example: 'contact@supplier.com',
    description: 'The email address of the supplier',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'The phone number of the supplier',
  })
  phone: string;
}
