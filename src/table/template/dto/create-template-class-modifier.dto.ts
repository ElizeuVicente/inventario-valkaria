import { IsString, IsNotEmpty, IsInt, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTemplateClassModifierDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  attributeName: string;

  @ApiProperty()
  @IsInt()
  modifier: number;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  perLevel?: boolean = false;
}
