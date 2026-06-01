import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { InventoryItem } from './inventory.entity';

@Entity({ name: 'inventory_details' })
export class InventoryDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @RelationId((detail: InventoryDetail) => detail.inventoryItem)
  inventoryId!: number;

  @Column({ type: 'varchar', length: 80 })
  packaging?: string;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'varchar', length: 80 })
  company?: string;

  @Column({ type: 'varchar', length: 80 })
  manufacturer?: string;

  @Column({ type: 'varchar', length: 80 })
  country?: string;

  @Column({ type: 'varchar', length: 80 })
  lotCode?: string;

  @Column({ type: 'date', nullable: true })
  manufacturedAt?: Date;

  @Column({ type: 'date' })
  expiredAt!: Date;

  @Column({ type: 'date' })
  receivedAt!: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => InventoryItem, (item) => item.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inventory_id' })
  inventoryItem!: InventoryItem;
}
