import { Type } from 'class-transformer';
import { IsInt, Min, IsOptional, IsString } from 'class-validator';

export class ExportStockDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
