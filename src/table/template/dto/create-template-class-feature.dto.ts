import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TraitType } from '../../../database/generated/prisma/enums';

export class CreateTemplateClassFeatureDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: TraitType })
  @IsEnum(TraitType)
  type: TraitType;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsInt()
  levelRequired?: number = 1;
}
