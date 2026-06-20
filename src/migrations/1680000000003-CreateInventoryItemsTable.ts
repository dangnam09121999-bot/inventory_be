import { MigrationInterface, QueryRunner, Table, TableUnique } from 'typeorm';

export class CreateInventoryItemsTable1680000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'inventory_items',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'name', type: 'varchar', length: '180' },
          { name: 'hospitalId', type: 'varchar', length: '180' },
          { name: 'cas', type: 'varchar', length: '180' },
          { name: 'unit', type: 'varchar', length: '80' },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
    );

    await queryRunner.createUniqueConstraint(
      'inventory_items',
      new TableUnique({
        name: 'UQ_inventory_items_name_hospitalId',
        columnNames: ['name', 'hospitalId'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropUniqueConstraint('inventory_items', 'UQ_inventory_items_name_hospitalId');
    await queryRunner.dropTable('inventory_items');
  }
}
