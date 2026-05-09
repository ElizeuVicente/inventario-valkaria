import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SheetStatus } from '../../../database/generated/prisma/enums';

export class CreateSheetDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: SheetStatus, required: false })
  @IsOptional()
  @IsEnum(SheetStatus)
  status?: SheetStatus = SheetStatus.DRAFT;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  raceId?: string;
}
