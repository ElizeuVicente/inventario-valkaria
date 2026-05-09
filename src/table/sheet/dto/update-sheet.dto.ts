import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SheetStatus } from '../../../database/generated/prisma/enums';

export class UpdateSheetDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: SheetStatus, required: false })
  @IsOptional()
  @IsEnum(SheetStatus)
  status?: SheetStatus;
}
