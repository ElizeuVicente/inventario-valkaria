import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCurrencyDto {
  @ApiProperty()
  @IsInt()
  @Min(0)
  amount: number;
}
