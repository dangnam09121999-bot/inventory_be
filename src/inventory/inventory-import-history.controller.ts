import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { InventoryImportHistoryService } from './inventory-import-history.service';

@Controller('inventory/import-history')
@Roles('warehouse')
export class InventoryImportHistoryController {
  constructor(private readonly service: InventoryImportHistoryService) {}

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
}
