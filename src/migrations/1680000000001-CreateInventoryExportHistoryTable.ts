import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateInventoryExportHistoryTable1680000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'inventory_export_history',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'itemName', type: 'varchar' },
          { name: 'itemCode', type: 'varchar' },
          { name: 'lot', type: 'varchar' },
          { name: 'expiryDate', type: 'date' },
          { name: 'quantity', type: 'int' },
          { name: 'exportType', type: 'varchar' },
          { name: 'exportedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'undone', type: 'boolean', default: false },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('inventory_export_history');
  }
}
