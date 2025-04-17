import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({
    example: 'Company Name',
    description: 'The name of the tenant organization',
  })
  name: string;

  @ApiProperty({
    example: 'admin@company.com',
    description: 'The email address of the tenant admin',
  })
  email: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Contact phone number',
  })
  phone: string;

  @ApiProperty({
    example: '123 Business Ave, Suite 100',
    description: 'Physical address of the tenant',
  })
  address: string;
}
