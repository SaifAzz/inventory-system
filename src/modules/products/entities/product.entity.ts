import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity()
@Index(['tenantId', 'name'])
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  tenantId: string;

  @Index()
  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column()
  quantity: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Index()
  @DeleteDateColumn()
  deletedAt?: Date;

  @Index()
  @Column()
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.products)
  category: Category;

  @ManyToMany(() => Supplier, (supplier) => supplier.products)
  @JoinTable()
  suppliers: Supplier[];

  @ManyToOne(() => Tenant)
  tenant: Tenant;
}
