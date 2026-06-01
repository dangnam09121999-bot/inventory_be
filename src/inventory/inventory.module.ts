import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { InventoryItem } from './inventory.entity';
import { InventoryDetail } from './inventory-detail.entity';

import { InventoryService } from './inventory.service';
import { InventoryImportHistory } from './inventory-import-history.entity';
import { InventoryImportHistoryService } from './inventory-import-history.service';
import { InventoryImportHistoryController } from './inventory-import-history.controller';
import { InventoryExportHistory } from './inventory-export-history.entity';
import { InventoryExportHistoryService } from './inventory-export-history.service';
import { InventoryExportHistoryController } from './inventory-export-history.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryItem,
      InventoryDetail,
      InventoryImportHistory,
      InventoryExportHistory,
    ]),
  ],
  controllers: [
    InventoryController,
    InventoryImportHistoryController,
    InventoryExportHistoryController,
  ],
  providers: [
    InventoryService,
    InventoryImportHistoryService,
    InventoryExportHistoryService,
  ],
})
export class InventoryModule {}
