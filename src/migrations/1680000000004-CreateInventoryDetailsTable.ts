import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateInventoryDetailsTable1680000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'inventory_details',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'inventory_id', type: 'int' },
          { name: 'packaging', type: 'varchar', length: '80', isNullable: true },
          { name: 'quantity', type: 'int' },
          { name: 'company', type: 'varchar', length: '80', isNullable: true },
          { name: 'manufacturer', type: 'varchar', length: '80', isNullable: true },
          { name: 'country', type: 'varchar', length: '80', isNullable: true },
          { name: 'lotCode', type: 'varchar', length: '80', isNullable: true },
          { name: 'manufacturedAt', type: 'date', isNullable: true },
          { name: 'expiredAt', type: 'date' },
          { name: 'receivedAt', type: 'date' },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'inventory_details',
      new TableForeignKey({
        columnNames: ['inventory_id'],
        referencedTableName: 'inventory_items',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('inventory_details');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.length === 1 && fk.columnNames[0] === 'inventory_id',
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('inventory_details', foreignKey);
    }
    await queryRunner.dropTable('inventory_details');
  }
}
