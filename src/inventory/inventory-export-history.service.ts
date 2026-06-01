import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryExportHistory } from './inventory-export-history.entity';
import { InventoryDetail } from './inventory-detail.entity';

@Injectable()
export class InventoryExportHistoryService {
  constructor(
    @InjectRepository(InventoryExportHistory)
    private readonly repo: Repository<InventoryExportHistory>,
    @InjectRepository(InventoryDetail)
    private readonly detailRepo: Repository<InventoryDetail>,
  ) {}

  async create(data: Partial<InventoryExportHistory>) {
    return this.repo.save(data);
  }

  async findAll(search?: string, sortBy: string = 'exportedAt', sortOrder: 'ASC' | 'DESC' = 'DESC', fromDate?: string, toDate?: string) {
    const queryBuilder = this.repo.createQueryBuilder('export')
      .leftJoin('inventory_details', 'detail', 'detail.id = export.detailId')
      .leftJoin('inventory_items', 'item', 'item.id = detail.inventory_id');
    
    if (search?.trim()) {
      queryBuilder.where('LOWER(item.name) LIKE LOWER(:search)', {
        search: `%${search.trim()}%`,
      });
    }

    if (fromDate) {
      queryBuilder.andWhere('export.exportedAt >= :fromDate', { fromDate });
    }

    if (toDate) {
      queryBuilder.andWhere('export.exportedAt <= :toDate', { toDate });
    }
    
    const validSortColumns = ['exportedAt', 'lotCode', 'quantity', 'expiredAt'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'exportedAt';
    
    queryBuilder.orderBy(`export.${sortColumn}`, sortOrder);
    
    const records = await queryBuilder.getMany();
    
    // Enrich with item name
    const enriched = await Promise.all(
      records.map(async (record) => {
        const detail = await this.detailRepo.findOne({
          where: { id: record.detailId },
          relations: { inventoryItem: true },
        });
        return {
          ...record,
          itemName: detail?.inventoryItem?.name || '',
          itemId: detail?.inventoryItem?.id || null,
        };
      }),
    );
    
    return enriched;
  }

  async findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  async undoExport(id: number) {
    const record = await this.repo.findOneBy({ id });
    if (!record) {
      throw new NotFoundException('Không tìm thấy bản ghi xuất kho');
    }
    
    if (record.undone) {
      throw new BadRequestException('Bản ghi này đã được hoàn tác rồi');
    }
    
    const now = new Date();
    const exportedAt = new Date(record.exportedAt);
    const diff = (now.getTime() - exportedAt.getTime()) / (1000 * 3600 * 24);
    
    if (diff > 3) {
      throw new BadRequestException('Chỉ có thể hoàn tác trong vòng 3 ngày kể từ ngày xuất');
    }
    
    // Restore stock
    const detail = await this.detailRepo.findOneBy({ id: record.detailId });
    if (detail) {
      detail.quantity += record.quantity;
      await this.detailRepo.save(detail);
    }
    
    record.undone = true;
    return this.repo.save(record);
  }
}
