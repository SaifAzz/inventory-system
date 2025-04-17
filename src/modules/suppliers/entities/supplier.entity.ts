import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  DeleteDateColumn,
  Index,
  ManyToOne,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
@Index(['tenantId', 'name'])
export class Supplier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tenantId: string;

  @Column()
  name: string;

  @IsEmail()
  @ApiProperty({
    example: 'contact@supplier.com',
    description: 'The email address of the supplier',
  })
  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToMany(() => Product, (product) => product.suppliers)
  products: Product[];

  @ManyToOne(() => Tenant)
  tenant: Tenant;
}
