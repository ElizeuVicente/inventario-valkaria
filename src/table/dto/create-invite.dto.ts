import { IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInviteDto {
  @ApiProperty({ required: false, description: 'ISO 8601 date string' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
