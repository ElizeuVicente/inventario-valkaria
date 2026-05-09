import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TableVisibility } from '../../database/generated/prisma/enums';

export class CreateTableDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  systemId?: string;

  @ApiProperty({ enum: TableVisibility, required: false, default: 'PUBLIC' })
  @IsOptional()
  @IsEnum(TableVisibility)
  visibility?: TableVisibility = TableVisibility.PUBLIC;
}
