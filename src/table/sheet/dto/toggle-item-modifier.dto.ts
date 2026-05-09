import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ToggleItemModifierDto {
  @ApiProperty()
  @IsBoolean()
  isEquipped: boolean;
}
