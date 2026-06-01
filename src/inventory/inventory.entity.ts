import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { InventoryDetail } from './inventory-detail.entity';

@Entity({ name: 'inventory_items' })
@Unique(['name', 'hospitalId'])
export class InventoryItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 180 })
  name!: string;

  @Column({ type: 'varchar', length: 180 })
  hospitalId?: string;

  @Column({ type: 'varchar', length: 180 })
  cas?: string;

  @Column({ type: 'varchar', length: 80 })
  unit!: string;

  quantity?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => InventoryDetail, (detail) => detail.inventoryItem, {
    cascade: true,
    eager: false,
  })
  details!: InventoryDetail[];
}
