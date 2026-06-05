import { InventoryExportHistory } from './inventory-export-history.entity';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { from, map, Observable, switchMap } from 'rxjs';
import { InventoryDetail } from './inventory-detail.entity';
import { InventoryItem } from './inventory.entity';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { CreateInventoryDetailDto } from './dto/create-inventory-detail.dto';
import { UpdateInventoryDetailDto } from './dto/update-inventory-detail.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { InventoryImportHistory } from './inventory-import-history.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private readonly inventoryRepository: Repository<InventoryItem>,
    @InjectRepository(InventoryDetail)
    private readonly detailRepository: Repository<InventoryDetail>,
    @InjectRepository(InventoryImportHistory)
    private readonly importHistoryRepository: Repository<InventoryImportHistory>,
    @InjectRepository(InventoryExportHistory)
    private readonly exportHistoryRepository: Repository<InventoryExportHistory>,
  ) {}

  create(payload: CreateInventoryItemDto): Observable<InventoryItem> {
    const item = this.inventoryRepository.create(payload);
    return from(this.inventoryRepository.save(item));
  }

  findAll(
    search?: string,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'asc',
  ): Observable<InventoryItem[]> {
    const sortColumnMap: Record<string, string> = {
      id: 'item.id',
      name: 'item.name',
      hospitalId: 'item.hospitalId',
      cas: 'item.cas',
      unit: 'item.unit',
    };

    const orderDirection = sortOrder === 'desc' ? 'DESC' : 'ASC';

    const queryBuilder = this.inventoryRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.details', 'detail')
      .orderBy(sortColumnMap[sortBy ?? 'id'] ?? 'item.name', orderDirection);

    if (search?.trim()) {
      queryBuilder.where('LOWER(item.name) LIKE LOWER(:search)', {
        search: `%${search.trim()}%`,
      });
      queryBuilder.orWhere('LOWER(item.cas) LIKE LOWER(:search)', {
        search: `%${search.trim()}%`,
      });
    }

    return from(queryBuilder.getMany()).pipe(
      map((items) => {
        const mappedItems = items.map((item) => {
          item.quantity =
            item.details?.reduce((sum, detail) => sum + detail.quantity, 0) ??
            0;
          return item;
        });

        if (sortBy === 'quantity') {
          return mappedItems.sort((a, b) => {
            const aQty = a.quantity ?? 0;
            const bQty = b.quantity ?? 0;
            return sortOrder === 'desc' ? bQty - aQty : aQty - bQty;
          });
        }

        return mappedItems;
      }),
    );
  }

  update(
    id: number,
    payload: UpdateInventoryItemDto,
  ): Observable<InventoryItem> {
    return from(this.inventoryRepository.findOne({ where: { id } })).pipe(
      switchMap((item) => {
        if (!item) {
          throw new NotFoundException('Inventory item not found');
        }

        Object.assign(item, payload);
        return from(this.inventoryRepository.save(item));
      }),
    );
  }

  findOneWithDetails(id: number): Observable<InventoryItem> {
    return from(
      this.inventoryRepository.findOne({
        where: { id },
        relations: { details: true },
      }),
    ).pipe(
      map((item) => {
        if (!item) {
          throw new NotFoundException('Inventory item not found');
        }
        item.quantity =
          item.details?.reduce((sum, detail) => sum + detail.quantity, 0) ?? 0;
        return item;
      }),
    );
  }

  createDetail(
    itemId: number,
    payload: CreateInventoryDetailDto,
    actor?: { id?: string; username?: string },
  ): Observable<InventoryDetail> {
    return from(
      this.inventoryRepository.findOne({ where: { id: itemId } }),
    ).pipe(
      switchMap((item) => {
        console.log('Creating detail for item:', item);
        if (!item) {
          throw new NotFoundException('Inventory item not found');
        }

        const detail = this.detailRepository.create({
          ...payload,
          inventoryItem: item,
        });

        return from(this.detailRepository.save(detail)).pipe(
          switchMap((savedDetail) => {
            // Lưu lịch sử nhập kho
            const importHistory = this.importHistoryRepository.create({
              detailId: savedDetail.id,
              packaging: savedDetail.packaging,
              company: savedDetail.company,
              manufacturer: savedDetail.manufacturer,
              country: savedDetail.country,
              lotCode: savedDetail.lotCode,
              manufacturedAt: savedDetail.manufacturedAt,
              expiredAt: savedDetail.expiredAt,
              quantity: savedDetail.quantity,
              receivedAt: savedDetail.receivedAt,
              notes: savedDetail.notes,
              performedBy: actor?.username,
              performedById: actor?.id,
            });
            return from(this.importHistoryRepository.save(importHistory)).pipe(
              map(() => savedDetail),
            );
          }),
        );
      }),
    );
  }

  updateDetail(
    detailId: number,
    payload: UpdateInventoryDetailDto,
  ): Observable<InventoryDetail> {
    return from(
      this.detailRepository.findOne({ where: { id: detailId } }),
    ).pipe(
      switchMap((detail) => {
        if (!detail) {
          throw new NotFoundException('Inventory detail not found');
        }

        Object.assign(detail, payload);
        return from(this.detailRepository.save(detail));
      }),
    );
  }

  deleteDetail(detailId: number): Observable<{ deleted: boolean }> {
    return from(
      this.detailRepository.findOne({ where: { id: detailId } }),
    ).pipe(
      switchMap((detail) => {
        if (!detail) {
          throw new NotFoundException('Inventory detail not found');
        }

        return from(this.detailRepository.remove(detail)).pipe(
          map(() => ({ deleted: true })),
        );
      }),
    );
  }

  exportDetail(detailId: number, quantity: number, notes?: string, actor?: { id?: string; username?: string }): Observable<InventoryDetail> {
    return from(
      this.detailRepository.findOne({
        where: { id: detailId },
      }),
    ).pipe(
      switchMap((detail) => {
        if (!detail) {
          throw new NotFoundException('Inventory detail not found');
        }

        if (detail.quantity < quantity) {
          throw new BadRequestException(
            'Export quantity exceeds available lot stock',
          );
        }

        detail.quantity -= quantity;

        return from(this.detailRepository.save(detail)).pipe(
          switchMap((item) => {
            const exportHistory = this.exportHistoryRepository.create({
              detailId: item.id,
              quantity: quantity,
              packaging: item.packaging,
              company: item.company,
              manufacturer: item.manufacturer,
              country: item.country,
              lotCode: item.lotCode,
              expiredAt: item.expiredAt,
              exportedAt: new Date(),
              notes: notes || undefined,
              performedBy: actor?.username,
              performedById: actor?.id,
            });
            return from(this.exportHistoryRepository.save(exportHistory)).pipe(
              map(() => item),
            );
          }),
        );
      }),
    );
  }

  exportStock(id: number, quantity: number, notes?: string, actor?: { id?: string; username?: string }): Observable<InventoryDetail> {
    return from(
      this.detailRepository.findOne({
        where: { id },
      }),
    ).pipe(
      switchMap((item) => {
        if (!item) {
          throw new NotFoundException('Inventory item not found');
        }

        const available = item.quantity ?? 0;
        if (quantity > available) {
          throw new BadRequestException(
            'Export quantity exceeds available stock',
          );
        }

        let remaining = item.quantity - quantity;
        return from(
          this.detailRepository.save({ ...item, quantity: remaining }),
        ).pipe(
          switchMap(() => {
            // Lưu lịch sử xuất kho
            const exportHistory = this.exportHistoryRepository.create({
              detailId: item.id,
              quantity: quantity,
              packaging: item.packaging,
              company: item.company,
              manufacturer: item.manufacturer,
              country: item.country,
              lotCode: item.lotCode,
              expiredAt: item.expiredAt,
              exportedAt: new Date(),
              notes: notes || undefined,
              performedBy: actor?.username,
              performedById: actor?.id,
            });
            return from(this.exportHistoryRepository.save(exportHistory)).pipe(
              map(() => item),
            );
          }),
        );
      }),
    );
  }

  getOverview(): Observable<{
    totalItems: number;
    totalQuantity: number;
    expiredLots: number;
    expiringSoonLots: number;
  }> {
    return from(
      this.inventoryRepository.find({ relations: { details: true } }),
    ).pipe(
      map((items) => {
        const totalQuantity = items.reduce(
          (sum, item) =>
            sum +
            (item.details?.reduce(
              (detailSum, detail) => detailSum + detail.quantity,
              0,
            ) ?? 0),
          0,
        );
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const next30Days = new Date(now);
        next30Days.setDate(next30Days.getDate() + 30);
        const toDate = (v: Date | string): Date => (v instanceof Date ? v : new Date(v));
        return {
          totalItems: items.length,
          totalQuantity,
          expiredLots: items.filter((i) =>
            i.details.some((d) => d.quantity > 0 && toDate(d.expiredAt) < now),
          ).length,
          expiringSoonLots: items.filter((i) =>
            i.details.some((d) => {
              if (d.quantity <= 0) return false;
              const exp = toDate(d.expiredAt);
              return exp >= now && exp <= next30Days;
            }),
          ).length,
        };
      }),
    );
  }

  getExpiringItems(): Observable<Array<{ id: number; name: string; detailId: number; lotCode: string; expiredAt: Date }>> {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const next30Days = new Date(now);
    next30Days.setDate(next30Days.getDate() + 30);
    const toDate = (v: Date | string): Date => (v instanceof Date ? v : new Date(v));

    return from(
      this.inventoryRepository.find({ relations: { details: true } }),
    ).pipe(
      map((items) => {
        const result: Array<{ id: number; name: string; detailId: number; lotCode: string; expiredAt: Date }> = [];
        items.forEach((item) => {
          item.details.forEach((detail) => {
            if (detail.quantity <= 0) return;
            const exp = toDate(detail.expiredAt);
            if (exp >= now && exp <= next30Days) {
              result.push({
                id: item.id,
                name: item.name,
                detailId: detail.id,
                lotCode: detail.lotCode || '',
                expiredAt: detail.expiredAt,
              });
            }
          });
        });
        return result;
      }),
    );
  }

  getExpiredItems(): Observable<Array<{ id: number; name: string; detailId: number; lotCode: string; expiredAt: Date }>> {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const toDate = (v: Date | string): Date => (v instanceof Date ? v : new Date(v));

    return from(
      this.inventoryRepository.find({ relations: { details: true } }),
    ).pipe(
      map((items) => {
        const result: Array<{ id: number; name: string; detailId: number; lotCode: string; expiredAt: Date }> = [];
        items.forEach((item) => {
          item.details.forEach((detail) => {
            if (detail.quantity <= 0) return;
            if (toDate(detail.expiredAt) < now) {
              result.push({
                id: item.id,
                name: item.name,
                detailId: detail.id,
                lotCode: detail.lotCode || '',
                expiredAt: detail.expiredAt,
              });
            }
          });
        });
        return result;
      }),
    );
  }
}
