import { PartialType } from '@nestjs/swagger';
import { CreateTemplateClassDto } from './create-template-class.dto';

export class UpdateTemplateClassDto extends PartialType(CreateTemplateClassDto) {}
