import { IsString, IsNotEmpty, IsOptional, IsEnum, IsISO8601 } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EffectType } from '../../../database/generated/prisma/enums';

export class CreateEffectDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: EffectType })
  @IsEnum(EffectType)
  type: EffectType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsISO8601()
  expiresAt?: string;
}
