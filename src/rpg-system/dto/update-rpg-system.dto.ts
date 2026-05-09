import { PartialType } from '@nestjs/swagger';
import { CreateRpgSystemDto } from './create-rpg-system.dto';

export class UpdateRpgSystemDto extends PartialType(CreateRpgSystemDto) {}
