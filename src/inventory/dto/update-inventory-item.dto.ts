import { Type } from 'class-transformer';
import {
	IsInt,
	IsOptional,
	IsString,
	MaxLength,
	Min,
} from 'class-validator';

export class UpdateInventoryItemDto {
	@IsOptional()
	@IsString()
	@MaxLength(180)
	name?: string;

	@IsOptional()
	@IsString()
	@MaxLength(180)
	hospitalId?: string;

	@IsOptional()
	@IsString()
	@MaxLength(180)
	cas?: string;

	@IsOptional()
	@IsString()
	@MaxLength(80)
	unit?: string;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	quantity?: number;
}
