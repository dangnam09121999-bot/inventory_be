import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('inventory_export_history')
export class InventoryExportHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  detailId!: number;

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

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'timestamp' })
  exportedAt!: Date;

  @Column({ default: false })
  undone?: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  performedBy?: string;

  @Column({ type: 'uuid', nullable: true })
  performedById?: string;
}
