import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateInventoryImportHistoryTable1680000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'inventory_import_history',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'itemName', type: 'varchar' },
          { name: 'itemCode', type: 'varchar' },
          { name: 'lot', type: 'varchar' },
          { name: 'expiryDate', type: 'date' },
          { name: 'quantity', type: 'int' },
          { name: 'importedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('inventory_import_history');
  }
}
