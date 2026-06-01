import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('inventory_import_history')
export class InventoryImportHistory {
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

  @Column({ type: 'date' })
  receivedAt!: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
