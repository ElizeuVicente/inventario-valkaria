import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JoinRequestStatus } from '../../database/generated/prisma/enums';

export class HandleJoinRequestDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsNotEmpty()
  @IsEnum(['APPROVED', 'REJECTED'])
  status: 'APPROVED' | 'REJECTED';
}
