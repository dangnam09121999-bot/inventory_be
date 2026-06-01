import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryImportHistory } from './inventory-import-history.entity';
import { InventoryDetail } from './inventory-detail.entity';
import { InventoryItem } from './inventory.entity';

@Injectable()
export class InventoryImportHistoryService {
  constructor(
    @InjectRepository(InventoryImportHistory)
    private readonly repo: Repository<InventoryImportHistory>,
    @InjectRepository(InventoryDetail)
    private readonly detailRepo: Repository<InventoryDetail>,
    @InjectRepository(InventoryItem)
    private readonly itemRepo: Repository<InventoryItem>,
  ) {}

  async create(data: Partial<InventoryImportHistory>) {
    return this.repo.save(data);
  }

  async findAll(search?: string, sortBy: string = 'receivedAt', sortOrder: 'ASC' | 'DESC' = 'DESC', fromDate?: string, toDate?: string) {
    const queryBuilder = this.repo.createQueryBuilder('import')
      .leftJoin('inventory_details', 'detail', 'detail.id = import.detailId')
      .leftJoin('inventory_items', 'item', 'item.id = detail.inventory_id');
    
    if (search?.trim()) {
      queryBuilder.where('LOWER(item.name) LIKE LOWER(:search)', {
        search: `%${search.trim()}%`,
      });
    }

    if (fromDate) {
      queryBuilder.andWhere('import.receivedAt >= :fromDate', { fromDate });
    }

    if (toDate) {
      queryBuilder.andWhere('import.receivedAt <= :toDate', { toDate });
    }
    
    const validSortColumns = ['receivedAt', 'lotCode', 'quantity', 'expiredAt'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'receivedAt';
    
    queryBuilder.orderBy(`import.${sortColumn}`, sortOrder);
    
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
}
