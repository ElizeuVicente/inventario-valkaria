import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetRaceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  raceId: string;
}
