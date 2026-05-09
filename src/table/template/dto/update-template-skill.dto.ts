import { PartialType } from '@nestjs/swagger';
import { CreateTemplateSkillDto } from './create-template-skill.dto';

export class UpdateTemplateSkillDto extends PartialType(CreateTemplateSkillDto) {}
