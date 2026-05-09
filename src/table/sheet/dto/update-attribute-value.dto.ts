import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAttributeValueDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  value: string;
}
