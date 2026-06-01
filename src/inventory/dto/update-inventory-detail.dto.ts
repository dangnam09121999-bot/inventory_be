import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateInventoryDetailDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  packaging?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  company?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  manufacturer?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  lotCode?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  manufacturedAt?: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  expiredAt!: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  receivedAt?: Date;

  @IsOptional()
  @IsString()
  notes?: string;
}
