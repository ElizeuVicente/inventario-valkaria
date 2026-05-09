import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRpgSystemDto {
  @ApiProperty({ description: 'Name of the RPG system' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Description of the RPG system' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether this is an official system', default: false })
  @IsOptional()
  @IsBoolean()
  isOfficial?: boolean;
}
