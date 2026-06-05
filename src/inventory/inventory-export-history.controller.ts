import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { InventoryExportHistoryService } from './inventory-export-history.service';

@Controller('inventory/export-history')
@Roles('warehouse')
export class InventoryExportHistoryController {
  constructor(private readonly service: InventoryExportHistoryService) {}

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.service.findAll(search, sortBy, sortOrder, fromDate, toDate);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(Number(id));
  }

  @Patch(':id/undo')
  undoExport(@Param('id') id: number) {
    return this.service.undoExport(Number(id));
  }
}
