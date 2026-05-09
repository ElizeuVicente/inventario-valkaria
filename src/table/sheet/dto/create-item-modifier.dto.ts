import { IsString, IsNotEmpty, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateItemModifierDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  attributeName: string;

  @ApiProperty()
  @IsInt()
  modifier: number;
}
