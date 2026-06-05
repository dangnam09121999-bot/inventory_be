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
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
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
  @Roles('warehouse')
  create(@Body() payload: CreateInventoryItemDto): Observable<InventoryItem> {
    return this.inventoryService.create(payload);
  }

  @Get()
  @Roles('warehouse', 'viewer')
  findAll(@Query() query: InventoryQueryDto): Observable<InventoryItem[]> {
    return this.inventoryService.findAll(
      query.search,
      query.sortBy,
      query.sortOrder,
    );
  }

  @Get('overview')
  @Roles('warehouse', 'viewer')
  getOverview(): Observable<{
    totalItems: number;
    totalQuantity: number;
    expiredLots: number;
    expiringSoonLots: number;
  }> {
    return this.inventoryService.getOverview();
  }

  @Get('expiring')
  @Roles('warehouse')
  getExpiringItems() {
    return this.inventoryService.getExpiringItems();
  }

  @Get('expired')
  @Roles('warehouse')
  getExpiredItems() {
    return this.inventoryService.getExpiredItems();
  }

  @Patch(':id')
  @Roles('warehouse')
  update(
    @Param('id') id: number,
    @Body() payload: UpdateInventoryItemDto,
  ): Observable<InventoryItem> {
    return this.inventoryService.update(id, payload);
  }

  @Patch(':id/export')
  @Roles('warehouse')
  exportStock(
    @Param('id') id: number,
    @Body() payload: ExportStockDto,
    @CurrentUser() user: AuthUser,
  ): Observable<InventoryDetail> {
    return this.inventoryService.exportStock(id, payload.quantity, payload.notes, {
      id: user.sub,
      username: user.username,
    });
  }

  @Get(':id/details')
  @Roles('warehouse')
  getDetails(@Param('id') id: number): Observable<InventoryItem> {
    return this.inventoryService.findOneWithDetails(id);
  }

  @Post(':id/details')
  @Roles('warehouse')
  createDetail(
    @Param('id') id: number,
    @Body() payload: CreateInventoryDetailDto,
    @CurrentUser() user: AuthUser,
  ): Observable<InventoryDetail> {
    return this.inventoryService.createDetail(id, payload, {
      id: user.sub,
      username: user.username,
    });
  }

  @Patch('details/:detailId')
  @Roles('warehouse')
  updateDetail(
    @Param('detailId') detailId: number,
    @Body() payload: UpdateInventoryDetailDto,
  ): Observable<InventoryDetail> {
    return this.inventoryService.updateDetail(detailId, payload);
  }

  @Patch('details/:detailId/export')
  @Roles('warehouse')
  exportDetail(
    @Param('detailId') detailId: number,
    @Body() payload: { quantity: number; notes?: string },
    @CurrentUser() user: AuthUser,
  ): Observable<InventoryDetail> {
    return this.inventoryService.exportDetail(detailId, payload.quantity, payload.notes, {
      id: user.sub,
      username: user.username,
    });
  }

  @Delete('details/:detailId')
  @Roles('warehouse')
  deleteDetail(
    @Param('detailId') detailId: number,
  ): Observable<{ deleted: boolean }> {
    return this.inventoryService.deleteDetail(detailId);
  }
}
