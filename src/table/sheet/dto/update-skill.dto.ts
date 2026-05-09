import { IsInt, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSkillDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  value?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isProficient?: boolean;
}
