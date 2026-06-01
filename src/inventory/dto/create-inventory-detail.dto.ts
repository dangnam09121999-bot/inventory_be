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

export class CreateInventoryDetailDto {
  @IsString()
  @IsOptional()
  @MaxLength(80)
  packaging?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity!: number;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  company?: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  manufacturer?: string;

  @IsString()
  @IsOptional()
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

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  expiredAt!: Date;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  receivedAt!: Date;

  @IsOptional()
  @IsString()
  notes?: string;
}
