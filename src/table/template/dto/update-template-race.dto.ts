import { PartialType } from '@nestjs/swagger';
import { CreateTemplateRaceDto } from './create-template-race.dto';

export class UpdateTemplateRaceDto extends PartialType(CreateTemplateRaceDto) {}
