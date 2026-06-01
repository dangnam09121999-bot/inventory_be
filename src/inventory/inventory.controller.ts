import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { CreateInventoryDetailDto } from './dto/create-inventory-detail.dto';
import { ExportStockDto } from './dto/export-stock.dto';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { UpdateInventoryDetailDto } from './dto/update-inventory-detail.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { InventoryDetail } from './inventory-detail.entity';
import { InventoryItem } from './inventory.entity';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  create(@Body() payload: CreateInventoryItemDto): Observable<InventoryItem> {
    return this.inventoryService.create(payload);
  }

  @Get()
  findAll(@Query() query: InventoryQueryDto): Observable<InventoryItem[]> {
    return this.inventoryService.findAll(
      query.search,
      query.sortBy,
      query.sortOrder,
    );
  }

  @Get('overview')
  getOverview(): Observable<{
    totalItems: number;
    totalQuantity: number;
    expiredLots: number;
    expiringSoonLots: number;
  }> {
    return this.inventoryService.getOverview();
  }

  @Get('expiring')
  getExpiringItems() {
    return this.inventoryService.getExpiringItems();
  }

  @Get('expired')
  getExpiredItems() {
    return this.inventoryService.getExpiredItems();
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() payload: UpdateInventoryItemDto,
  ): Observable<InventoryItem> {
    return this.inventoryService.update(id, payload);
  }

  @Patch(':id/export')
  exportStock(
    @Param('id') id: number,
    @Body() payload: ExportStockDto,
  ): Observable<InventoryDetail> {
    return this.inventoryService.exportStock(id, payload.quantity, payload.notes);
  }

  @Get(':id/details')
  getDetails(@Param('id') id: number): Observable<InventoryItem> {
    return this.inventoryService.findOneWithDetails(id);
  }

  @Post(':id/details')
  createDetail(
    @Param('id') id: number,
    @Body() payload: CreateInventoryDetailDto,
  ): Observable<InventoryDetail> {
    return this.inventoryService.createDetail(id, payload);
  }

  @Patch('details/:detailId')
  updateDetail(
    @Param('detailId') detailId: number,
    @Body() payload: UpdateInventoryDetailDto,
  ): Observable<InventoryDetail> {
    return this.inventoryService.updateDetail(detailId, payload);
  }

  @Patch('details/:detailId/export')
  exportDetail(
    @Param('detailId') detailId: number,
    @Body() payload: { quantity: number; notes?: string },
  ): Observable<InventoryDetail> {
    return this.inventoryService.exportDetail(detailId, payload.quantity, payload.notes);
  }

  @Delete('details/:detailId')
  deleteDetail(
    @Param('detailId') detailId: number,
  ): Observable<{ deleted: boolean }> {
    return this.inventoryService.deleteDetail(detailId);
  }
}
