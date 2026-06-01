import { IsInt, IsOptional, IsString, MaxLength, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class InventoryQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(180)
  search?: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;

  @IsOptional()
  @IsString()
  @IsIn([
    'id',
    'name',
    'hospitalId',
    'cas',
    'unit',
    'packaging',
    'quantity',
    'company',
    'manufacturer',
    'country',
    'lotCode',
    'manufacturedAt',
    'expiredAt',
    'receivedAt',
  ])
  sortBy?:
    | 'id'
    | 'name'
    | 'hospitalId'
    | 'cas'
    | 'unit'
    | 'packaging'
    | 'quantity'
    | 'company'
    | 'manufacturer'
    | 'country'
    | 'lotCode'
    | 'manufacturedAt'
    | 'expiredAt'
    | 'receivedAt';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
