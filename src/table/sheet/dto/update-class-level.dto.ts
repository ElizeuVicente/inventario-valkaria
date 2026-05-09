import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateClassLevelDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  level: number;
}
