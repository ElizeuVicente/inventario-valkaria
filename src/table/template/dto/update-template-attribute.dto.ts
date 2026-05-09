import { PartialType } from '@nestjs/swagger';
import { CreateTemplateAttributeDto } from './create-template-attribute.dto';

export class UpdateTemplateAttributeDto extends PartialType(CreateTemplateAttributeDto) {}
