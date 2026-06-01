import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateInventoryItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  hospitalId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  cas!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  unit!: string;

}
