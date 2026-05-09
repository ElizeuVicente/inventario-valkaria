import { IsString, IsNotEmpty, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRaceModifierDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  attributeName: string;

  @ApiProperty()
  @IsInt()
  modifier: number;
}
